const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((e) => {
            return res.status(e.statusCode || 500).json({
                success: false,
                message: e.message || 'Internal Server Error',
                errors: e.errors || []
            })
        })
    }
}

export { asyncHandler }