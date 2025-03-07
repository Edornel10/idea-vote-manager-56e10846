
import mysql from 'mysql2/promise';
import { User } from '@/hooks/useAuth';
import bcrypt from 'bcryptjs';

// Connection configuration
const getConfig = () => ({
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: Number(import.meta.env.VITE_DB_PORT) || 3306,
  user: import.meta.env.VITE_DB_USER || 'ideauser',
  password: import.meta.env.VITE_DB_PASSWORD || 'ideapass',
  database: import.meta.env.VITE_DB_NAME || 'ideavote'
});

// Initialize database connection
export const initDatabase = async () => {
  try {
    const connection = await mysql.createConnection(getConfig());
    console.log('Database connected successfully');
    await connection.end();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Get database connection
export const getDb = async () => {
  try {
    return await mysql.createConnection(getConfig());
  } catch (error) {
    console.error('Failed to get database connection:', error);
    throw error;
  }
};

// Ideas related functions
export const getIdeas = async (includeAll = false) => {
  try {
    const db = await getDb();
    let query = 'SELECT * FROM ideas';
    if (!includeAll) {
      query += ' WHERE frozen = FALSE';
    }
    const [rows] = await db.execute(query);
    await db.end();
    return rows;
  } catch (error) {
    console.error('Error getting ideas:', error);
    return [];
  }
};

export const getIdeaById = async (id: string) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute('SELECT * FROM ideas WHERE id = ?', [id]);
    await db.end();
    
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting idea by id:', error);
    return null;
  }
};

export const createIdea = async (idea: {
  title: string;
  category: string;
  description: string;
  summary?: string;
  votes?: number;
}) => {
  try {
    const db = await getDb();
    const { title, category, description, summary = '', votes = 0 } = idea;
    
    const [result] = await db.execute(
      'INSERT INTO ideas (title, category, description, summary, votes) VALUES (?, ?, ?, ?, ?)',
      [title, category, description, summary, votes]
    );
    
    await db.end();
    
    if ('insertId' in result) {
      return {
        id: result.insertId.toString(),
        title,
        category,
        description,
        summary,
        votes,
        frozen: false
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating idea:', error);
    throw error;
  }
};

export const updateIdea = async (
  id: string,
  updates: { votes?: number; frozen?: boolean }
) => {
  try {
    const db = await getDb();
    const idea = await getIdeaById(id);
    
    if (!idea) return null;
    
    const updatedIdea = { ...idea };
    let query = 'UPDATE ideas SET ';
    const params: any[] = [];
    
    if (updates.votes !== undefined) {
      query += 'votes = ?, ';
      params.push(updates.votes);
      updatedIdea.votes = updates.votes;
    }
    
    if (updates.frozen !== undefined) {
      query += 'frozen = ?, ';
      params.push(updates.frozen);
      updatedIdea.frozen = updates.frozen;
    }
    
    // Remove trailing comma and space
    query = query.slice(0, -2);
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await db.execute(query, params);
    await db.end();
    
    return updatedIdea;
  } catch (error) {
    console.error('Error updating idea:', error);
    return null;
  }
};

export const deleteIdea = async (id: string) => {
  try {
    const db = await getDb();
    await db.execute('DELETE FROM ideas WHERE id = ?', [id]);
    await db.end();
    return { id };
  } catch (error) {
    console.error('Error deleting idea:', error);
    throw error;
  }
};

// User related functions
export const getUserByUsername = async (username: string) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    await db.end();
    
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

export const verifyPassword = async (username: string, password: string) => {
  try {
    const user = await getUserByUsername(username);
    if (!user) return null;
    
    // MariaDB doesn't have bcrypt built-in, so we use bcryptjs in our app
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (passwordMatch) {
      return { id: user.id, role: user.role };
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying password:', error);
    return null;
  }
};

export const createUser = async (user: {
  username: string;
  password: string;
  role?: 'admin' | 'standard';
}) => {
  try {
    const db = await getDb();
    const { username, password, role = 'standard' } = user;
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, passwordHash, role]
    );
    
    await db.end();
    
    if ('insertId' in result) {
      return { 
        id: result.insertId.toString(), 
        username,
        role 
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const db = await getDb();
    const [rows] = await db.execute('SELECT id, username, role FROM users');
    await db.end();
    return rows;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const deleteUser = async (id: string) => {
  try {
    const db = await getDb();
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    await db.end();
    return { id };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
