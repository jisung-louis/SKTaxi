import { ALLOWED_EMAIL_DOMAINS } from '../config/firebase';

export const validateEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1];
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && validateEmailDomain(email);
}; 