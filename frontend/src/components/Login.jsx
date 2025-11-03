import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)


  const validateForm = () => {
    const newErrors = {}

    
    if (!formData.login.trim()) {
      newErrors.login = 'Login jest wymagany'
    } else if (formData.login.length < 3) {
      newErrors.login = 'Login musi mieć co najmniej 3 znaki'
    } else if (formData.login.length > 50) {
      newErrors.login = 'Login może mieć maksymalnie 50 znaków'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.login)) {
      newErrors.login = 'Login może zawierać tylko litery, cyfry i podkreślniki'
    }


    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Hasło musi mieć co najmniej 6 znaków'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
  
    if (!validateForm()) {
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/login`, formData)
      const { user, token } = response.data
      if (user && token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        onLogin(user, token)
      } else {
        setErrors({ general: 'Nieprawidłowa odpowiedź serwera' })
      }
    } catch (err) {
      console.error('Błąd logowania:', err)
      
      
      if (err.response?.data?.fieldErrors) {
        const backendErrors = {}
        err.response.data.fieldErrors.forEach(error => {
          backendErrors[error.field] = error.message
        })
        setErrors(backendErrors)
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message })
      } else {
        setErrors({ general: err.response?.data?.error || 'Błąd logowania' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#4cc9f0' }}>
          Logowanie
        </h2>
        
        {errors.general && (
          <div className="alert alert-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Login:</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              className={`form-input ${errors.login ? 'input-error' : ''}`}
              required
              minLength="3"
              maxLength="50"
              pattern="[a-zA-Z0-9_]+"
              title="Login może zawierać tylko litery, cyfry i podkreślniki"
            />
            {errors.login && (
              <div className="error-message">{errors.login}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Hasło:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              required
              minLength="6"
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logowanie...' : 'Zaloguj'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Nie masz konta?{' '}
          <button 
            onClick={onSwitchToRegister}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#4cc9f0', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Zarejestruj się
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login