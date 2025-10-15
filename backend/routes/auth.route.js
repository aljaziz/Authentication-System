import { Router } from "express";
import {
    forgotPassword,
    login,
    logout,
    resetPassword,
    signup,
    verifyemail,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-email", verifyemail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
