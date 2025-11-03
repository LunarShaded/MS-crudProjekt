import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są identyczne'
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
    setErrors({})
    setSuccess('')

   
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/register`, {
        login: formData.login,
        password: formData.password
      })
      setSuccess('Rejestracja zakończona sukcesem. Możesz się zalogować.')
      setFormData({
        login: '',
        password: '',
        confirmPassword: ''
      })
    } catch (err) {
      console.error('Błąd rejestracji:', err)
      
    
      if (err.response?.data?.fieldErrors) {
        const backendErrors = {}
        err.response.data.fieldErrors.forEach(error => {
          backendErrors[error.field] = error.message
        })
        setErrors(backendErrors)
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message })
      } else {
        setErrors({ general: err.response?.data?.error || 'Błąd rejestracji' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#4cc9f0' }}>
          Rejestracja
        </h2>
        
        {errors.general && (
          <div className="alert alert-error">
            {errors.general}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
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
            <label className="form-label">Hasło (min. 6 znaków):</label>
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

          <div className="form-group">
            <label className="form-label">Potwierdź hasło:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              required
            />
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Rejestracja...' : 'Zarejestruj'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Masz już konto?{' '}
          <button 
            onClick={onSwitchToLogin}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#4cc9f0', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Zaloguj się
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register