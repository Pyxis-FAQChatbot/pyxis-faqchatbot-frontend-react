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
                <label className="text-sm font-medium text-slate-600 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 
          text-slate-800 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white
          transition-all duration-300
          ${error ? 'ring-2 ring-red-500/50 bg-red-50/50' : ''}
        `}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
};

export default Input;
