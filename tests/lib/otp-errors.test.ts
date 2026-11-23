import { describe, expect, it } from 'vitest';
import { getOtpErrorMessage } from '@/lib/otp-errors';
import { ApiError } from '@/lib/api';

const t = (key: string) => `<${key}>`;
const FALLBACK = 'fallback';

describe('getOtpErrorMessage', () => {
  it('maps HTTP 429 to the rate-limit copy', () => {
    expect(getOtpErrorMessage(new ApiError(429, 'Whatever'), FALLBACK, t)).toBe('<errorRateLimited>');
  });

  it('maps "too many requests" text to the rate-limit copy', () => {
    expect(getOtpErrorMessage(new Error('Too many requests'), FALLBACK, t)).toBe('<errorRateLimited>');
  });

  it('maps max-attempts lockouts', () => {
    expect(getOtpErrorMessage(new Error('Too many failed attempts'), FALLBACK, t)).toBe('<errorMaxAttempts>');
    expect(getOtpErrorMessage(new Error('Maximum attempts reached'), FALLBACK, t)).toBe('<errorMaxAttempts>');
  });

  it('maps expired codes', () => {
    expect(getOtpErrorMessage(new Error('OTP expired'), FALLBACK, t)).toBe('<errorExpiredOtp>');
  });

  it('maps resend cooldown rejections', () => {
    expect(getOtpErrorMessage(new Error('Resend too soon'), FALLBACK, t)).toBe('<errorResendTooSoon>');
  });

  it('maps wrong codes', () => {
    expect(getOtpErrorMessage(new Error('Invalid OTP'), FALLBACK, t)).toBe('<errorWrongOtp>');
    expect(getOtpErrorMessage(new Error('Incorrect code'), FALLBACK, t)).toBe('<errorWrongOtp>');
  });

  it('maps gateway outages to the network copy', () => {
    expect(getOtpErrorMessage(new ApiError(503, 'Service down'), FALLBACK, t)).toBe('<errorNetwork>');
    expect(getOtpErrorMessage(new Error('Service unreachable'), FALLBACK, t)).toBe('<errorNetwork>');
  });

  it('falls back for unrecognized Error messages', () => {
    expect(getOtpErrorMessage(new Error('Something odd happened'), FALLBACK, t)).toBe(FALLBACK);
  });

  it('falls back for non-Error rejections', () => {
    expect(getOtpErrorMessage('string rejection', FALLBACK, t)).toBe(FALLBACK);
    expect(getOtpErrorMessage(undefined, FALLBACK, t)).toBe(FALLBACK);
  });
});
