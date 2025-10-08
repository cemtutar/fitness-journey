const jwt = require('jsonwebtoken')
const { getUserById } = require('../dataStore')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function authenticate (req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = getUserById(payload.sub)
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    }
    next()
  } catch (error) {
    console.error('Failed to verify token', error)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = {
  authenticate,
  JWT_SECRET
}
