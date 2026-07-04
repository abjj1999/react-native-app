const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const getEmailError = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) return "Email address is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return null;
};

export const getPasswordError = (
  password: string,
  options: { strict?: boolean } = {},
): string | null => {
  if (!password) return "Password is required.";
  if (!options.strict) return null;
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password))
    return "Password must include at least one letter and one number.";
  return null;
};

export const getCodeError = (code: string): string | null => {
  const trimmed = code.trim();
  if (!trimmed) return "Verification code is required.";
  if (!/^\d{4,8}$/.test(trimmed)) return "Enter the code from your email.";
  return null;
};
