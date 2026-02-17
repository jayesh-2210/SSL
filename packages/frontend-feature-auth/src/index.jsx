import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '@sym/frontend-ui';
import { useForm, useApi } from '@sym/frontend-hooks';
import { authStore } from '@sym/frontend-state';
import { loginSchema, registerSchema } from '@sym/fnd-validation';
import styles from './Auth.module.css';

export function LoginPage() {
    const navigate = useNavigate();
    const api = useApi();
    const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
        email: '',
        password: '',
    });

    const onSubmit = handleSubmit(async (data) => {
        const res = await api.post('/auth/login', data);
        authStore.setAuth(res.data.user, res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        navigate('/dashboard');
    }, (v) => loginSchema.safeParse(v));

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <Card.Body>
                    <h1 className={styles.title}>Welcome back</h1>
                    <p className={styles.subtitle}>Sign in to your account</p>
                    <form onSubmit={onSubmit} className={styles.form}>
                        <Input label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
                        <Input label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />
                        {errors._form && <p className={styles.formError}>{errors._form}</p>}
                        <Button type="submit" loading={isSubmitting}>Sign In</Button>
                    </form>
                </Card.Body>
            </Card>
        </div>
    );
}

export function RegisterPage() {
    const navigate = useNavigate();
    const api = useApi();
    const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const onSubmit = handleSubmit(async (data) => {
        const res = await api.post('/auth/register', data);
        authStore.setAuth(res.data.user, res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        navigate('/dashboard');
    }, (v) => registerSchema.safeParse(v));

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <Card.Body>
                    <h1 className={styles.title}>Create account</h1>
                    <p className={styles.subtitle}>Get started with SYM</p>
                    <form onSubmit={onSubmit} className={styles.form}>
                        <Input label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} placeholder="Your name" />
                        <Input label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
                        <Input label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} placeholder="Min. 8 characters" />
                        {errors._form && <p className={styles.formError}>{errors._form}</p>}
                        <Button type="submit" loading={isSubmitting}>Create Account</Button>
                    </form>
                </Card.Body>
            </Card>
        </div>
    );
}
