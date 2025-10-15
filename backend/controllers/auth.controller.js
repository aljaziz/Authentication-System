import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
    generateVerificationCode,
    sendVerificationEmail,
} from "../utils/verification.js";
import { generateToken } from "../utils/accessToken.js";
import { sendWelcomeEmail } from "../template/email.template.js";
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
