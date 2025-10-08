import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/UserNative.js'

const router = express.Router()

// Signup
router.post('/signup',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'teacher', 'guardian']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { firstName, lastName, email, password, role, teacherCode } = req.body
      console.log(`👥 Signup attempt for: ${email} as ${role}`)

      // Verify teacher code if role is teacher
      if (role === 'teacher' && teacherCode !== process.env.TEACHER_CODE) {
        console.log(`❌ Invalid teacher code for: ${email}`)
        return res.status(400).json({ message: 'Invalid teacher verification code' })
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() })
      if (existingUser) {
        console.log(`❌ User already exists: ${email}`)
        return res.status(400).json({ message: 'User already exists' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const newUser = new User({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role
      })

      await newUser.save()
      console.log(`✅ User created successfully: ${email} (${role})`)

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          role: newUser.role
        }
      })
    } catch (error) {
      console.error('Signup error:', error)
      if (error.code === 11000) {
        return res.status(400).json({ message: 'User with this email already exists' })
      }
      res.status(500).json({ message: 'Server error during signup' })
    }
  }
)

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body
      console.log(`🔑 Login attempt for: ${email}`)

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() })
      if (!user) {
        console.log(`❌ User not found: ${email}`)
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        console.log(`❌ Invalid password for: ${email}`)
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      console.log(`✅ Login successful for: ${email} (${user.role})`)

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      )

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ message: 'Server error during login' })
    }
  }
)

// Get user profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete user account (protected route)
router.delete('/delete-account', async (req, res) => {
  try {
    console.log('🗑️ Account deletion request received')
    
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      console.log('❌ No token provided for account deletion')
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(`👤 Deleting account for user ID: ${decoded.id}`)
    
    // Find the user first to get their information
    const user = await User.findById(decoded.id)
    if (!user) {
      console.log(`❌ User not found: ${decoded.id}`)
      return res.status(404).json({ message: 'User not found' })
    }

    console.log(`📧 Deleting account for: ${user.email}`)

    // Clean up related data before deleting user
    try {
      // Import models for cleanup
      const { default: Notice } = await import('../models/NoticeNative.js')
      const { default: Media } = await import('../models/MediaNative.js')
      const { default: Feedback } = await import('../models/FeedbackNative.js')
      const { default: database } = await import('../config/nativeDatabase.js')
      const fs = await import('fs')

      // Delete user's notices
      const userNotices = await Notice.find({ author_id: decoded.id })
      for (const notice of userNotices) {
        await database.deleteById('notices', notice.id)
        console.log(`🗂️ Deleted notice: ${notice.title}`)
      }

      // Delete user's media
      const userMedia = await Media.find({ author_id: decoded.id })
      for (const media of userMedia) {
        // Delete physical file if exists
        try {
          if (fs.existsSync(media.file_path)) {
            fs.unlinkSync(media.file_path)
            console.log(`📁 Deleted media file: ${media.file_name}`)
          }
        } catch (fileError) {
          console.warn(`⚠️ Could not delete media file: ${media.file_name}`, fileError.message)
        }
        await database.deleteById('media', media.id)
        console.log(`🖼️ Deleted media: ${media.title}`)
      }

      // Delete user's feedback
      const userFeedback = await Feedback.find({ user_id: decoded.id })
      for (const feedback of userFeedback) {
        await database.deleteById('feedbacks', feedback.id)
        console.log(`💬 Deleted feedback: ${feedback.id}`)
      }

      console.log(`🧹 Cleaned up ${userNotices.length} notices, ${userMedia.length} media, ${userFeedback.length} feedback`)
    } catch (cleanupError) {
      console.warn('⚠️ Error during data cleanup:', cleanupError.message)
      // Continue with user deletion even if cleanup fails partially
    }

    // Finally delete the user account
    const deletedUser = await User.findByIdAndDelete(decoded.id)
    if (!deletedUser) {
      console.log(`❌ Failed to delete user: ${decoded.id}`)
      return res.status(500).json({ message: 'Failed to delete user account' })
    }

    console.log(`✅ Successfully deleted account: ${user.email}`)
    res.json({ 
      message: 'Account deleted successfully',
      deletedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Delete account error:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' })
    }
    res.status(500).json({ 
      message: 'Server error during account deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router
