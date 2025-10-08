const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')
const { createUser, getUserByEmail } = require('../dataStore')
const { JWT_SECRET } = require('../middleware/auth')

const router = express.Router()

function createToken (user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  const existing = getUserByEmail(email)
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' })
  }

  const passwordHash = bcrypt.hashSync(password, 10)
  const user = createUser({
    id: uuid(),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  })

  const token = createToken(user)

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = getUserByEmail(email)
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash)
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = createToken(user)

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })
})

module.exports = router
