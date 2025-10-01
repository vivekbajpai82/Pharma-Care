const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const DoctorStats = require('../models/DoctorStats');

const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendResetPasswordEmail, sendWelcomeEmail } = require('../utils/emailService');



router.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        // Explicitly map fields from req.body
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please provide name, email, and password.' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user with mapped fields
        user = new User({
            name,
            email,
            password,
            // Map optional fields safely
            registrationNumber: req.body.registrationNumber || '',
            speciality: req.body.speciality || '',
            education: req.body.education || '',
            experience: req.body.experience || '',
            hospitalAffiliation: req.body.hospitalAffiliation || '',
            hospitalAddress: req.body.hospitalAddress || '',
            hospitalPhone: req.body.hospitalPhone || '',
            hospitalEmail: req.body.hospitalEmail || ''
        });
        
        // If a file was uploaded, add its Cloudinary URL
        if (req.file && req.file.path) {
            user.profileImage = req.file.path;
        }

        // Save the new user (password will be hashed by pre-save hook)
        await user.save();

        // Create DoctorStats document for new user
        const doctorStats = new DoctorStats({
            doctor: user._id,
            medicineUsage: []
        });
        await doctorStats.save();

        // Send welcome email (optional - won't block registration if fails)
        try {
            await sendWelcomeEmail(email, name);
            console.log('Welcome email sent successfully to:', email);
        } catch (emailError) {
            console.log('Welcome email failed but registration successful:', emailError.message);
        }

        res.status(201).json({ msg: 'User registered successfully' });

    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});










// @route   POST /api/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/auth
// @desc    Get logged in user data
router.get('/auth', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctor-stats
// @desc    Get doctor's statistics
router.get('/doctor-stats', auth, async (req, res) => {
    try {
        let stats = await DoctorStats.findOne({ doctor: req.user.id })
            .populate('doctor', 'name speciality');
        
        if (!stats) {
            // If stats don't exist, create default ones
            stats = new DoctorStats({
                doctor: req.user.id,
                medicineUsage: []
            });
            await stats.save();
            await stats.populate('doctor', 'name speciality');
        }
        
        res.json(stats);
    } catch (err) {
        console.error('Doctor stats error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/profile
// @desc    Update doctor's profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, speciality, education, experience, hospitalAffiliation } = req.body;
        const updatedFields = { name, speciality, education, experience, hospitalAffiliation };
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updatedFields },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error("!! PROFILE UPDATE ERROR !!", err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/upload-photo
// @desc    Upload doctor's profile photo after login
router.post('/upload-photo', [auth, upload.single('doctorPhoto')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
        
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.profileImage = req.file.path;
        await user.save();
        res.json({ msg: 'Image uploaded successfully', filePath: user.profileImage });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/forgot-password
// @desc    Send password reset email
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate email input
        if (!email) {
            return res.status(400).json({ msg: 'Please provide an email address' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'No account found with that email address' });
        }

        // Generate reset token using the User model method
        const resetToken = user.getResetPasswordToken();
        
        // Save user with reset token (skip validation to avoid password required error)
        await user.save({ validateBeforeSave: false });

        // Try to send email with reset token
        try {
            const emailResult = await sendResetPasswordEmail(email, resetToken, user.name);

            if (emailResult.success) {
                return res.status(200).json({ 
                    success: true,
                    msg: 'Password reset email sent successfully. Please check your inbox.' 
                });
            } else {
                throw new Error('Email service returned error');
            }
        } catch (emailError) {
            console.error('Password reset email failed:', emailError.message);
            
            // Email failed but token is generated
            return res.status(200).json({ 
                success: false,
                msg: 'Unable to send reset email at the moment. Please contact support at +91-9335373004 or try again later.',
                note: 'Your reset token has been generated but email delivery is temporarily unavailable.'
            });
        }
        
    } catch (err) {
        console.error('Forgot password error:', err.message);
        res.status(500).json({ msg: 'Server error. Please try again later.' });
    }
});

// @route   POST /api/reset-password/:resetToken
// @desc    Reset user password using token
router.post('/reset-password/:resetToken', async (req, res) => {
    try {
        const { password } = req.body;
        const { resetToken } = req.params;

        // Validate password input
        if (!password) {
            return res.status(400).json({ msg: 'Please provide a new password' });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
        }

        // Hash the token and find user
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired reset token' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Save user (password will be hashed by pre-save hook)
        await user.save();

        res.status(200).json({ 
            success: true,
            msg: 'Password reset successful. You can now login with your new password.' 
        });

    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(500).json({ msg: 'Server error. Please try again later.' });
    }
});

module.exports = router;