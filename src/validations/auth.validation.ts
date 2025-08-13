import { z } from 'zod'

import { passwordSchema } from './custom.validation'

// Register
const register = {
  body: z.object({
    email: z.string().email(),
    password: passwordSchema
  })
} as const

// Login
const login = {
  body: z.object({
    email: z.string(),
    password: z.string()
  })
} as const

// Logout
const logout = {
  body: z.object({
    refreshToken: z.string()
  })
} as const

// Refresh Tokens
const refreshTokens = {
  body: z.object({
    refreshToken: z.string()
  })
} as const

// Forgot Password
const forgotPassword = {
  body: z.object({
    email: z.string().email()
  })
} as const

// Reset Password
const resetPassword = {
  query: z.object({
    token: z.string()
  }),
  body: z.object({
    password: passwordSchema
  })
} as const

// Verify Email
const verifyEmail = {
  query: z.object({
    token: z.string()
  })
} as const

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
}
