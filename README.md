# Mini Splitwise (Expense Splitter App)

A beautiful expense sharing application with a dark premium UI theme. Split expenses with friends and family easily.

## Features

- **Dark Premium UI**: Modern and sleek dark theme with purple accents
- **Responsive Design**: Works on all devices from mobile to desktop
- **INR Currency Support**: Track expenses in Indian Rupees
- **PDF Export**: Generate and download expense reports
- **User Authentication**: Secure login with JWT
- **Group Management**: Create groups and add members
- **Expense Tracking**: Add, edit, and settle expenses
- **Balance Overview**: See who owes you and whom you owe

## Deployment on Vercel

This project is configured for easy deployment on Vercel. Follow these steps:

1. **Install Vercel CLI**:
   ```
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```
   vercel login
   ```

3. **Deploy the Project**:
   ```
   vercel
   ```

4. **For Production Deployment**:
   ```
   vercel --prod
   ```

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js/Express
- **Database**: SQLite
- **Authentication**: JWT

## Project Structure

```
splitwise/
├── client/             # React frontend
├── server/             # Express backend
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── tests/          # Backend tests
└── database/           # SQLite database files
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Start the development servers:
   ```
   # Start backend server
   cd server
   npm start

   # Start frontend server
   cd ../client
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/users` - Get all users
- `POST /api/groups` - Create a new group
- `GET /api/groups` - Get all groups
- `POST /api/expenses` - Add a new expense
- `GET /api/expenses` - Get all expenses
- `GET /api/balances` - Get all balances
- `POST /api/settle` - Settle up with a user

## License

This project is licensed under the MIT License.