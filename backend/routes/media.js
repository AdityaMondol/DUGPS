import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import Media from '../models/MediaNative.js'
import User from '../models/UserNative.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/media'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|avi|mp3|wav/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

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

// Create new media (teachers only)
router.post('/', authenticateToken, requireTeacher, upload.single('file'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['image', 'video', 'audio', 'document']).withMessage('Invalid category'),
  body('tags').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description, category, tags } = req.body
    const file = req.file
    console.log(`🖼️ Uploading media: "${title}" by user ${req.user.id}`)

    if (!file) {
      console.log(`❌ No file provided for media upload by user ${req.user.id}`)
      return res.status(400).json({ message: 'File is required' })
    }

    console.log(`📁 File details: ${file.filename} (${file.size} bytes, ${file.mimetype})`)

    // Get user's full name from database
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const authorName = `${user.first_name} ${user.last_name}`.trim()
    console.log(`👤 Author name: ${authorName}`)

    const mediaData = {
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      file_name: file.filename,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      author_id: req.user.id,
      author_name: authorName
    }

    const newMedia = new Media(mediaData)
    await newMedia.save()
    console.log(`✅ Media uploaded successfully: "${title}" (ID: ${newMedia.id})`)
    
    res.status(201).json({
      message: 'Media uploaded successfully',
      media: newMedia
    })
  } catch (error) {
    console.error('Media upload error:', error)
    res.status(500).json({ message: 'Server error during media upload' })
  }
})

// Get all media (public access - no authentication required)
router.get('/', async (req, res) => {
  try {
    const { category, author, limit = 20, offset = 0 } = req.query
    let query = {}

    // Filter by category
    if (category) {
      query.category = category
    }

    // Filter by author
    if (author) {
      query.author_id = author
    }

    const mediaList = await Media.find(query)
    
    // Sort by created_at descending
    mediaList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    // Apply pagination
    const startIndex = parseInt(offset)
    const endIndex = startIndex + parseInt(limit)
    const paginatedMedia = mediaList.slice(startIndex, endIndex)

    res.json({
      media: paginatedMedia,
      total: mediaList.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Get media error:', error)
    res.status(500).json({ message: 'Server error fetching media' })
  }
})

// Get media by ID (public access - no authentication required)
router.get('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      return res.status(404).json({ message: 'Media not found' })
    }
    res.json({ media })
  } catch (error) {
    console.error('Get media by ID error:', error)
    res.status(500).json({ message: 'Server error fetching media' })
  }
})

// Update media (author or teacher only)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['image', 'video', 'audio', 'document']).withMessage('Invalid category'),
  body('tags').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const media = await Media.findById(req.params.id)
    if (!media) {
      return res.status(404).json({ message: 'Media not found' })
    }

    // Check if user is author or teacher
    if (media.author_id !== req.user.id && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Permission denied' })
    }

    const updates = {}
    if (req.body.title) updates.title = req.body.title
    if (req.body.description) updates.description = req.body.description
    if (req.body.category) updates.category = req.body.category
    if (req.body.tags) updates.tags = req.body.tags.split(',').map(tag => tag.trim())

    // Update the media
    Object.assign(media, updates)
    await media.save()
    
    res.json({
      message: 'Media updated successfully',
      media: media
    })
  } catch (error) {
    console.error('Update media error:', error)
    res.status(500).json({ message: 'Server error updating media' })
  }
})

// Delete media (author only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      return res.status(404).json({ message: 'Media not found' })
    }

    // Check if user is author
    if (media.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can delete this media' })
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(media.file_path)) {
        fs.unlinkSync(media.file_path)
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError)
    }

    const deletedMedia = await Media.findByIdAndDelete(req.params.id)
    res.json({
      message: 'Media deleted successfully',
      media: deletedMedia
    })
  } catch (error) {
    console.error('Delete media error:', error)
    res.status(500).json({ message: 'Server error deleting media' })
  }
})

// Get media by current user (teachers only)
router.get('/my/uploads', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const userMedia = await Media.find({ author_id: req.user.id })
    // Sort by created_at descending
    userMedia.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    res.json({ media: userMedia })
  } catch (error) {
    console.error('Get user media error:', error)
    res.status(500).json({ message: 'Server error fetching user media' })
  }
})

export default router
