import React, { useState } from 'react'
import axios from 'axios'

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne')
      return
    }

    if (formData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:5000/register', {
        login: formData.login,
        password: formData.password
      })
      
      setSuccess('Konto utworzone pomyślnie! Możesz się teraz zalogować.')
      setFormData({ login: '', password: '', confirmPassword: '' })
    } catch (error) {
      setError(error.response?.data?.error || 'Błąd rejestracji')
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
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Login:</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hasło (min. 6 znaków):</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Potwierdź hasło:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
            />
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