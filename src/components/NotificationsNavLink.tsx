'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

export default function NotificationsNavLink({
  href,
  label,
  className = '',
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const unread = await apiRequest<number>('/notifications/unread-count', { auth: true });
      setCount(unread);
    } catch {
      // ignore — badge is decorative
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Link href={href} className={className}>
      <span className="flex items-center gap-2">
        {label}
        {count > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </span>
    </Link>
  );
}