const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'splitwise_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.resolve(__dirname, '../database/splitwise.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Groups table
    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )`);

    // Group members table
    db.run(`CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(group_id, user_id)
    )`);

    // Expenses table
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      paid_by INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups (id),
      FOREIGN KEY (paid_by) REFERENCES users (id)
    )`);

    // Expense shares table
    db.run(`CREATE TABLE IF NOT EXISTS expense_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (expense_id) REFERENCES expenses (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Settlements table
    db.run(`CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users (id),
      FOREIGN KEY (to_user_id) REFERENCES users (id)
    )`);
  });
}

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Routes

// Register user
app.post(
  '/api/auth/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ msg: 'Server error' });
        }

        if (user) {
          return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        db.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword],
          function (err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ msg: 'Server error' });
            }

            const userId = this.lastID;

            // Create JWT
            const payload = {
              user: {
                id: userId
              }
            };

            jwt.sign(
              payload,
              JWT_SECRET,
              { expiresIn: '1h' },
              (err, token) => {
                if (err) throw err;
                res.json({ token });
              }
            );
          }
        );
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Login user
app.post(
  '/api/auth/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ msg: 'Server error' });
        }

        if (!user) {
          return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT
        const payload = {
          user: {
            id: user.id
          }
        };

        jwt.sign(
          payload,
          JWT_SECRET,
          { expiresIn: '1h' },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Get user profile
app.get('/api/users/me', auth, (req, res) => {
  db.get('SELECT id, name, email FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  });
});

// Get all users
app.get('/api/users', auth, (req, res) => {
  db.all('SELECT id, name, email FROM users', (err, users) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }

    res.json(users);
  });
});

// Create a group
app.post(
  '/api/groups',
  [auth, body('name', 'Group name is required').not().isEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, members } = req.body;
    const userId = req.user.id;

    db.run(
      'INSERT INTO groups (name, created_by) VALUES (?, ?)',
      [name, userId],
      function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ msg: 'Server error' });
        }

        const groupId = this.lastID;

        // Add creator as a member
        db.run(
          'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
          [groupId, userId],
          (err) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ msg: 'Server error' });
            }

            // Add other members if provided
            if (members && members.length > 0) {
              const stmt = db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)');
              
              members.forEach(memberId => {
                if (memberId !== userId) { // Avoid duplicate entry for creator
                  stmt.run(groupId, memberId);
                }
              });
              
              stmt.finalize();
            }

            res.json({ id: groupId, name, created_by: userId });
          }
        );
      }
    );
  }
);

// Get user's groups
app.get('/api/groups', auth, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT g.* FROM groups g
     JOIN group_members gm ON g.id = gm.group_id
     WHERE gm.user_id = ?`,
    [userId],
    (err, groups) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }

      res.json(groups);
    }
  );
});

// Add expense
app.post(
  '/api/expenses',
  [
    auth,
    body('group_id', 'Group ID is required').isNumeric(),
    body('amount', 'Amount is required and must be a number').isNumeric(),
    body('description', 'Description is required').not().isEmpty(),
    body('split_type', 'Split type is required').isIn(['equal', 'exact', 'percentage']),
    body('shares', 'Shares are required').isArray()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { group_id, amount, description, split_type, shares } = req.body;
    const paid_by = req.user.id;

    // Validate that the user is a member of the group
    db.get(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [group_id, paid_by],
      (err, member) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ msg: 'Server error' });
        }

        if (!member) {
          return res.status(403).json({ msg: 'User is not a member of this group' });
        }

        // Create expense
        db.run(
          'INSERT INTO expenses (group_id, paid_by, amount, description) VALUES (?, ?, ?, ?)',
          [group_id, paid_by, amount, description],
          function (err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ msg: 'Server error' });
            }

            const expenseId = this.lastID;

            // Calculate shares based on split type
            let calculatedShares = [];

            if (split_type === 'equal') {
              const shareAmount = amount / shares.length;
              calculatedShares = shares.map(userId => ({
                user_id: userId,
                amount: shareAmount
              }));
            } else if (split_type === 'exact' || split_type === 'percentage') {
              calculatedShares = shares;
            }

            // Insert expense shares
            const stmt = db.prepare('INSERT INTO expense_shares (expense_id, user_id, amount) VALUES (?, ?, ?)');
            
            calculatedShares.forEach(share => {
              stmt.run(expenseId, share.user_id, share.amount);
            });
            
            stmt.finalize();

            res.json({
              id: expenseId,
              group_id,
              paid_by,
              amount,
              description,
              shares: calculatedShares
            });
          }
        );
      }
    );
  }
);

// Get expenses for a group
app.get('/api/expenses/:groupId', auth, (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;

  // Validate that the user is a member of the group
  db.get(
    'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId],
    (err, member) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }

      if (!member) {
        return res.status(403).json({ msg: 'User is not a member of this group' });
      }

      // Get expenses
      db.all(
        `SELECT e.*, u.name as paid_by_name
         FROM expenses e
         JOIN users u ON e.paid_by = u.id
         WHERE e.group_id = ?
         ORDER BY e.date DESC`,
        [groupId],
        (err, expenses) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ msg: 'Server error' });
          }

          // Get expense shares
          const expensePromises = expenses.map(expense => {
            return new Promise((resolve, reject) => {
              db.all(
                `SELECT es.*, u.name as user_name
                 FROM expense_shares es
                 JOIN users u ON es.user_id = u.id
                 WHERE es.expense_id = ?`,
                [expense.id],
                (err, shares) => {
                  if (err) {
                    reject(err);
                  } else {
                    expense.shares = shares;
                    resolve(expense);
                  }
                }
              );
            });
          });

          Promise.all(expensePromises)
            .then(expensesWithShares => {
              res.json(expensesWithShares);
            })
            .catch(err => {
              console.error(err.message);
              res.status(500).json({ msg: 'Server error' });
            });
        }
      );
    }
  );
});

// Get balances for a user
app.get('/api/balances', auth, (req, res) => {
  const userId = req.user.id;

  // Get all expenses where the user is involved
  db.all(
    `SELECT e.id, e.paid_by, e.amount, es.user_id, es.amount as share_amount
     FROM expenses e
     JOIN expense_shares es ON e.id = es.expense_id
     WHERE e.paid_by = ? OR es.user_id = ?`,
    [userId, userId],
    (err, transactions) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Server error' });
      }

      // Calculate balances
      const balances = {};

      transactions.forEach(transaction => {
        if (transaction.paid_by === userId && transaction.user_id !== userId) {
          // User paid for someone else
          const otherUserId = transaction.user_id;
          if (!balances[otherUserId]) {
            balances[otherUserId] = 0;
          }
          balances[otherUserId] += transaction.share_amount;
        } else if (transaction.user_id === userId && transaction.paid_by !== userId) {
          // Someone paid for the user
          const otherUserId = transaction.paid_by;
          if (!balances[otherUserId]) {
            balances[otherUserId] = 0;
          }
          balances[otherUserId] -= transaction.share_amount;
        }
      });

      // Get user names for the balances
      const balancePromises = Object.keys(balances).map(otherUserId => {
        return new Promise((resolve, reject) => {
          db.get(
            'SELECT id, name FROM users WHERE id = ?',
            [otherUserId],
            (err, user) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  user_id: parseInt(otherUserId),
                  name: user.name,
                  amount: balances[otherUserId]
                });
              }
            }
          );
        });
      });

      Promise.all(balancePromises)
        .then(balancesWithNames => {
          res.json(balancesWithNames);
        })
        .catch(err => {
          console.error(err.message);
          res.status(500).json({ msg: 'Server error' });
        });
    }
  );
});

// Settle up with a user
app.post(
  '/api/settle',
  [
    auth,
    body('to_user_id', 'User ID is required').isNumeric(),
    body('amount', 'Amount is required and must be a number').isNumeric()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to_user_id, amount } = req.body;
    const from_user_id = req.user.id;

    // Create settlement
    db.run(
      'INSERT INTO settlements (from_user_id, to_user_id, amount) VALUES (?, ?, ?)',
      [from_user_id, to_user_id, amount],
      function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ msg: 'Server error' });
        }

        const settlementId = this.lastID;

        res.json({
          id: settlementId,
          from_user_id,
          to_user_id,
          amount
        });
      }
    );
  }
);

// Export the app as a serverless handler for Vercel
module.exports = serverless(app);