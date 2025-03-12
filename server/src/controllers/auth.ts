import { Request, Response } from "express";
import {
  generateAuthUrl,
  getTokensFromCode,
  verifyAndRefreshToken,
} from "../services/auth";
import { asyncHandler } from "../utils/asyncHandler";

export const getAuthUrl = asyncHandler(async (req: Request, res: Response) => {
  const url = generateAuthUrl();

  res.json({
    status: "success",
    data: { url },
  });
});
export const handleAuthCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Authorization code is required",
      });
    }

    const tokens = await getTokensFromCode(code);

    const frontendUrl = `http://localhost:5173/google/callback?token=${tokens.access_token}`;
    res.redirect(frontendUrl);
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token is required",
      });
    }

    const tokens = await verifyAndRefreshToken(token);

    res.json({
      status: "success",
      data: { tokens },
    });
  }
);
