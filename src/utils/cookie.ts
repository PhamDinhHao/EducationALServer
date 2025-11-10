import { Response } from 'express'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  path: '/'
}

export const setCookie = (res: Response, name: string, value: string, maxAge: number) => {
  res.cookie(name, value, {
    ...cookieOptions,
    maxAge
  })
}

export const clearCookie = (res: Response, name: string) => {
  res.clearCookie(name, {
    ...cookieOptions
  })
}
