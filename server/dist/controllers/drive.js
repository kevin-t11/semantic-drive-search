"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileContent = exports.getTextFiles = void 0;
const drive_1 = require("../services/drive");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getTextFiles = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const files = await (0, drive_1.getTextFilesFromDrive)(req.tokens);
    res.json({
        status: "success",
        data: { files },
    });
});
exports.getFileContent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { fileId } = req.params;
    if (!fileId) {
        return res.status(400).json({
            status: "error",
            message: "File ID is required",
        });
    }
    const content = await (0, drive_1.getFileContentFromDrive)(req.tokens, fileId);
    res.json({
        status: "success",
        data: { content },
    });
});
