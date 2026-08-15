'use client';

import { useState, type FocusEvent, type InputHTMLAttributes } from 'react';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function currentTime(stepMinutes = 5): string {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const rounded = Math.round(minutes / stepMinutes) * stepMinutes;
  const h = Math.floor(rounded / 60) % 24;
  const m = rounded % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface TimeInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  useNow?: boolean;
  nowLabel?: string;
  onNow?: () => void;
}

export default function TimeInput({
  label,
  value,
  onChange,
  error,
  useNow = true,
  nowLabel = 'Use current time',
  onNow,
  id,
  onBlur,
  ...rest
}: TimeInputProps) {
  const inputId = id ?? rest.name ?? 'time';
  const [touched, setTouched] = useState(false);

  const formatError =
    touched && value !== '' && !isValidTime(value)
      ? 'Enter a valid time in HH:MM format (e.g. 09:30).'
      : undefined;

  const resolvedError = error ?? formatError;

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    onBlur?.(e);
  };

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <div className="flex items-start gap-2">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          maxLength={5}
          autoComplete="off"
          placeholder="HH:MM"
          className={`input ${resolvedError ? 'border-red-500' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          aria-invalid={resolvedError ? true : undefined}
          {...rest}
        />
        {useNow && (
          <button
            type="button"
            className="btn-secondary shrink-0"
            onClick={() => (onNow ? onNow() : onChange(currentTime()))}
          >
            {nowLabel}
          </button>
        )}
      </div>
      {resolvedError && <p className="mt-1 text-sm text-red-600">{resolvedError}</p>}
    </div>
  );
}