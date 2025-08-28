/**
 * Validation utility functions for request data
 */

/**
 * Validate email format
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Boolean indicating if password meets requirements
 */
export const isStrongPassword = (password: string): boolean => {
  // Password should be at least 8 characters long
  // and contain at least one uppercase letter, one lowercase letter, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate required fields in an object
 * @param obj Object to validate
 * @param fields Array of required field names
 * @returns Object with validation errors, empty if valid
 */
export const validateRequired = (obj: Record<string, any>, fields: string[]): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors[field] = `${field} is required`;
    }
  }

  return errors;
};

/**
 * Validate that a value is a number within a specified range
 * @param value Value to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Boolean indicating if value is within range
 */
export const isNumberInRange = (value: number, min: number, max: number): boolean => {
  return !isNaN(value) && value >= min && value <= max;
};

/**
 * Validate that a string is within a specified length range
 * @param str String to validate
 * @param minLength Minimum length (inclusive)
 * @param maxLength Maximum length (inclusive)
 * @returns Boolean indicating if string length is within range
 */
export const isStringLengthValid = (str: string, minLength: number, maxLength: number): boolean => {
  return str.length >= minLength && str.length <= maxLength;
};