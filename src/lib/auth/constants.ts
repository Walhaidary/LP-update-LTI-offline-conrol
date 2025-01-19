export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  SESSION_TIMEOUT: 3600, // 1 hour in seconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 300, // 5 minutes in seconds
} as const;

export const PASSWORD_REQUIREMENTS = {
  minLength: AUTH_CONSTANTS.MIN_PASSWORD_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const;