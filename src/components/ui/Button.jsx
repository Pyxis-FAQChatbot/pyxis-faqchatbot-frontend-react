import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseStyles = "w-full py-3.5 px-6 rounded-2xl font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5",
        secondary: "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700",
        ghost: "bg-transparent text-slate-500 hover:text-primary hover:bg-primary/5",
        danger: "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
