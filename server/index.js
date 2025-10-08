const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const authRoutes = require('./routes/auth')
const workoutRoutes = require('./routes/workouts')
const progressRoutes = require('./routes/progress')

const app = express()

const PORT = process.env.PORT || 4000
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const allowedOrigins = clientOrigin.split(',').map((origin) => origin.trim())

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins
  })
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({ message: 'GainzKeeper API is running' })
})

app.use('/auth', authRoutes)
app.use('/workouts', workoutRoutes)
app.use('/progress', progressRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use((err, req, res, next) => {
  console.error('Unhandled error', err)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`GainzKeeper API listening on http://localhost:${PORT}`)
})
