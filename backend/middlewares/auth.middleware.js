import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized- no token" });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized- invalid token",
            });
        }
        req.userId = decode.userId;
        next();
    } catch (error) {
        console.log("Error in verifying token", error);
        return res
            .status(500)
            .json({ success: false, message: "Server error" });
    }
};
