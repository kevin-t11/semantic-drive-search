"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
// src/routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("./controllers/auth");
const drive_1 = require("./controllers/drive");
const search_1 = require("./controllers/search");
const auth_2 = require("./middleware/auth");
const router = express_1.default.Router();
exports.router = router;
// Auth routes
router.get("/auth/url", auth_1.getAuthUrl);
router.get("/auth/callback", auth_1.handleAuthCallback);
router.post("/auth/refresh", auth_1.refreshToken);
// Drive routes (protected by auth)
router.get("/files", auth_2.authMiddleware, drive_1.getTextFiles);
router.get("/files/:fileId/content", auth_2.authMiddleware, drive_1.getFileContent);
// Search routes (protected by auth)
router.post("/ingest", auth_2.authMiddleware, search_1.ingestFiles);
router.post("/search", auth_2.authMiddleware, search_1.searchQuery);
