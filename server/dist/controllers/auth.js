"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.handleAuthCallback = exports.getAuthUrl = void 0;
const auth_1 = require("../services/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getAuthUrl = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const url = (0, auth_1.generateAuthUrl)();
    res.json({
        status: "success",
        data: { url },
    });
});
exports.handleAuthCallback = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
        return res.status(400).json({
            status: "error",
            message: "Authorization code is required",
        });
    }
    const tokens = await (0, auth_1.getTokensFromCode)(code);
    const frontendUrl = `http://localhost:5173/google/callback?token=${tokens.access_token}`;
    res.redirect(frontendUrl);
});
exports.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({
            status: "error",
            message: "Token is required",
        });
    }
    const tokens = await (0, auth_1.verifyAndRefreshToken)(token);
    res.json({
        status: "success",
        data: { tokens },
    });
});
