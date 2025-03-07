
-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    summary TEXT,
    votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    frozen BOOLEAN DEFAULT FALSE
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'standard') DEFAULT 'standard'
);

-- Add some sample data
INSERT INTO ideas (id, title, category, description, summary, votes) VALUES
    (UUID(), 'Improve Documentation', 'Education', 'We should improve our documentation with more examples.', 'Add better examples to docs', 5),
    (UUID(), 'Add Dark Mode', 'Technology', 'Implement a dark mode for better eye comfort.', 'Implement dark mode', 10);

-- Add admin user (password: admin123)
INSERT INTO users (id, username, password_hash, role) VALUES
    (UUID(), 'admin', '$2a$10$rJ.1QKrODAZCJ9/yGhbIe.nEfBWQCR0/9kQANJjmV4ope8LEqGjnm', 'admin');
