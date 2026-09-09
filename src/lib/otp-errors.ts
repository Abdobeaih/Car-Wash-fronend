/**
 * Maps raw API error messages (already extracted from the NestJS
 * `{ statusCode, message, error }` shape by `apiRequest`) onto user-facing,
 * locale-aware messages for the OTP verification screens.
 */
export function getOtpErrorMessage(
  err: unknown,
  fallback: string,
  t: (key: string) => string,
): string {
  if (!(err instanceof Error)) return fallback;
  const status = (err as { status?: number }).status;
  const msg = err.message.toLowerCase();

  if (status === 429 || /rate\s*limit|too many requests?/.test(msg)) {
    return t('errorRateLimited');
  }
  if (/too many (failed )?attempts|max(imum)? attempts?/.test(msg)) {
    return t('errorMaxAttempts');
  }
  if (/expired|no longer valid/.test(msg)) {
    return t('errorExpiredOtp');
  }
  if (/resend.*(soon|wait|cooldown)|too soon/.test(msg)) {
    return t('errorResendTooSoon');
  }
  if (/invalid (otp|code)|incorrect (otp|code)|wrong (otp|code)/.test(msg)) {
    return t('errorWrongOtp');
  }
  if (status === 502 || status === 503 || /unreachable|network|gateway/.test(msg)) {
    return t('errorNetwork');
  }
  return fallback;
}