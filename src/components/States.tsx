'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from './Button';

export function LoadingState({ label }: { label?: string }) {
  const t = useTranslations('Common');
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-20 text-gray-500"
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-8 w-8 text-brand-600" />
      <p className="text-sm">{label ?? t('loading')}</p>
    </div>
  );
}

function EmptyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 9h10M7 13h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <EmptyIcon />
      </div>
      <h3 className="mt-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const t = useTranslations('Common');
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8v5M12 16.5v.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          {t('tryAgain')}
        </button>
      )}
    </div>
  );
}

const alertIcons = {
  error: (
    <path d="M12 8v5M12 16.5v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
  success: (
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  info: (
    <path d="M12 8v5M12 16.5v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
};

const alertStyles = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export function Alert({
  type,
  children,
}: {
  type: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  return (
    <div
      className={`mb-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${alertStyles[type]}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          {alertIcons[type]}
        </svg>
      </span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}