# Backend Task - Skilllex

Simple Express.js app that generates all possible combinations of items and stores them in a database.

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
- `MYSQL_DATABASE`: The name of the database (default: skillex_db)
- `MYSQL_USER`: The username for the database (default: skillex_user)
- `MYSQL_PASSWORD`: The password for the database (default: skillex_password)
- `MYSQL_ROOT_PASSWORD`: The root password for the database (default: root_password)

## Available Endpoints

- POST `/generate`: Generates a combination of items and stores it in the database
