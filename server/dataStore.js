const fs = require('fs')
const path = require('path')

const DB_FILE = path.join(__dirname, 'db.json')

const defaultData = {
  users: [],
  workouts: []
}

function ensureFile () {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2))
  }
}

function readData () {
  ensureFile()
  const raw = fs.readFileSync(DB_FILE, 'utf-8')
  try {
    const parsed = JSON.parse(raw)
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : []
    }
  } catch (error) {
    console.error('Failed to parse database file, resetting to defaults.', error)
    return { ...defaultData }
  }
}

function writeData (data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

function getUserByEmail (email) {
  const data = readData()
  return data.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

function getUserById (id) {
  const data = readData()
  return data.users.find((user) => user.id === id) || null
}

function createUser (user) {
  const data = readData()
  data.users.push(user)
  writeData(data)
  return user
}

function getWorkoutsByUserId (userId) {
  const data = readData()
  return data.workouts.filter((workout) => workout.userId === userId)
}

function saveWorkout (workout) {
  const data = readData()
  const existingIndex = data.workouts.findIndex((item) => item.id === workout.id)
  if (existingIndex >= 0) {
    data.workouts[existingIndex] = workout
  } else {
    data.workouts.push(workout)
  }
  writeData(data)
  return workout
}

function deleteWorkout (id, userId) {
  const data = readData()
  const originalLength = data.workouts.length
  data.workouts = data.workouts.filter((workout) => !(workout.id === id && workout.userId === userId))
  const deleted = data.workouts.length !== originalLength
  if (deleted) {
    writeData(data)
  }
  return deleted
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  getWorkoutsByUserId,
  saveWorkout,
  deleteWorkout
}
