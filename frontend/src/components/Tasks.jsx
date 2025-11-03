import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING'
  })
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`)
      setTasks(response.data)
    } catch (error) {
      console.error('Błąd ładowania zadań:', error)
      if (error.response?.status === 401) {
        setError('Brak autoryzacji. Zaloguj się ponownie.')
      } else if (error.response?.status === 403) {
        setError('Brak uprawnień do przeglądania zadań.')
      } else {
        setError('Błąd podczas ładowania zadań')
      }
    } finally {
      setLoading(false)
    }
  }

 
  const validateTaskForm = () => {
    const newErrors = {}

 
    if (!formData.title.trim()) {
      newErrors.title = 'Tytuł jest wymagany'
    } else if (formData.title.length > 255) {
      newErrors.title = 'Tytuł może mieć maksymalnie 255 znaków'
    }


    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Opis może mieć maksymalnie 1000 znaków'
    }

    
    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(formData.status)) {
      newErrors.status = 'Nieprawidłowy status zadania'
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
   
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFormErrors({})
    

    if (!validateTaskForm()) {
      return
    }

    try {
      if (editingTask) {
        await axios.put(`${API_BASE}/tasks/${editingTask.id}`, formData)
      } else {
        await axios.post(`${API_BASE}/tasks`, formData)
      }
      
      setFormData({ title: '', description: '', status: 'PENDING' })
      setShowForm(false)
      setEditingTask(null)
      setFormErrors({})
      loadTasks()
    } catch (error) {
      console.error('Błąd zapisywania zadania:', error)
      
      if (error.response?.status === 401) {
        setError('Sesja wygasła. Zaloguj się ponownie.')
      } else if (error.response?.status === 403) {
        setError('Brak uprawnień do modyfikacji zadań.')
      } else if (error.response?.status === 404) {
        setError('Zadanie nie zostało znalezione.')
      } else if (error.response?.data?.fieldErrors) {
        const backendErrors = {}
        error.response.data.fieldErrors.forEach(fieldError => {
          backendErrors[fieldError.field] = fieldError.message
        })
        setFormErrors(backendErrors)
      } else if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Błąd podczas zapisywania zadania')
      }
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status
    })
    setShowForm(true)
    setFormErrors({})
  }

  const handleDelete = async (taskId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
      try {
        await axios.delete(`${API_BASE}/tasks/${taskId}`)
        loadTasks()
      } catch (error) {
        console.error('Błąd usuwania zadania:', error)
        if (error.response?.status === 401) {
          setError('Brak autoryzacji. Zaloguj się ponownie.')
        } else if (error.response?.status === 403) {
          setError('Brak uprawnień do usunięcia zadania.')
        } else if (error.response?.status === 404) {
          setError('Zadanie nie zostało znalezione.')
        } else {
          setError('Błąd podczas usuwania zadania')
        }
      }
    }
  }

  const cancelEdit = () => {
    setShowForm(false)
    setEditingTask(null)
    setFormData({ title: '', description: '', status: 'PENDING' })
    setFormErrors({})
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Oczekujące'
      case 'IN_PROGRESS': return 'W trakcie'
      case 'COMPLETED': return 'Zakończone'
      default: return status
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending'
      case 'IN_PROGRESS': return 'status-in-progress'
      case 'COMPLETED': return 'status-completed'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Ładowanie zadań...
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="tasks-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Moje Zadania</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            + Nowe Zadanie
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {showForm && (
          <div className="form-container" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#4cc9f0', marginBottom: '1.5rem' }}>
              {editingTask ? 'Edytuj Zadanie' : 'Nowe Zadanie'}
            </h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Tytuł *:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-input ${formErrors.title ? 'input-error' : ''}`}
                  placeholder="Wpisz tytuł zadania"
                  required
                  maxLength="255"
                />
                {formErrors.title && (
                  <div className="error-message">{formErrors.title}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Opis:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-input ${formErrors.description ? 'input-error' : ''}`}
                  rows="3"
                  placeholder="Opis zadania (opcjonalnie)"
                  maxLength="1000"
                />
                {formErrors.description && (
                  <div className="error-message">{formErrors.description}</div>
                )}
                <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'right' }}>
                  {formData.description.length}/1000
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`form-input ${formErrors.status ? 'input-error' : ''}`}
                >
                  <option value="PENDING">Oczekujące</option>
                  <option value="IN_PROGRESS">W trakcie</option>
                  <option value="COMPLETED">Zakończone</option>
                </select>
                {formErrors.status && (
                  <div className="error-message">{formErrors.status}</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  {editingTask ? 'Zaktualizuj' : 'Utwórz'} Zadanie
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={cancelEdit}
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="form-container" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#4cc9f0', marginBottom: '1rem' }}>
              Brak zadań
            </h3>
            <p style={{ color: '#b8b8b8', marginBottom: '1.5rem' }}>
              {showForm ? 'Uzupełnij formularz powyżej aby utworzyć pierwsze zadanie.' : 'Kliknij "Nowe Zadanie" aby rozpocząć.'}
            </p>
            {!showForm && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Utwórz Pierwsze Zadanie
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <div style={{ flex: 1 }}>
                    <h3 className="task-title">{task.title}</h3>
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                      Utworzono: {new Date(task.created_at).toLocaleDateString('pl-PL')}
                      {task.updated_at !== task.created_at && (
                        <span> • Edytowano: {new Date(task.updated_at).toLocaleDateString('pl-PL')}</span>
                      )}
                    </div>
                  </div>
                  <span className={`task-status ${getStatusClass(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEdit(task)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    Edytuj
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(task.id)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tasks.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>
            Liczba zadań: {tasks.length}
            {tasks.filter(task => task.status === 'COMPLETED').length > 0 && (
              <span> • Zakończone: {tasks.filter(task => task.status === 'COMPLETED').length}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks