# Express.js Project

A simple Express.js project with basic setup.

## Setup

1. Copy the environment variables file:
   ```
   cp .env.example .env
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## Environment Variables

- `PORT`: The port number for the server (default: 3000)

## Available Endpoints

- GET `/`: Returns a welcome message

The server runs on `http://localhost:${PORT}`
