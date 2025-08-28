# QuestGen Backend API

## Overview

This is the backend API for QuestGen, a quiz generation and participation platform. It provides endpoints for user authentication, quiz creation and management, question management, and quiz participation.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Clone the repository
2. Navigate to the backend directory
   ```
   cd backend
   ```
3. Install dependencies
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/questgen?schema=public"
   PORT=5000
   JWT_SECRET="your-jwt-secret"
   JWT_REFRESH_SECRET="your-jwt-refresh-secret"
   JWT_EXPIRES_IN="1h"
   JWT_REFRESH_EXPIRES_IN="7d"
   ```
5. Generate Prisma client
   ```
   npm run prisma:generate
   ```
6. Run database migrations
   ```
   npm run prisma:migrate
   ```
7. Start the development server
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### Quizzes

- `POST /api/quizzes` - Create a new quiz
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get a quiz by ID
- `PUT /api/quizzes/:id` - Update a quiz
- `DELETE /api/quizzes/:id` - Delete a quiz
- `PUT /api/quizzes/:id/publish` - Publish a quiz

### Questions

- `POST /api/questions` - Create a new question
- `GET /api/questions/:id` - Get a question by ID
- `PUT /api/questions/:id` - Update a question
- `DELETE /api/questions/:id` - Delete a question
- `PUT /api/questions/:id/options` - Update options for a question

### Participations

- `POST /api/participations` - Start a new participation
- `POST /api/participations/:id/answers` - Submit answer for a question
- `POST /api/participations/:id/complete` - Complete participation
- `GET /api/participations/:id/results` - Get participation results

## Scripts

- `npm run dev` - Start development server with hot-reloading
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Data models
├── routes/         # API routes
├── utils/          # Utility functions
├── server.ts       # Server entry point
prisma/
├── schema.prisma   # Database schema
```