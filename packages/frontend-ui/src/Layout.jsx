import React from 'react';
import styles from './Layout.module.css';

export default function Layout({ children }) {
    return <div className={styles.layout}>{children}</div>;
}

Layout.Sidebar = function Sidebar({ children, className = '' }) {
    return <aside className={`${styles.sidebar} ${className}`}>{children}</aside>;
};

Layout.Main = function Main({ children, className = '' }) {
    return <main className={`${styles.main} ${className}`}>{children}</main>;
};

Layout.Header = function Header({ children, className = '' }) {
    return <header className={`${styles.header} ${className}`}>{children}</header>;
};
