const express = require('express');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { userId, passwordHash } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE user_id = ? AND password_hash = ?',
      [userId, passwordHash]
    );

    if (rows.length > 0) {
      const user = rows[0];
      res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Data retrieval endpoint with role-based access control
app.post('/api/data', async (req, res) => {
  const { userId, role } = req.body;

  try {
    if (role === 'admin') {
      const [rows] = await db.query('SELECT * FROM users');
      res.json({ success: true, data: rows });
    } else {
      const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
      res.json({ success: true, data: rows });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
