import { Request, Response, NextFunction } from "express";
import { verifyAndRefreshToken } from "../services/auth";

// Extend Express Request to include tokens property
declare global {
  namespace Express {
    interface Request {
      tokens?: {
        access_token: string;
        refresh_token?: string;
        expiry_date: number;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const tokens = await verifyAndRefreshToken(token);

    // Attach tokens to request for downstream use
    req.tokens = tokens;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};
