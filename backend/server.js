import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import dotenv from 'dotenv';


dotenv.config();


const { Pool } = pkg;
const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    if (origin.includes('.onrender.com')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

app.use(express.json());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware do weryfikacji tokenu
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token dostępu wymagany' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Nieprawidłowy token' });
    }
    req.user = user;
    next();
  });
};

// Public routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Witaj w systemie zarządzania zadaniami!',
    version: '1.0.0',
    description: 'Aplikacja do zarządzania zadaniami z systemem uwierzytelniania'
  });
});

// Rejestracja
app.post('/register', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login i hasło są wymagane' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Hasło musi mieć co najmniej 6 znaków' });
    }

    // Sprawdź czy login jest unikalny
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE login = $1',
      [login]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Login jest już zajęty' });
    }

    // Hash hasła
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Zapisz użytkownika
    const newUser = await pool.query(
      'INSERT INTO users (login, password_hash, role) VALUES ($1, $2, $3) RETURNING id, login, role, created_at',
      [login, passwordHash, 'USER']
    );

    res.status(201).json({ 
      message: 'Użytkownik zarejestrowany pomyślnie',
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Logowanie
app.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login i hasło są wymagane' });
    }

    // Znajdź użytkownika
    const userResult = await pool.query(
      'SELECT * FROM users WHERE login = $1',
      [login]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Nieprawidłowy login lub hasło' });
    }

    const user = userResult.rows[0];

    // Sprawdź hasło
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Nieprawidłowy login lub hasło' });
    }

    // Generuj token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        login: user.login, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Logowanie udane',
      token,
      user: {
        id: user.id,
        login: user.login,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Chronione endpointy CRUD dla zadań

// Pobierz wszystkie zadania użytkownika
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(tasks.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Utwórz nowe zadanie
app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Tytuł jest wymagany' });
    }

    const newTask = await pool.query(
      'INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, status || 'PENDING', req.user.id]
    );

    res.status(201).json(newTask.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Aktualizuj zadanie
app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Zadanie nie znalezione' });
    }

    const updatedTask = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, description, status, id, req.user.id]
    );

    res.json(updatedTask.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Usuń zadanie
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ error: 'Zadanie nie znalezione' });
    }

    await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Zadanie usunięte pomyślnie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});