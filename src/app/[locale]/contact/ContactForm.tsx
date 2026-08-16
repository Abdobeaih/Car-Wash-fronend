'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { apiRequest } from '@/lib/api';

export default function ContactForm() {
  const t = useTranslations('ContactForm');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: { name, email, message },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="card mt-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">{t('sentTitle')}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t('sentText')}
        </p>
      </div>
    );
  }

  return (
    <form className="card mt-8" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('name')}
          name="contact-name"
          autoComplete="name"
          required
          placeholder={t('namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label={t('email')}
          name="contact-email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <label htmlFor="contact-message" className="label">
          {t('message')}
        </label>
        <textarea
          id="contact-message"
          className="input min-h-32"
          placeholder={t('messagePlaceholder')}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error && (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-6" loading={submitting} disabled={submitting}>
        {t('send')}
      </Button>
    </form>
  );
}