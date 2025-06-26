// src/app.ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import chatRoutes from './routes/chat.routes'

// Load environment variables
dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 5000

// Middleware
app.use(
  cors({
    origin: '*', // Allow all origins for testing
    credentials: true,
  })
)

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

// Health check route
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint was called')
  res.status(200).json({ status: 'ok', message: 'Server is running' })
})

// Add a root route for basic testing
app.get('/', (req, res) => {
  console.log('Root endpoint was called')
  res.status(200).json({ message: 'Welcome to SASS API' })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(process.env.PORT)
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`Health check available at http://localhost:${PORT}/api/health`)
})

export default app
