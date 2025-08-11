# NAAC Digital Verification and Validation (DVV) System

A comprehensive system for managing NAAC (National Assessment and Accreditation Council) accreditation data and criteria, with a focus on Digital Verification and Validation processes.

## Project Structure

```
NAAC-DVV/
├── backend/           # Node.js backend server
├── frontend/          # Frontend application
├── README.md          # This file
└── app.log           # Application logs
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the database:
   - Create a MySQL database named `naac_dvv`
   - Update the database configuration in `backend/src/config/config.json` if needed

4. Run database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3001` by default.

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` by default.

## Environment Variables

### Backend
Create a `.env` file in the `backend` directory with the following variables:

```
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=30d
```

## API Documentation

API documentation is currently under development.

## Contributing

Contributions are welcome. Please follow the standard GitHub flow for contributing.

## License

This project is proprietary and confidential.

## Support

For support, please contact the development team.