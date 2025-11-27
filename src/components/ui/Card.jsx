import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-glass rounded-3xl p-6 transition-colors duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
