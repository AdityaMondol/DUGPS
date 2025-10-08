import express from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import Feedback from '../models/FeedbackNative.js'
import User from '../models/UserNative.js'

const router = express.Router()

// Middleware to verify JWT and extract user (optional for feedbacks)
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    req.user = null
    next()
  }
}

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' })
  }
}

// Get all feedbacks
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
    
    const feedbacksWithAuthors = feedbacks.map(feedback => ({
      id: feedback.id,
      content: feedback.content,
      author: feedback.author_name || 'Anonymous',
      createdAt: feedback.created_at
    }))
    
    res.json(feedbacksWithAuthors)
  } catch (error) {
    console.error('Get feedbacks error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create feedback
router.post('/',
  authenticateToken,
  [body('content').trim().notEmpty().withMessage('Feedback content is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { content } = req.body
      let authorName = 'Anonymous'
      let userId = null
      console.log(`💬 Creating feedback by ${req.user?.id || 'Anonymous'}`)

      // If user is authenticated, get their name
      if (req.user?.id) {
        const user = await User.findById(req.user.id)
        if (user) {
          authorName = `${user.first_name} ${user.last_name}`
          userId = user.id
        }
      }

      const newFeedback = new Feedback({
        content,
        user_id: userId,
        author_name: authorName
      })

      await newFeedback.save()
      console.log(`✅ Feedback created successfully (ID: ${newFeedback.id}) by ${authorName}`)

      res.status(201).json({
        id: newFeedback.id,
        content: newFeedback.content,
        author: newFeedback.author_name,
        createdAt: newFeedback.created_at
      })
    } catch (error) {
      console.error('Create feedback error:', error)
      res.status(500).json({ message: 'Server error' })
    }
  }
)

// Delete feedback
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    const deletedFeedback = await Feedback.deleteByUserAndId(req.user.id, id)

    if (!deletedFeedback) {
      return res.status(404).json({ message: 'Feedback not found or unauthorized' })
    }

    res.json({ message: 'Feedback deleted successfully' })
  } catch (error) {
    console.error('Delete feedback error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
