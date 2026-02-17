import { useState, useCallback, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { authStore } from '@sym/frontend-state';

const API_BASE = '/api';

/**
 * Generic API fetcher that attaches auth header.
 */
export function useApi() {
    const { accessToken } = useSnapshot(authStore);

    const request = useCallback(
        async (path, options = {}) => {
            const headers = {
                'Content-Type': 'application/json',
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                ...options.headers,
            };

            const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || `Request failed: ${res.status}`);
            }

            return data;
        },
        [accessToken]
    );

    return { get: (p) => request(p), post: (p, b) => request(p, { method: 'POST', body: JSON.stringify(b) }), patch: (p, b) => request(p, { method: 'PATCH', body: JSON.stringify(b) }), del: (p) => request(p, { method: 'DELETE' }) };
}

/**
 * Data fetching hook with loading/error state.
 */
export function useFetch(path, { immediate = true } = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const api = useApi();

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.get(path);
            setData(result.data);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [path, api]);

    useEffect(() => {
        if (immediate) execute();
    }, []);

    return { data, loading, error, refetch: execute };
}

/**
 * Form state management hook.
 */
export function useForm(initialValues = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const setValue = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
    };

    const handleSubmit = (onSubmit, validate) => async (e) => {
        e.preventDefault();
        if (validate) {
            const result = validate(values);
            if (!result.success) {
                const fieldErrors = {};
                result.error.issues.forEach((issue) => {
                    fieldErrors[issue.path[0]] = issue.message;
                });
                setErrors(fieldErrors);
                return;
            }
        }
        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } catch (err) {
            setErrors({ _form: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return { values, errors, isSubmitting, handleChange, setValue, reset, handleSubmit };
}

/**
 * Debounce hook.
 */
export function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}
