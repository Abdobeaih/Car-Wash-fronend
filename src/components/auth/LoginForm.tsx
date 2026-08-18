"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Alert } from "@/components/States";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Login');
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (next && next.startsWith("/")) {
        router.push(next);
      } else {
        router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("error"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="mt-4 text-center text-2xl font-bold text-gray-900">
        {t("title")}
      </h1>
      <p className="mt-1 text-center text-sm text-gray-500">
        {t("subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="mt-6" noValidate>
        {error && <Alert type="error">{error}</Alert>}

        <Input
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label={t("password")}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="-mt-2 mb-4 text-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={submitting}
          disabled={submitting}
        >
          {t("submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          {t("register")}
        </Link>
      </p>
    </div>
  );
}