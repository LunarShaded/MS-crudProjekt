import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Home = () => {
  const [appInfo, setAppInfo] = useState(null)

  useEffect(() => {
    axios.get('http://localhost:5000/')
      .then(response => {
        setAppInfo(response.data)
      })
      .catch(error => {
        console.error('Błąd podczas ładowania informacji:', error)
      })
  }, [])

  return (
    <div className="container">
      <section className="hero">
        <h1>System Zarządzania Zadaniami</h1>
        <p>
          {appInfo ? appInfo.description : 'Ładowanie...'}
        </p>
        <div className="features">
          <div className="feature-card">
            <h3>📝 Zarządzanie Zadaniami</h3>
            <p>Twórz, edytuj i usuwaj swoje zadania w prosty i intuicyjny sposób.</p>
          </div>
          <div className="feature-card">
            <h3>🔐 Bezpieczne Logowanie</h3>
            <p>System uwierzytelniania z szyfrowaniem hasła i tokenami JWT.</p>
          </div>
      
        </div>
        
        <div className="feature-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>ℹ️ O Aplikacji</h3>
          <p>
            Ta aplikacja demonstruje pełny stack rozwoju oprogramowania z React, Node.js i PostgreSQL.
            Zawiera system rejestracji i logowania użytkowników oraz chronione endpointy CRUD.
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
            Wersja: {appInfo?.version || '1.0.0'}
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home