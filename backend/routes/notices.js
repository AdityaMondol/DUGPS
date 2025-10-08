import express from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import Notice from '../models/NoticeNative.js'
import User from '../models/UserNative.js'

const router = express.Router()

// Middleware to verify JWT and extract user
const authenticateToken = (req, res, next) => {
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

// Middleware to check if user is teacher
const requireTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Teacher access required' })
  }
  next()
}

// Create notice (teachers only)
router.post('/', authenticateToken, requireTeacher, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('category').optional().isIn(['academic', 'administrative', 'event', 'announcement']).withMessage('Invalid category'),
  body('tags').optional().isString(),
  body('expiry_date').optional().isISO8601().withMessage('Invalid expiry date'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, content, priority = 'medium', category = 'announcement', tags, expiry_date } = req.body
    console.log(`📃 Creating notice: "${title}" by user ${req.user.id}`)

    // Get user's full name from database
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const authorName = `${user.first_name} ${user.last_name}`.trim()
    console.log(`👤 Author name: ${authorName}`)

    const noticeData = {
      title,
      content,
      priority,
      category,
      tags: tags && tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      author_id: req.user.id,
      author_name: authorName,
      expiry_date: expiry_date && expiry_date.trim() ? expiry_date : null
    }

    console.log('📋 Notice data to save:', JSON.stringify(noticeData, null, 2))

    const newNotice = new Notice(noticeData)
    await newNotice.save()
    console.log(`✅ Notice created successfully: "${title}" (ID: ${newNotice.id})`)
    console.log('📋 Saved notice data:', JSON.stringify(newNotice.toJSON(), null, 2))
    
    res.status(201).json({
      message: 'Notice created successfully',
      notice: newNotice.toJSON()
    })
  } catch (error) {
    console.error('Create notice error:', error)
    res.status(500).json({ message: 'Server error during notice creation' })
  }
})

// Get all notices (logged in users only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, priority, author, limit = 20, offset = 0 } = req.query
    let query = {}

    // Filter by category
    if (category) {
      query.category = category
    }

    // Filter by priority
    if (priority) {
      query.priority = priority
    }

    // Filter by author
    if (author) {
      query.author_id = author
    }

    // Get all notices first, then filter
    let noticesList = await Notice.find(query)
    
    // Filter out expired notices
    const now = new Date()
    noticesList = noticesList.filter(notice => {
      if (!notice.expiry_date) return true
      return new Date(notice.expiry_date) > now
    })
    
    // Sort by created_at descending
    noticesList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    // Apply pagination
    const startIndex = parseInt(offset)
    const endIndex = startIndex + parseInt(limit)
    const paginatedNotices = noticesList.slice(startIndex, endIndex)

    res.json({
      notices: paginatedNotices,
      total: noticesList.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Get notices error:', error)
    res.status(500).json({ message: 'Server error fetching notices' })
  }
})

// Get notice by ID (logged in users only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' })
    }
    res.json({ notice })
  } catch (error) {
    console.error('Get notice by ID error:', error)
    res.status(500).json({ message: 'Server error fetching notice' })
  }
})

// Update notice (author only)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('category').optional().isIn(['academic', 'administrative', 'event', 'announcement']).withMessage('Invalid category'),
  body('tags').optional().isString(),
  body('expiry_date').optional().isISO8601().withMessage('Invalid expiry date'),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const notice = await Notice.findById(req.params.id)
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' })
    }

    // Check if user is author
    if (notice.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can update this notice' })
    }

    const updates = {}
    if (req.body.title) updates.title = req.body.title
    if (req.body.content) updates.content = req.body.content
    if (req.body.priority) updates.priority = req.body.priority
    if (req.body.category) updates.category = req.body.category
    if (req.body.tags) updates.tags = req.body.tags.split(',').map(tag => tag.trim())
    if (req.body.expiry_date) updates.expiry_date = req.body.expiry_date

    // Update the notice
    Object.assign(notice, updates)
    await notice.save()
    
    res.json({
      message: 'Notice updated successfully',
      notice: notice
    })
  } catch (error) {
    console.error('Update notice error:', error)
    res.status(500).json({ message: 'Server error updating notice' })
  }
})

// Delete notice (author only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' })
    }

    // Check if user is author
    if (notice.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can delete this notice' })
    }

    const deletedNotice = await Notice.findByIdAndDelete(req.params.id)
    res.json({
      message: 'Notice deleted successfully',
      notice: deletedNotice
    })
  } catch (error) {
    console.error('Delete notice error:', error)
    res.status(500).json({ message: 'Server error deleting notice' })
  }
})

// Get notices by current user (teachers only)
router.get('/my/notices', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const userNotices = await Notice.find({ author_id: req.user.id })
    // Sort by created_at descending
    userNotices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ notices: userNotices })
  } catch (error) {
    console.error('Get user notices error:', error)
    res.status(500).json({ message: 'Server error fetching user notices' })
  }
})

export default router
