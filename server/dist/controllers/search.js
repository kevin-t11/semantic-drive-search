"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchQuery = exports.ingestFiles = void 0;
const drive_1 = require("../services/drive");
const embedding_1 = require("../services/embedding");
const pinecone_1 = require("../services/pinecone");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.ingestFiles = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // 1. Get text files from Drive
    const files = await (0, drive_1.getTextFilesFromDrive)(req.tokens);
    if (files.length === 0) {
        return res.json({
            status: "success",
            message: "No text files found in Drive",
            data: { count: 0 },
        });
    }
    // 2. Fetch file contents
    const filesWithContent = await (0, drive_1.fetchMultipleFileContents)(req.tokens, files);
    // 3. Generate embeddings
    const fileVectors = await (0, embedding_1.generateFileEmbeddings)(filesWithContent);
    // 4. Store in Pinecone
    await (0, pinecone_1.storeFileVectors)(fileVectors);
    res.json({
        status: "success",
        message: "Files ingested successfully",
        data: {
            count: fileVectors.length,
            files: fileVectors.map((v) => ({
                fileName: v.fileName,
                fileId: v.fileId,
            })),
        },
    });
});
exports.searchQuery = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { query, limit = 5 } = req.body;
    if (!query) {
        return res.status(400).json({
            status: "error",
            message: "Search query is required",
        });
    }
    // 1. Generate embedding for query
    const queryEmbedding = await (0, embedding_1.generateEmbedding)(query);
    // 2. Search in Pinecone
    const results = await (0, pinecone_1.searchVectors)(queryEmbedding, limit);
    res.json({
        status: "success",
        data: { results },
    });
});
