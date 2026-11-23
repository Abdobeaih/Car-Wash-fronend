/** Never expose untranslated server text on account screens. */
export function getAuthErrorMessage(error:unknown,fallback:string,t:(key:string)=>string):string {
 if(!(error instanceof Error))return fallback;
 const message=error.message.toLowerCase();
 const status=(error as Error & {status?:number}).status;
 if(/invalid email or password/.test(message))return t('credentials');
 if(/verify your email before/.test(message))return t('verifyEmail');
 if(/account with this email already exists|email.*already.*(exists|registered)/.test(message))return t('emailExists');
 if(/current password is incorrect/.test(message))return t('currentPassword');
 if(/passwords do not match/.test(message))return t('passwordMismatch');
 if(/password.*72.*bytes/.test(message))return t('passwordLong');
 if(/password.*(shorter|at least|longer than or equal)/.test(message))return t('passwordShort');
 if(/email.*must be an email|valid email/.test(message))return t('emailInvalid');
 if(/no active password reset|no verification code|code unavailable/.test(message))return t('requestCode');
 if(/code.*expired|expired.*code/.test(message))return t('codeExpired');
 if(/incorrect.*code|code.*incorrect|invalid.*code/.test(message))return t('codeInvalid');
 if(status===429 || /too many|throttler|rate limit/.test(message))return t('rateLimited');
 if(status===502 || status===503 || /fetch|network|unreachable|gateway|offline/.test(message))return t('network');
 if(status===400 || /must be|should not|must contain|validation/.test(message))return t('validation');
 return fallback;
}
