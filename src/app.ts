import cors from 'cors'
import helmet from 'helmet'
import express from 'express'
import passport from 'passport'
import httpStatus from 'http-status'
import compression from 'compression'
import cookieParser from 'cookie-parser'

import config from '@configs/config'
import morgan from '@configs/morgan'
import { jwtStrategy } from '@configs/passport'

// import xss from '@middlewares/xss'
import { errorConverter, errorHandler } from '@/middlewares/error'
import { authLimiter } from '@middlewares/rateLimiter'

import routes from '@routes/v1'
import ApiError from '@utils/ApiError'
import path from 'path'

const app = express()

if (config.env !== 'test') {
  app.use(morgan.successHandler)
  app.use(morgan.errorHandler)
}

// set security HTTP headers with CSP configuration for admin dashboard
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://code.jquery.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        frameSrc: ["'self'"]
      }
    }
  })
)

// parse json request body (increase limit for base64 images)
app.use(express.json({ limit: '50mb' }))

// parse urlencoded request body (increase limit for large payloads)
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// parse cookies
app.use(cookieParser())

// sanitize request data
// app.use(xss())

// gzip compression
app.use(compression())

// enable cors
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://education-sandy-xi.vercel.app' : 'http://localhost:5175',
    credentials: true
  })
)
app.options(
  '*',
  cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://education-sandy-xi.vercel.app' : 'http://localhost:5175',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
  })
)

// jwt authentication
app.use(passport.initialize())
passport.use('jwt', jwtStrategy)

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/api/v1/auth', authLimiter)
}

// serve static files for admin dashboard
app.use('/admin', express.static(path.join(__dirname, '../public/admin')))
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'))
})

// v1 api routes
app.use('/api/v1', routes)

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'))
})

// convert error to ApiError, if needed
app.use(errorConverter)

// handle error
app.use(errorHandler)

export default app
