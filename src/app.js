import express from 'express';
import dotenv from 'dotenv';
import {
  initializeTables,
} from './db/db-initialization.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express API!' });
});

const startServer = async () => {
  try {
    await initializeTables();

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();
