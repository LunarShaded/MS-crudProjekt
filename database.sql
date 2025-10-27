-- Create database
CREATE DATABASE task_manager;

-- Connect to database
\c task_manager;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (login, password_hash, role) VALUES 
('admin', '$2b$10$K9s5f.3RrGJL7WqQ8Q8qE.JJ7Vk5L5V5L5V5L5V5L5V5L5V5L5V5L', 'ADMIN'),
('user1', '$2b$10$K9s5f.3RrGJL7WqQ8Q8qE.JJ7Vk5L5V5L5V5L5V5L5V5L5V5L', 'USER');



INSERT INTO tasks (title, description, status, user_id) VALUES 
('Pierwsze zadanie', 'To jest przykładowe zadanie', 'PENDING', 1),
('Drugie zadanie', 'Kolejne przykładowe zadanie', 'COMPLETED', 2);