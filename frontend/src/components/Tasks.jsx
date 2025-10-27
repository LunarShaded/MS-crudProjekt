import React, { useState, useEffect } from 'react'
import axios from 'axios'

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

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks')
      setTasks(response.data)
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Brak autoryzacji. Zaloguj się ponownie.')
      } else {
        setError('Błąd podczas ładowania zadań')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      if (editingTask) {
        await axios.put(`http://localhost:5000/tasks/${editingTask.id}`, formData)
      } else {
        await axios.post('http://localhost:5000/tasks', formData)
      }
      
      setFormData({ title: '', description: '', status: 'PENDING' })
      setShowForm(false)
      setEditingTask(null)
      loadTasks()
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Sesja wygasła. Zaloguj się ponownie.')
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
  }

  const handleDelete = async (taskId) => {
    if (window.confirm('Czy na pewno chcesz usunąć to zadanie?')) {
      try {
        await axios.delete(`http://localhost:5000/tasks/${taskId}`)
        loadTasks()
      } catch (error) {
        if (error.response?.status === 401) {
          setError('Brak autoryzacji. Zaloguj się ponownie.')
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
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Oczekujące'
      case 'COMPLETED': return 'Zakończone'
      default: return status
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending'
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
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tytuł:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Wpisz tytuł zadania"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Opis:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="3"
                  placeholder="Opis zadania (opcjonalnie)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="PENDING">Oczekujące</option>
                  <option value="COMPLETED">Zakończone</option>
                </select>
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