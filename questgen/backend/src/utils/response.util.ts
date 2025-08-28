import { Response } from 'express';

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Send a success response
 * @param res Express response object
 * @param data Data to send in the response
 * @param message Success message
 * @param statusCode HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message = 'Success',
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param res Express response object
 * @param message Error message
 * @param statusCode HTTP status code (default: 500)
 * @param error Error object or string
 */
export const sendError = (
  res: Response,
  message = 'Internal server error',
  statusCode = 500,
  error?: Error | string
): void => {
  const response: ApiResponse<null> = {
    success: false,
    message,
  };

  if (error) {
    if (error instanceof Error) {
      response.error = process.env.NODE_ENV === 'development' ? error.message : undefined;
    } else {
      response.error = process.env.NODE_ENV === 'development' ? error : undefined;
    }
  }

  res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 * @param res Express response object
 * @param errors Validation errors
 * @param message Error message
 */
export const sendValidationError = (
  res: Response,
  errors: Record<string, string>,
  message = 'Validation error'
): void => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    errors,
  };

  res.status(400).json(response);
};