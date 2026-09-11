import express from 'express';
import { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, changePassword, forgotPassword, resetPassword } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const userRouter = express.Router();

userRouter.post('/register', authLimiter, registerUser)
userRouter.post('/login', authLimiter, loginUser)
userRouter.post('/admin', authLimiter, adminLogin)
userRouter.post('/forgot-password', authLimiter, forgotPassword)
userRouter.post('/reset-password', authLimiter, resetPassword)
userRouter.get('/profile', authUser, getUserProfile)
userRouter.put('/profile', authUser, updateUserProfile)
userRouter.post('/change-password', authUser, changePassword)

export default userRouter;
