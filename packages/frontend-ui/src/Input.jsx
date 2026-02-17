import React from 'react';
import styles from './Input.module.css';

export default function Input({
    label,
    error,
    id,
    type = 'text',
    className = '',
    ...props
}) {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
        <div className={`${styles.field} ${className}`}>
            {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
            <input
                id={inputId}
                type={type}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                {...props}
            />
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
