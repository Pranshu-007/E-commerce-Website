import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import userModel from "../models/userModel.js";
import { fail, ok } from "../utils/http.js";
import { safeEqual } from "../utils/crypto.js";
import { sendPasswordResetEmail } from "../services/email.js";

const USER_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '7d'
const ADMIN_TOKEN_TTL = process.env.JWT_EXPIRES_ADMIN || '8h'

const createToken = (id) => {
    return jwt.sign({ id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: USER_TOKEN_TTL })
}

const loginUser = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return fail(res, 400, "Email and password are required")
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return fail(res, 401, "Invalid credentials")
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return fail(res, 401, 'Invalid credentials')
        }

        const token = createToken(user._id)
        return ok(res, { token })
    } catch (error) {
        console.log(error);
        return fail(res, 500, error.message)
    }
}

const registerUser = async (req, res) => {
    try {
        const name = String(req.body.name || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const { password } = req.body;

        if (!name || !email || !password) {
            return fail(res, 400, "Name, email and password are required")
        }

        const exists = await userModel.findOne({ email });
        if (exists) {
            return fail(res, 409, "User already exists")
        }

        if (!validator.isEmail(email)) {
            return fail(res, 400, "Please enter a valid email")
        }
        if (password.length < 8) {
            return fail(res, 400, "Please enter a strong password")
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)

        return ok(res, { token }, 201)
    } catch (error) {
        console.log(error);
        return fail(res, 500, error.message)
    }
}

const adminLogin = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase()
        const password = String(req.body.password || '')

        const emailOk = email === String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
        const passwordOk = safeEqual(password, process.env.ADMIN_PASSWORD || '')

        if (!emailOk || !passwordOk) {
            return fail(res, 401, "Invalid credentials")
        }

        const token = jwt.sign(
            { role: 'admin', email: process.env.ADMIN_EMAIL },
            process.env.JWT_SECRET,
            { expiresIn: ADMIN_TOKEN_TTL }
        )
        return ok(res, { token })
    } catch (error) {
        console.log(error);
        return fail(res, 500, error.message)
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password -cartData')
        if (!user) {
            return fail(res, 404, 'User not found')
        }
        return ok(res, { user })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body

        if (!name?.trim()) {
            return fail(res, 400, 'Name is required')
        }

        const updateData = {
            name: name.trim(),
            phone: phone?.trim() || '',
            address: {
                firstName: address?.firstName?.trim() || '',
                lastName: address?.lastName?.trim() || '',
                street: address?.street?.trim() || '',
                city: address?.city?.trim() || '',
                state: address?.state?.trim() || '',
                zipcode: address?.zipcode?.trim() || '',
                country: address?.country?.trim() || '',
            },
        }

        const user = await userModel
            .findByIdAndUpdate(req.userId, updateData, { new: true })
            .select('-password -cartData')

        return ok(res, { message: 'Profile updated successfully', user })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return fail(res, 400, 'Current and new password are required')
        }

        if (newPassword.length < 8) {
            return fail(res, 400, 'New password must be at least 8 characters')
        }

        const user = await userModel.findById(req.userId)
        if (!user) {
            return fail(res, 404, 'User not found')
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return fail(res, 401, 'Current password is incorrect')
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        await userModel.findByIdAndUpdate(req.userId, { password: hashedPassword })

        return ok(res, { message: 'Password changed successfully' })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase()
        if (!validator.isEmail(email)) {
            return fail(res, 400, 'Please enter a valid email')
        }

        const user = await userModel.findOne({ email })
        const generic = { message: 'If that email exists, a reset link has been sent' }
        if (!user) {
            return ok(res, generic)
        }

        const rawToken = crypto.randomBytes(32).toString('hex')
        const hashed = crypto.createHash('sha256').update(rawToken).digest('hex')
        user.resetPasswordToken = hashed
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000
        await user.save()

        const origin = process.env.FRONTEND_URL || 'http://localhost:5173'
        const resetUrl = `${origin}/reset-password?token=${rawToken}`
        await sendPasswordResetEmail(email, resetUrl)
        return ok(res, generic)
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body
        if (!token || !newPassword || newPassword.length < 8) {
            return fail(res, 400, 'A valid token and new password are required')
        }

        const hashed = crypto.createHash('sha256').update(String(token)).digest('hex')
        const user = await userModel.findOne({
            resetPasswordToken: hashed,
            resetPasswordExpires: { $gt: Date.now() },
        })
        if (!user) {
            return fail(res, 400, 'Reset link is invalid or has expired')
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)
        user.resetPasswordToken = ''
        user.resetPasswordExpires = 0
        await user.save()
        return ok(res, { message: 'Password reset successfully' })
    } catch (error) {
        console.log(error)
        return fail(res, 500, error.message)
    }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, changePassword, forgotPassword, resetPassword }
