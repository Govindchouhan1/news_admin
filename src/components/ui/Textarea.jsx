import React, { forwardRef } from 'react';

const Textarea = forwardRef(
  ({ label, error, hint, rows = 4, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        <textarea
          ref={ref}
          rows={rows}
          className={`input-field resize-none ${error ? 'error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
