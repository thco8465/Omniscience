// UserProfileFacade.js
//acts as a simplified and unified interface for fetching user data, abstracting away the complexities and
//details of the underlying implementation.
//aligns with the principles of the facade design pattern
import axios from 'axios';

// Custom error classes for different types of failures
export class UserDataError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export class NetworkError extends UserDataError {
  constructor(message, originalError) {
    super(message, null, originalError);
    this.name = 'NetworkError';
  }
}

export class ApiError extends UserDataError {
  constructor(message, statusCode, originalError) {
    super(message, statusCode, originalError);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends UserDataError {
  constructor(message, statusCode, originalError) {
    super(message, statusCode, originalError);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends UserDataError {
  constructor(message, fieldErrors = {}, originalError = null) {
    super(message, 400, originalError);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export default class UserProfileFacade {
    async fetchUserData(username) {
        try {
            const response = await axios.get(`/userData/${username}`);

            if (response.data.success) {
                return response.data.user;
            } else {
                // Handle API-level errors with proper error object
                const errorMessage = response.data.message || 'User data fetch failed';
                console.error('User data fetch failed:', errorMessage);

                // Differentiate between different types of API errors based on available information
                if (response.data.code === 'auth_failed' || response.status === 401 || response.status === 403) {
                    throw new AuthenticationError(errorMessage, response.status, null);
                } else if (response.data.validationErrors) {
                    throw new ValidationError(errorMessage, response.data.validationErrors, null);
                } else {
                    throw new ApiError(errorMessage, response.status, null);
                }
            }
        } catch (error) {
            // If error is already one of our custom errors, just rethrow it
            if (error instanceof UserDataError) {
                throw error;
            }

            // Handle network or unexpected errors
            const errorMessage = error.message || 'Unknown error occurred';
            console.error('Error fetching user data:', error);

            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    // Network error (no response received)
                    throw new NetworkError('Network error: Unable to connect to the server', error);
                } else {
                    // HTTP error
                    const statusCode = error.response.status;

                    if (statusCode === 401 || statusCode === 403) {
                        throw new AuthenticationError('Authentication failed', statusCode, error);
                    } else if (statusCode === 400) {
                        throw new ValidationError('Invalid request', error.response.data?.validationErrors, error);
                    } else if (statusCode >= 500) {
                        throw new ApiError(`Server error (${statusCode})`, statusCode, error);
                    } else {
                        throw new ApiError(`API error (${statusCode})`, statusCode, error);
                    }
                }
            } else {
                // Unexpected error
                throw new UserDataError('Unexpected error occurred', null, error);
            }
        }
    }
}