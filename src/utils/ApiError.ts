class ApiError extends Error {
  statusCode: number
  isOperational: boolean
  errors: {
    path: string | number
    message: string
  }[]

  constructor(
    statusCode: number,
    message: string | undefined,
    errors: {
      path: string | number
      message: string
    }[] = [],
    isOperational = true,
    stack = ''
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.errors = errors
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default ApiError
