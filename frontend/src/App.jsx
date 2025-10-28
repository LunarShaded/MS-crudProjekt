import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Tasks from './components/Tasks'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // W prawdziwej aplikacji warto zweryfikować token przez API
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setCurrentView('tasks')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setCurrentView('home')
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home />
      case 'login':
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentView('register')} />
      case 'register':
        return <Register onSwitchToLogin={() => setCurrentView('login')} />
      case 'tasks':
        return user ? <Tasks user={user} /> : <Home />
      default:
        return <Home />
    }
  }

  return (
    <div className="App">
      <header className="header">
        <nav className="nav container">
          <div className="logo">TaskManager</div>
          <div className="nav-links">
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentView('home')}
            >
              Strona Główna
            </button>
            
            {user ? (
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setCurrentView('tasks')}
                >
                  Moje Zadania
                </button>
                <span>Witaj, {user.login}!</span>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleLogout}
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setCurrentView('login')}
                >
                  Zaloguj
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setCurrentView('register')}
                >
                  Zarejestruj
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        {renderView()}
      </main>
    </div>
  )
}

export default App