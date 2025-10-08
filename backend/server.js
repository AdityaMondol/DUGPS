import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import noticeRoutes from './routes/notices.js'
import feedbackRoutes from './routes/feedbacks.js'
import mediaRoutes from './routes/media.js'
import database from './config/nativeDatabase.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const ip = req.ip || req.connection.remoteAddress
  
  console.log(`🌐 [${timestamp}] ${method} ${url} - IP: ${ip}`)
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
    const logBody = { ...req.body }
    // Remove sensitive fields from logs
    delete logBody.password
    delete logBody.token
    if (Object.keys(logBody).length > 0) {
      console.log(`📝 Request body:`, JSON.stringify(logBody, null, 2))
    }
  }
  
  // Log response when it finishes
  const originalSend = res.send
  res.send = function(data) {
    const statusCode = res.statusCode
    const statusEmoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅'
    console.log(`${statusEmoji} [${timestamp}] ${method} ${url} - ${statusCode}`)
    
    // Log error responses
    if (statusCode >= 400 && data) {
      try {
        const parsedData = JSON.parse(data)
        if (parsedData.message || parsedData.error) {
          console.log(`🚫 Error details:`, parsedData.message || parsedData.error)
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
    
    originalSend.call(this, data)
  }
  
  next()
})

// Static files for uploads
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/notices', noticeRoutes)
app.use('/api/feedbacks', feedbackRoutes)
app.use('/api/media', mediaRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Test database connection endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await database.testConnection()
    const stats = await database.getStats()
    
    if (result.success) {
      res.json({ 
        status: 'ok', 
        message: result.message,
        database_type: 'Native File Database',
        stats: stats,
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(500).json({ 
        status: 'error', 
        message: result.message
      })
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
  console.log(`🎯 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔍 DB Test: http://localhost:${PORT}/api/db-test`)
  
  // Test database connection on startup
  console.log('\n🔌 Testing native database connection...')
  try {
    const result = await database.testConnection()
    if (result.success) {
      console.log('✅ Native file database connection successful')
      console.log('📁 Database type: File-based storage')
    } else {
      console.log('❌ Database connection failed:', result.message)
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message)
  }
  console.log('\n Server startup completed!\n')
})

export default app
