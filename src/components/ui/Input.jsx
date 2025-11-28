import React from 'react';

const Input = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className={`w-full space-y-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700
          text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/40 focus:bg-white dark:focus:bg-slate-700
          transition-all duration-300
          ${error ? 'ring-2 ring-red-500/50 dark:ring-red-400/50 bg-red-50/50 dark:bg-red-900/20' : ''}
        `}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 dark:text-red-400 ml-1">{error}</p>
            )}
        </div>
    );
};

export default Input;
