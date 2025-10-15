import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
    sendPasswordResetEmail,
    sendResetSuccessEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
} from "../utils/email.js";
import { generateToken } from "../utils/accessToken.js";
import { generateVerificationCode } from "../utils/verification.js";
import { log } from "console";

export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required");
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res
                .status(400)
                .json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken: verificationCode,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });
        await newUser.save();

        generateToken(res, newUser._id);
        await sendVerificationEmail(newUser.email, verificationCode);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: { ...newUser._doc, password: undefined },
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }

        generateToken(res, user._id);

        user.lasLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            message: "Logged in successfully",
            user: { ...user._doc, password: undefined },
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("jwt");
    res.status(204).json({ success: true, message: "Logged out successfully" });
};

export const verifyemail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verificarion code",
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`
        );
        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        console.log("Error in forgot password", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        sendResetSuccessEmail(user.email);
        res.status(200).json({
            success: true,
            message: "Password reset successfull",
        });
    } catch (error) {
        console.log("Error reseting password", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checking auth", error);
        res.status(400).json({ success: false, message: error.message });
    }
};
