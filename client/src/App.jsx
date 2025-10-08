import { useCallback, useEffect, useMemo, useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import WorkoutForm from './components/WorkoutForm'
import WorkoutList from './components/WorkoutList'
import ProgressChart from './components/ProgressChart'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function App () {
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState('')
  const [workouts, setWorkouts] = useState([])
  const [progress, setProgress] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const authorizedRequest = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      const message = payload.message || 'Something went wrong'
      throw new Error(message)
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }, [token])

  useEffect(() => {
    if (!token) {
      setWorkouts([])
      setProgress([])
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [workoutResponse, progressResponse] = await Promise.all([
          authorizedRequest('/workouts'),
          authorizedRequest('/progress')
        ])
        setWorkouts(workoutResponse)
        setProgress(progressResponse.exercises)
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, authorizedRequest])

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to login')
      }

      setToken(payload.token)
      setUser(payload.user)
      setAuthMode('login')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (details) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(details)
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to register')
      }

      setToken(payload.token)
      setUser(payload.user)
      setAuthMode('login')
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    setUser(null)
  }

  const handleCreateWorkout = async (workout) => {
    try {
      setIsLoading(true)
      const payload = await authorizedRequest('/workouts', {
        method: 'POST',
        body: JSON.stringify(workout)
      })
      setWorkouts((prev) => [payload, ...prev])
      setError('')
      return payload
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorkout = async (id) => {
    try {
      setIsLoading(true)
      await authorizedRequest(`/workouts/${id}`, {
        method: 'DELETE'
      })
      setWorkouts((prev) => prev.filter((workout) => workout.id !== id))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    const fetchProgress = async () => {
      try {
        const progressResponse = await authorizedRequest('/progress')
        setProgress(progressResponse.exercises)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchProgress()
  }, [token, workouts.length, authorizedRequest])

  const summary = useMemo(() => {
    if (workouts.length === 0) return null
    const totalWorkouts = workouts.length
    const totalSets = workouts.reduce(
      (count, workout) =>
        count + workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0),
      0
    )
    const mostRecent = workouts[0]
    return { totalWorkouts, totalSets, mostRecent }
  }, [workouts])

  return (
    <div className="app-shell">
      <header>
        <h1>GainzKeeper</h1>
        {user && (
          <div>
            <span style={{ marginRight: '1rem' }}>Hi, {user.name}</span>
            <button type="button" onClick={handleLogout}>Sign out</button>
          </div>
        )}
      </header>

      {error && <div className="card error-text">{error}</div>}

      {!user && (
        <div className="card">
          {authMode === 'login' ? (
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          ) : (
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
          )}
          <div className="auth-toggle">
            {authMode === 'login' ? (
              <p>
                Need an account?{' '}
                <button type="button" onClick={() => setAuthMode('register')}>Sign up</button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button type="button" onClick={() => setAuthMode('login')}>Sign in</button>
              </p>
            )}
          </div>
        </div>
      )}

      {user && (
        <>
          <div className="card">
            <WorkoutForm onSubmit={handleCreateWorkout} isLoading={isLoading} />
          </div>

          {summary && (
            <div className="card">
              <h2>Summary</h2>
              <p>Total workouts logged: <strong>{summary.totalWorkouts}</strong></p>
              <p>Total sets completed: <strong>{summary.totalSets}</strong></p>
              <p>Last workout: <strong>{new Date(summary.mostRecent.date).toLocaleDateString()}</strong></p>
            </div>
          )}

          <div className="card">
            <h2>Progress</h2>
            {progress.length === 0 ? (
              <div className="empty-state">Add workouts to visualize your progress.</div>
            ) : (
              <ProgressChart data={progress} />
            )}
          </div>

          <div className="card">
            <h2>Workout History</h2>
            {workouts.length === 0 ? (
              <div className="empty-state">No workouts yet. Log your first session above!</div>
            ) : (
              <WorkoutList workouts={workouts} onDelete={handleDeleteWorkout} isLoading={isLoading} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
