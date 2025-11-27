import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white/80 backdrop-blur-xl border border-white/20 shadow-glass rounded-3xl p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
