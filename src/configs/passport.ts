import { TokenType } from '@prisma/client'
import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt'
import { Request } from 'express'

import prisma from '@/client'
import config from './config'

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: (req: Request) => {
    // First try to get token from cookie
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken
    }
    // Then try to get token from Authorization header
    return ExtractJwt.fromAuthHeaderAsBearerToken()(req)
  }
}

const jwtVerify: VerifyCallback = async (payload, done) => {
  try {
    if (payload.type !== TokenType.ACCESS) {
      return done(new Error('Invalid token type'), false)
    }
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      where: { id: payload.sub }
    })
    if (!user) {
      return done(null, false)
    }
    return done(null, user)
  } catch (error) {
    return done(error, false)
  }
}

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify)
