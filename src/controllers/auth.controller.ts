import _ from 'lodash'
import httpStatus from 'http-status'
import { User } from '@prisma/client'

import catchAsync from '@utils/catchAsync'
import { authService, userService, tokenService, emailService } from '@/services'
import config from '@/configs/config'
import { clearCookie, setCookie } from '@/utils/cookie'
import { isPasswordMatch, encryptPassword } from '@utils/encryption'
import ApiError from '@/utils/ApiError'
const register = catchAsync(async (req, res) => {
  const { email, password } = req.body
  const user = await userService.createUser(email, password)
  const userWithoutPassword = _.omit(user, ['password', 'createdAt', 'updatedAt'])
  res.status(httpStatus.CREATED).send({
    data: { user: userWithoutPassword },
    success: true,
    message: 'User registered successfully'
  })
})

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body
  const user = await authService.loginUserWithEmailAndPassword(email, password)
  const userWithoutPassword = _.omit(user, ['password', 'createdAt', 'updatedAt'])
  const tokens = await tokenService.generateAuthTokens(user)

  setCookie(res, 'accessToken', tokens.access.token, config.jwt.accessExpirationMinutes * 60 * 1000)

  if (tokens.refresh?.token) {
    setCookie(res, 'refreshToken', tokens.refresh.token, config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000)
  }

  res.status(httpStatus.OK).send({
    data: { user: userWithoutPassword },
    success: true,
    message: 'User logged in successfully'
  })
})

const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies
  if (!refreshToken) {
    res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: 'Refresh token is required'
    })
    return
  }
  await authService.logout(refreshToken)

  clearCookie(res, 'accessToken')
  clearCookie(res, 'refreshToken')

  res.status(httpStatus.NO_CONTENT).send()
})

const refreshTokens = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    res.status(httpStatus.UNAUTHORIZED).send({
      success: false,
      message: 'Please login to continue'
    })
    return
  }

  const tokens = await authService.refreshAuth(refreshToken)

  setCookie(res, 'accessToken', tokens.access.token, config.jwt.accessExpirationMinutes * 60 * 1000)

  if (tokens.refresh?.token) {
    setCookie(res, 'refreshToken', tokens.refresh.token, config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000)
  }

  res.status(httpStatus.OK).send({
    data: { tokens },
    success: true,
    message: 'Tokens refreshed successfully'
  })
})

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email)
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken)
  res.status(httpStatus.NO_CONTENT).send()
})

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token as string, req.body.password)
  res.status(httpStatus.NO_CONTENT).send()
})

const sendVerificationEmail = catchAsync(async (req, res) => {
  const user = req.user as User
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user)
  await emailService.sendVerificationEmail(user.email, verifyEmailToken)
  res.status(httpStatus.NO_CONTENT).send()
})

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token as string)
  res.status(httpStatus.NO_CONTENT).send()
})

const getMe = catchAsync(async (req, res) => {
  const user = req.user as User
  console.log('user:', user)
  res.status(httpStatus.OK).send({
    data: { user },
    success: true,
    message: 'User details fetched successfully'
  })
})

const revokeTokens = catchAsync(async (req, res) => {
  const user = req.user as User
  await authService.revokeTokens(user.id)
  res.status(httpStatus.NO_CONTENT).send()
})

const updateMe = catchAsync(async (req, res) => {
  const user = req.user as User

  console.log('user,', user)
  console.log('body', req.body);
  const { name, email } = req.body
  
  // if (email && email !== user.email) {
  //   const existingUser = await userService.getUserByEmail(email)
  //   if (existingUser) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken')
  //   }
  // }

  const updatedUser = await userService.updateUserById(user.id, { name, email }, ['id', 'email', 'name', 'role', 'isEmailVerified'])
  const userWithoutPassword = _.omit(updatedUser, ['password', 'createdAt', 'updatedAt'])
  
  res.status(httpStatus.OK).send({
    data: { user: userWithoutPassword },
    success: true,
    message: 'Profile updated successfully'
  })
})

const changePassword = catchAsync(async (req, res) => {
  const user = req.user as User
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old password and new password are required')
  }

  // Get user with password
  const userWithPassword = await userService.getUserById(user.id, ['id', 'password'])
  if (!userWithPassword) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  // Verify old password
  if (!(await isPasswordMatch(oldPassword, userWithPassword.password as string))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect old password')
  }

  // Update password
  const encryptedPassword = await encryptPassword(newPassword)
  await userService.updateUserById(user.id, { password: encryptedPassword })

  res.status(httpStatus.OK).send({
    success: true,
    message: 'Password changed successfully'
  })
})

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  getMe,
  updateMe,
  changePassword,
  revokeTokens
}
