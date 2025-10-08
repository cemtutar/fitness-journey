const express = require('express')
const { authenticate } = require('../middleware/auth')
const { getWorkoutsByUserId } = require('../dataStore')

const router = express.Router()

router.use(authenticate)

router.get('/', (req, res) => {
  const workouts = getWorkoutsByUserId(req.user.id)
  const exerciseMap = new Map()

  workouts.forEach((workout) => {
    const date = new Date(workout.date).toISOString().slice(0, 10)
    workout.exercises.forEach((exercise) => {
      const volume = exercise.sets.reduce((total, set) => total + set.reps * set.weight, 0)
      if (!exerciseMap.has(exercise.name)) {
        exerciseMap.set(exercise.name, new Map())
      }
      const dateTotals = exerciseMap.get(exercise.name)
      const existingVolume = dateTotals.get(date) || 0
      dateTotals.set(date, existingVolume + volume)
    })
  })

  const exercises = Array.from(exerciseMap.entries()).map(([name, dataMap]) => ({
    name,
    data: Array.from(dataMap.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, volume]) => ({ date, volume }))
  }))

  res.json({ exercises })
})

module.exports = router
