import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
    generateVerificationCode,
    sendVerificationEmail,
} from "../utils/verification.js";
import { generateToken } from "../utils/accessToken.js";
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
    res.send("Login route");
};

export const logout = async (req, res) => {
    res.send("Logout route");
};
