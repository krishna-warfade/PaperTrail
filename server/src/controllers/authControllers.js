const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMail = require('../config/mailer');

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = code;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6366f1;">PaperTrail Password Reset Request</h2>
                <p>Hello ${user.name},</p>
                <p>You requested to reset your password. Use the following 6-digit verification code to complete the reset process:</p>
                <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; margin: 20px 0;">
                    ${code}
                </div>
                <p>Alternatively, you can click the button below to reset your password directly:</p>
                <div style="margin: 25px 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${code}&email=${encodeURIComponent(email)}" 
                       style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 6px; display: inline-block;">
                        Reset Password Directly
                    </a>
                </div>
                <p>This code and link are valid for 10 minutes. If you did not make this request, please ignore this email.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The PaperTrail Team</strong></p>
            </div>
        `;

        try {
            await sendMail(email, 'PaperTrail Password Reset Code', html);
            res.status(200).json({ message: 'Password reset code sent to your email.' });
        } catch (mailErr) {
            console.error('Mail error:', mailErr);
            console.log(`[DEVELOPMENT RESETS] Token for ${email}: ${code}`);
            res.status(200).json({ 
                message: 'Password reset code generated (See server console).',
                devToken: code
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};
