// src/routes.ts
import express from "express";
import {
  getAuthUrl,
  handleAuthCallback,
  refreshToken,
} from "./controllers/auth";
import { getTextFiles, getFileContent } from "./controllers/drive";
import { ingestFiles, searchQuery } from "./controllers/search";
import { authMiddleware } from "./middleware/auth";

const router = express.Router();

// Auth routes
router.get("/auth/url", getAuthUrl);
router.get("/auth/google/callback", handleAuthCallback);
router.post("/auth/refresh", refreshToken);

// Drive routes (protected by auth)
router.get("/files", authMiddleware, getTextFiles);
router.get("/files/:fileId/content", authMiddleware, getFileContent);

// Search routes (protected by auth)
router.post("/ingest", authMiddleware, ingestFiles);
router.post("/search", authMiddleware, searchQuery);

export { router };
