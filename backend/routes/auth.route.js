import { Router } from "express";
import { login, logout, signup, verifyemail } from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-email", verifyemail);

export default router;
