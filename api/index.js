
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../dist')));

// Database connection config
const getDbConfig = () => ({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'ideauser',
  password: process.env.DB_PASSWORD || 'ideapass',
  database: process.env.DB_NAME || 'ideavote'
});

// Get database connection
const getDb = async () => {
  try {
    return await mysql.createConnection(getDbConfig());
  } catch (error) {
    console.error('Failed to get database connection:', error);
    throw error;
  }
};

// API Routes
// Get all ideas
app.get('/api/ideas', async (req, res) => {
  try {
    const includeAll = req.query.includeAll === 'true';
    const db = await getDb();
    
    let query = 'SELECT * FROM ideas';
    if (!includeAll) {
      query += ' WHERE frozen = FALSE';
    }
    
    const [rows] = await db.execute(query);
    await db.end();
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting ideas:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

// Get idea by ID
app.get('/api/ideas/:id', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute('SELECT * FROM ideas WHERE id = ?', [req.params.id]);
    await db.end();
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Idea not found' });
    }
  } catch (error) {
    console.error('Error getting idea:', error);
    res.status(500).json({ error: 'Failed to fetch idea' });
  }
});

// Create new idea
app.post('/api/ideas', async (req, res) => {
  try {
    const { title, category, description, summary = '', votes = 0 } = req.body;
    
    const db = await getDb();
    const [result] = await db.execute(
      'INSERT INTO ideas (id, title, category, description, summary, votes) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [title, category, description, summary, votes]
    );
    
    const [rows] = await db.execute('SELECT * FROM ideas WHERE id = LAST_INSERT_ID()');
    await db.end();
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

// Update idea
app.put('/api/ideas/:id', async (req, res) => {
  try {
    const { votes, frozen } = req.body;
    const id = req.params.id;
    
    const db = await getDb();
    
    // Get current idea
    const [ideaRows] = await db.execute('SELECT * FROM ideas WHERE id = ?', [id]);
    
    if (ideaRows.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    const idea = ideaRows[0];
    const updatedIdea = { ...idea };
    
    let query = 'UPDATE ideas SET ';
    const params = [];
    
    if (votes !== undefined) {
      query += 'votes = ?, ';
      params.push(votes);
      updatedIdea.votes = votes;
    }
    
    if (frozen !== undefined) {
      query += 'frozen = ?, ';
      params.push(frozen);
      updatedIdea.frozen = frozen;
    }
    
    // Remove trailing comma and space
    query = query.slice(0, -2);
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await db.execute(query, params);
    await db.end();
    
    res.json(updatedIdea);
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Delete idea
app.delete('/api/ideas/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.execute('DELETE FROM ideas WHERE id = ?', [req.params.id]);
    await db.end();
    
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

// User authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const db = await getDb();
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    await db.end();
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (passwordMatch) {
      res.json({ id: user.id, role: user.role });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get users
app.get('/api/users', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute('SELECT id, username, role FROM users');
    await db.end();
    
    res.json(rows);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role = 'standard' } = req.body;
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const db = await getDb();
    const [result] = await db.execute(
      'INSERT INTO users (id, username, password_hash, role) VALUES (UUID(), ?, ?, ?)',
      [username, passwordHash, role]
    );
    
    const [rows] = await db.execute('SELECT id, username, role FROM users WHERE id = LAST_INSERT_ID()');
    await db.end();
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    await db.end();
    
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Serve React app for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
