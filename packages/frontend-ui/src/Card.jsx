import React from 'react';
import styles from './Card.module.css';

export default function Card({ children, className = '', hover = false, ...props }) {
    return (
        <div className={`${styles.card} ${hover ? styles.hover : ''} ${className}`} {...props}>
            {children}
        </div>
    );
}

Card.Header = function CardHeader({ children, className = '' }) {
    return <div className={`${styles.header} ${className}`}>{children}</div>;
};

Card.Body = function CardBody({ children, className = '' }) {
    return <div className={`${styles.body} ${className}`}>{children}</div>;
};
