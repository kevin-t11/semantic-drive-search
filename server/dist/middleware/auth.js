"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const auth_1 = require("../services/auth");
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        // Verify and refresh token if needed
        const tokens = await (0, auth_1.verifyAndRefreshToken)(token);
        // Attach tokens to request for downstream use
        req.tokens = tokens;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
        });
    }
};
exports.authMiddleware = authMiddleware;
