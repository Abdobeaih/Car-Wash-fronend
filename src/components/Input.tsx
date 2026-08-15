import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <input id={inputId} className={`input ${error ? 'border-red-500' : ''} ${className}`} {...rest} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
  return (
    <div className="mb-4">
      <label htmlFor={selectId} className="label">
        {label}
      </label>
      <select id={selectId} className={`input ${error ? 'border-red-500' : ''} ${className}`} {...rest}>
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}