import jwt from 'jsonwebtoken'
import { fail } from '../utils/http.js'

const authUser = async (req, res, next) => {
    const { token } = req.headers

    if (!token) {
        return fail(res, 401, 'Not Authorized Login Again')
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded?.id || decoded.role === 'admin') {
            return fail(res, 401, 'Not Authorized Login Again')
        }

        req.userId = decoded.id
        req.body = req.body || {}
        req.body.userId = decoded.id
        next()
    } catch (error) {
        const message = error.name === 'TokenExpiredError'
            ? 'Session expired. Please login again'
            : 'Not Authorized Login Again'
        return fail(res, 401, message)
    }
}

export default authUser
