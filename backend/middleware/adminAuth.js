import jwt from 'jsonwebtoken'
import { fail } from '../utils/http.js'

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return fail(res, 401, 'Not Authorized Login Again')
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.role !== 'admin' || decoded.email !== process.env.ADMIN_EMAIL) {
            return fail(res, 403, 'Not Authorized Login Again')
        }

        req.adminEmail = decoded.email
        next()
    } catch (error) {
        const message = error.name === 'TokenExpiredError'
            ? 'Session expired. Please login again'
            : 'Not Authorized Login Again'
        return fail(res, error.name === 'TokenExpiredError' ? 401 : 403, message)
    }
}

export default adminAuth
