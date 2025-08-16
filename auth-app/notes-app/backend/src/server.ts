import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authMiddleware, AuthenticatedRequest } from './middleware/authMiddleware';


const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

// Example protected API route
app.get('/api/notes', authMiddleware, (req: AuthenticatedRequest, res) => {
  // req.user is now typed and available
  res.json({ message: 'Authenticated!', user: req.user });
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});