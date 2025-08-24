# Mini Splitwise Installation Guide

Follow these steps to set up and run the Mini Splitwise application.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation Steps

### 1. Clone or download the repository

If you've downloaded the project as a ZIP file, extract it to your desired location.

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Set up Environment Variables

The `.env` file is already created in the root directory with default values. You can modify it if needed.

### 5. Run the Application

#### Start the Backend Server

```bash
cd server
npm start
```

The server will run on http://localhost:5000

#### Start the Frontend Development Server

Open a new terminal window and run:

```bash
cd client
npm start
```

The React app will run on http://localhost:3000

## Using the Application

1. Register a new account
2. Create groups and add expenses
3. View balances and settle up with friends

## Testing

To run tests:

```bash
cd server
npm test
```

## Troubleshooting

- If you encounter any database errors, make sure the database directory exists and has write permissions.
- If you have port conflicts, you can change the port in the `.env` file.