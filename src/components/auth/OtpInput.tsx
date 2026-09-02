'use client';

import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';

const LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({ value, onChange, disabled = false, autoFocus = true }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = useCallback(
    (index: number) => {
      const el = inputRefs.current[index];
      if (el) {
        el.focus();
        el.select();
      }
    },
    [],
  );

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (!/^\d*$/.test(digit)) return;
      const chars = value.split('');
      chars[index] = digit;
      const next = chars.join('').slice(0, LENGTH);
      onChange(next);
      if (digit && index < LENGTH - 1) {
        focusInput(index + 1);
      }
    },
    [value, onChange, focusInput],
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        const chars = value.split('');
        if (chars[index]) {
          chars[index] = '';
          onChange(chars.join(''));
        } else if (index > 0) {
          chars[index - 1] = '';
          onChange(chars.join(''));
          focusInput(index - 1);
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusInput(index - 1);
      } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
        focusInput(index + 1);
      }
    },
    [value, onChange, focusInput],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
      if (pasted) {
        onChange(pasted);
        const nextIndex = Math.min(pasted.length, LENGTH - 1);
        focusInput(nextIndex);
      }
    },
    [onChange, focusInput],
  );

  const digits = value.split('');

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={digits[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-12 rounded-lg border border-gray-300 bg-white text-center font-display text-xl font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 sm:h-14 sm:w-14 sm:text-2xl"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
