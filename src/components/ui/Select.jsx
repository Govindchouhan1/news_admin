import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  ({ label, error, options = [], placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={`input-field appearance-none pr-8 ${error ? 'error' : ''} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
