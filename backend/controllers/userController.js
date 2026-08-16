import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        
        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token})
        } else {
            res.json({success:false,message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password -cartData')
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body

        if (!name?.trim()) {
            return res.json({ success: false, message: 'Name is required' })
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

        res.json({ success: true, message: 'Profile updated successfully', user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.json({ success: false, message: 'Current and new password are required' })
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: 'New password must be at least 8 characters' })
        }

        const user = await userModel.findById(req.userId)
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: 'Current password is incorrect' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        await userModel.findByIdAndUpdate(req.userId, { password: hashedPassword })

        res.json({ success: true, message: 'Password changed successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, changePassword }