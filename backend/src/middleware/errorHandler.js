const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal server error'

    console.error(`[ERROR] ${statusCode} - ${message}`)
    if (err.stack) console.error(err.stack)

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
}

export default errorHandler
