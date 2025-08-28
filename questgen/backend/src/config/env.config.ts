import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define interface for environment variables
interface EnvConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
}

// Export environment variables with proper types
export const env: EnvConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

// Validate required environment variables
export const validateEnv = (): void => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set, using default value');
  }
  
  if (!process.env.JWT_REFRESH_SECRET) {
    console.warn('JWT_REFRESH_SECRET is not set, using default value');
  }
};