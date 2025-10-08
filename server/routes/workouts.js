const express = require('express')
const { v4: uuid } = require('uuid')
const { authenticate } = require('../middleware/auth')
const { getWorkoutsByUserId, saveWorkout, deleteWorkout } = require('../dataStore')

const router = express.Router()

function sanitizeExercise (exercise) {
  if (!exercise || typeof exercise.name !== 'string') {
    throw new Error('Each exercise requires a name')
  }

  const name = exercise.name.trim()
  if (!name) {
    throw new Error('Each exercise requires a name')
  }

  const sets = Array.isArray(exercise.sets)
    ? exercise.sets
      .map((set, index) => {
        const reps = Number(set.reps)
        const weight = Number(set.weight)
        if (!Number.isFinite(reps) || reps <= 0 || !Number.isFinite(weight) || weight < 0) {
          throw new Error(`Invalid set at index ${index} for exercise ${name}`)
        }
        return { reps, weight }
      })
    : []

  if (sets.length === 0) {
    throw new Error(`Exercise ${name} requires at least one set`)
  }

  return { name, sets }
}

router.use(authenticate)

router.get('/', (req, res) => {
  const workouts = getWorkoutsByUserId(req.user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  res.json(workouts)
})

router.post('/', (req, res) => {
  const { date, notes, exercises } = req.body

  try {
    const parsedExercises = Array.isArray(exercises) ? exercises.map(sanitizeExercise) : []
    if (parsedExercises.length === 0) {
      return res.status(400).json({ message: 'At least one exercise with valid sets is required' })
    }

    const workout = {
      id: uuid(),
      userId: req.user.id,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      notes: typeof notes === 'string' ? notes.trim() : '',
      exercises: parsedExercises,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    saveWorkout(workout)
    res.status(201).json(workout)
  } catch (error) {
    console.error('Failed to create workout', error)
    res.status(400).json({ message: error.message || 'Invalid workout payload' })
  }
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const existing = getWorkoutsByUserId(req.user.id).find((workout) => workout.id === id)
  if (!existing) {
    return res.status(404).json({ message: 'Workout not found' })
  }

  const { date, notes, exercises } = req.body

  try {
    const parsedExercises = Array.isArray(exercises) ? exercises.map(sanitizeExercise) : existing.exercises
    const updated = {
      ...existing,
      date: date ? new Date(date).toISOString() : existing.date,
      notes: typeof notes === 'string' ? notes.trim() : existing.notes,
      exercises: parsedExercises,
      updatedAt: new Date().toISOString()
    }

    saveWorkout(updated)
    res.json(updated)
  } catch (error) {
    console.error('Failed to update workout', error)
    res.status(400).json({ message: error.message || 'Invalid workout payload' })
  }
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  const deleted = deleteWorkout(id, req.user.id)
  if (!deleted) {
    return res.status(404).json({ message: 'Workout not found' })
  }
  res.status(204).send()
})

module.exports = router
