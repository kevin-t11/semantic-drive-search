"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchVectors = exports.storeFileVectors = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
// Initialize Pinecone client
const pinecone = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
// Get the index
const index = pinecone.index(process.env.PINECONE_INDEX);
/**
 * Store file vectors in Pinecone
 */
const storeFileVectors = async (fileVectors) => {
    // Prepare vectors for batch upsert
    const vectors = fileVectors.map((fileVector) => ({
        id: fileVector.id,
        values: fileVector.embedding,
        metadata: {
            fileName: fileVector.fileName,
            fileId: fileVector.fileId,
            webViewLink: fileVector.webViewLink,
            content: fileVector.content.slice(0, 1000), // Store a preview of content
        },
    }));
    // Split into smaller batches if needed (Pinecone has upsert limits)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
    }
};
exports.storeFileVectors = storeFileVectors;
/**
 * Search files in Pinecone by query embedding
 */
const searchVectors = async (queryEmbedding, limit = 5) => {
    const results = await index.query({
        vector: queryEmbedding,
        topK: limit,
        includeMetadata: true,
    });
    return results.matches
        .filter((match) => match.metadata) // Filter out undefined metadata
        .map((match) => {
        // Use type assertion to handle Pinecone's metadata type
        const metadata = match.metadata;
        return {
            fileName: metadata.fileName,
            fileId: metadata.fileId,
            webViewLink: metadata.webViewLink,
            content: metadata.content,
            score: match.score,
        };
    });
};
exports.searchVectors = searchVectors;
