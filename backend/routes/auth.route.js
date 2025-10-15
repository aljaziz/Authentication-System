import { Router } from "express";
import {
    checkAuth,
    forgotPassword,
    login,
    logout,
    resetPassword,
    signup,
    verifyemail,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-email", verifyemail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
