import React, { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, error, hint, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            className={`input-field ${Icon ? 'pl-9' : ''} ${error ? 'error' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
