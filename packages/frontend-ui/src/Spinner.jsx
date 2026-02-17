import React from 'react';
import styles from './Spinner.module.css';

export default function Spinner({ size = 24, className = '' }) {
    return (
        <svg
            className={`${styles.spinner} ${className}`}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle className={styles.track} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
                className={styles.arc}
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}
