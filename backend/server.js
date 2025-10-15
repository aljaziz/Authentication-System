import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});
