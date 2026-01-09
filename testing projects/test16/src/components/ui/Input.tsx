import React from 'react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string;
  error?: string;
  containerClassName?: string;
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerClassName = '',
  className = '',
  id,
  ...props
}) => {
  // React.useId() must be called unconditionally at the top level of a functional component.
  const generatedId = React.useId();

  // Determine the final ID to use.
  const finalInputId = id ?? generatedId;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
      {label && (
        <label 
          htmlFor={finalInputId} 
          className="text-sm font-bold text-slate-700 ml-1"
        >
          {label}
        </label>
      )}
      <input
        // Use the guaranteed string ID
        id={finalInputId} 
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 outline-none',
          'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400',
          'focus:border-[#3A29FF] focus:ring-4 focus:ring-indigo-100', // Changed focus ring color for better accessibility contrast
          error ? 'border-[#FF3232] focus:border-[#FF3232] focus:ring-red-100' : '', // Changed focus ring color
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-semibold text-[#FF3232] ml-1 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};