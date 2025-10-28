 Sklonuj repozytorium

git clone https://github.com/LunarShaded/MS-crudProjekt.git

# Zaloguj się do PostgreSQL
sudo -u postgres psql

użyj pliku SQL:

psql -U postgres -f database.sql

# Przejdź do folderu backend
cd backend

# Zainstaluj zależności
npm install

# Skonfiguruj environment
cp .env.example .env

Edytuj plik backend/.env:
env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_123!
DATABASE_URL=postgresql://task_user:password123@localhost:5432/task_manager
NODE_ENV=development


Uruchom backend:

# Development mode
npm run dev

Frontend setup (nowe okno terminala)

# Przejdź do folderu frontend
cd frontend

# Zainstaluj zależności
npm install

# Uruchom development server
npm run dev
