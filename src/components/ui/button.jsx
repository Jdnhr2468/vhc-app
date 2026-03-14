import React from 'react';

export function Button({ children, variant = 'contained', size = 'default', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md transition-colors';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm',
  };

  const variants = {
    contained: 'bg-[#4CC27D] text-white',
    outline: 'bg-transparent border border-gray-200 text-gray-700',
  };

  return (
    <button className={`${base} ${sizes[size] || sizes.default} ${variants[variant] || ''} ${className}`} {...props}>
      {children}
    </button>
  );
}
