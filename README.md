# 🧠 Task Management System

Full-stack aplikacja do zarządzania zadaniami z systemem uwierzytelniania użytkowników.
Projekt wykorzystuje **React (frontend)**, **Node.js/Express (backend)** oraz **PostgreSQL (baza danych)**.

---

## 📋 Spis treści

* [Opis projektu](#-opis-projektu)
* [Funkcjonalności](#-funkcjonalności)
* [Instalacja i uruchomienie](#-instalacja-i-uruchomienie)
* [Środowiska](#-środowiska-stagingproduction)
* [Konta testowe](#-konta-testowe)
* [Instrukcja uruchomienia testów](#-instrukcja-uruchomienia-testów)
* [API Documentation](#-api-documentation)
* [Walidacja danych](#-walidacja-danych)
* [CI/CD Pipeline](#-cicd-pipeline)
* [Deployment](#-deployment)
* [Architektura projektu](#-architektura-projektu)

---

## 🧠 Opis projektu

Aplikacja umożliwia tworzenie, edycję i zarządzanie zadaniami użytkowników.
Zawiera pełny system autoryzacji z wykorzystaniem JWT, walidację po stronie frontend i backend oraz zautomatyzowany CI/CD pipeline z GitHub Actions i wdrożeniem na Render.

---

## ⚙️ Funkcjonalności

### 🔐 System uwierzytelniania

* Rejestracja nowych użytkowników
* Logowanie z tokenami JWT
* Chronione endpointy API

### 📝 Zarządzanie zadaniami

* Tworzenie, edycja i usuwanie zadań
* Zmiana statusu (`PENDING` / `IN_PROGRESS` / `DONE`)
* Prywatna lista zadań dla każdego użytkownika

### ✅ Walidacja danych

* Walidacja po stronie klienta (React)
* Walidacja po stronie serwera (Express)
* Spójne komunikaty błędów

---

## 💻 Instalacja i uruchomienie

### 🔧 Wymagania wstępne

* Node.js 18+
* PostgreSQL
* npm lub yarn

### 📥 Klonowanie repozytorium

```bash
git clone https://github.com/LunarShaded/MS-crudProjekt.git
```

### 🗄️ Backend Setup

```bash
cd backend
npm install
```

#### ⚙️ Konfiguracja pliku `.env`

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_123!
DATABASE_URL=postgresql://taskuser:n8zQGJTzJYJWZe1vYVYHJpwkbTmnSPPa@dpg-d3vmutemcj7s73eq1500-a.oregon-postgres.render.com/postgre_i8em
NODE_ENV=production
```

#### 🚀 Uruchomienie backendu

* **Development**

```bash
npm run dev
```

* **Production**

```bash
npm start
```

### 💅 Frontend Setup

```bash
cd frontend
npm install
```

#### ⚙️ Konfiguracja pliku `.env`

```env
VITE_API_URL=http://localhost:5000
```

#### 🚀 Uruchomienie frontendu

* **Development**

```bash
npm run dev
```

* **Build production**

```bash
npm run build
```

---

## 🌍 Środowiska (Staging/Production)

| Typ        | URL                                                                            | Baza danych         | Status      |
| ---------- | ------------------------------------------------------------------------------ | ------------------- | ----------- |
| Production | [https://ms-autoryzacja-logowanie-frontend.onrender.com](https://ms-autoryzacja-logowanie-frontend.onrender.com)                 | PostgreSQL (Render) | Live|
| Staging    | [https://ms-autoryzacja-logowanie-1.onrender.com](https://ms-autoryzacja-logowanie-1.onrender.com) | PostgreSQL (Render) | Development |
              

---

## 👥 Konta testowe

| Środowisko           | Login    | Hasło        |
| -------------------- | -------- | ------------ |
| Production / Staging | admin    | admin123     |


---

## 🧪 Instrukcja uruchomienia testów

### Backend Tests

```bash
cd backend
# Wszystkie testy
npm test
# Testy z pokryciem kodu
npm run test:coverage
# Tryb watch
npm run test:watch
```

### Frontend Tests

```bash
cd frontend
npm test
# Tryb watch
npm run test:watch
```

### Typy testów

* Unit tests – logika komponentów
* Integration tests – interakcje z API
* Validation tests – walidacja formularzy

---

## 🧾 API Documentation

### 🔓 Public Endpoints

* `GET /health` – sprawdzenie statusu serwera

```json
{ "status": "OK", "timestamp": "2024-01-01T00:00:00.000Z" }
```

* `POST /register` – rejestracja nowego użytkownika

```json
{
  "login": "nazwa_użytkownika",
  "password": "hasło"
}
```

* `POST /login` – logowanie użytkownika

```json
{
  "token": "jwt-token",
  "user": { "id": 1, "login": "nazwa", "role": "USER" }
}
```

### 🔒 Protected Endpoints (token wymagany)

* `GET /tasks` – pobiera listę zadań użytkownika
* `POST /tasks` – tworzy nowe zadanie
* `PUT /tasks/:id` – aktualizuje zadanie
* `DELETE /tasks/:id` – usuwa zadanie

---

## 🧩 Walidacja danych

### 🖥️ Frontend

* Natychmiastowy feedback
* HTML5 validation + własne reguły

### ⚙️ Backend

* Middleware: `express-validator`
* Spójne błędy HTTP

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "fieldErrors": [
    {
      "field": "login",
      "code": "INVALID_LENGTH",
      "message": "Login musi mieć od 3 do 50 znaków"
    }
  ]
}
```

---

## ⚙️ CI/CD Pipeline

* GitHub Actions pipeline uruchamiany przy każdym pushu do `main`

* Etapy:

  1. Build & Test
  2. Instalacja zależności
  3. Testy backendu i frontendu
  4. Build frontendu
  5. Deploy to Production
  6. Automatyczne wdrożenie po testach
  7. Smoke test po deployu
  8. Aktualizacja dokumentacji

* 🔐 Secrets w GitHub:

  * `RENDER_DEPLOY_HOOK` – webhook Render
  * `PRODUCTION_URL` – URL produkcji

---

## 🚀 Deployment

| Typ        | URL                                                                            | Komenda       |
| ---------- | ------------------------------------------------------------------------------ | ------------- |
| Production | [https://your-app.onrender.com](https://your-app.onrender.com)                 | `npm start`   |
| Staging    | [https://your-app-staging.onrender.com](https://your-app-staging.onrender.com) | `npm start`   |
| Local      | [http://localhost:5000](http://localhost:5000)                                 | `npm run dev` |

---

## 🏗️ Architektura projektu

Projekt podzielony na dwie główne części:

* **Frontend** – React + Vite
* **Backend** – Node.js + Express + PostgreSQL
* CI/CD pipeline + Render do automatyzacji deploymentu
