import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  const errorId = inputId ? `${inputId}-error` : undefined;
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <input
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({ label, error, id, children, className = '', ...rest }: SelectProps) {
  const selectId = id ?? rest.name;
  const errorId = selectId ? `${selectId}-error` : undefined;
  return (
    <div className="mb-4">
      <label htmlFor={selectId} className="label">
        {label}
      </label>
      <select
        id={selectId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}