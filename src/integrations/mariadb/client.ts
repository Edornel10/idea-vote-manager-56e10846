
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Database connection pool
let pool: mysql.Pool | null = null;

// Initialize database connection
export const initDatabase = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'ideauser',
      password: process.env.DB_PASSWORD || 'ideapass',
      database: process.env.DB_NAME || 'ideavote',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('Database connection initialized');
  }
  return pool;
};

// Get database connection
export const getDb = async () => {
  if (!pool) {
    await initDatabase();
  }
  return pool!;
};

// Ideas related functions
export const getIdeas = async (includeAll = false) => {
  const db = await getDb();
  
  let query = 'SELECT * FROM ideas';
  if (!includeAll) {
    // Only get non-frozen ideas
    query += ' WHERE frozen IS NULL OR frozen = FALSE';
  }
  
  query += ' ORDER BY votes DESC';
  
  const [rows] = await db.query(query);
  return rows;
};

export const getIdeaById = async (id: string) => {
  const db = await getDb();
  const [rows] = await db.query('SELECT * FROM ideas WHERE id = ?', [id]);
  const ideas = rows as any[];
  return ideas.length > 0 ? ideas[0] : null;
};

export const createIdea = async (idea: {
  title: string;
  category: string;
  description: string;
  summary?: string;
  votes?: number;
}) => {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.query(
    'INSERT INTO ideas (id, title, category, description, summary, votes) VALUES (?, ?, ?, ?, ?, ?)',
    [id, idea.title, idea.category, idea.description, idea.summary || '', idea.votes || 0]
  );
  return { id, ...idea };
};

export const updateIdea = async (
  id: string,
  updates: { votes?: number; frozen?: boolean }
) => {
  const db = await getDb();
  
  // Build the SET clause dynamically based on what's being updated
  const setClauses = [];
  const values = [];
  
  if (updates.votes !== undefined) {
    setClauses.push('votes = ?');
    values.push(updates.votes);
  }
  
  if (updates.frozen !== undefined) {
    setClauses.push('frozen = ?');
    values.push(updates.frozen);
  }
  
  if (setClauses.length === 0) {
    return null; // Nothing to update
  }
  
  // Add the id to the values array
  values.push(id);
  
  const query = `UPDATE ideas SET ${setClauses.join(', ')} WHERE id = ?`;
  await db.query(query, values);
  
  return await getIdeaById(id);
};

export const deleteIdea = async (id: string) => {
  const db = await getDb();
  await db.query('DELETE FROM ideas WHERE id = ?', [id]);
  return { id };
};

// User related functions
export const getUserByUsername = async (username: string) => {
  const db = await getDb();
  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  const users = rows as any[];
  return users.length > 0 ? users[0] : null;
};

export const verifyPassword = async (username: string, password: string) => {
  const user = await getUserByUsername(username);
  if (!user) return null;
  
  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) return null;
  
  return { id: user.id, role: user.role };
};

export const createUser = async (user: {
  username: string;
  password: string;
  role?: 'admin' | 'standard';
}) => {
  const db = await getDb();
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(user.password, 10);
  
  await db.query(
    'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
    [id, user.username, passwordHash, user.role || 'standard']
  );
  
  return { id, username: user.username, role: user.role || 'standard' };
};

export const getUsers = async () => {
  const db = await getDb();
  const [rows] = await db.query('SELECT id, username, role FROM users');
  return rows;
};

export const deleteUser = async (id: string) => {
  const db = await getDb();
  await db.query('DELETE FROM users WHERE id = ?', [id]);
  return { id };
};
