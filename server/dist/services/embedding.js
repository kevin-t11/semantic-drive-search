"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFileEmbeddings = exports.generateEmbedding = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Generate embeddings for a text using OpenAI
 */
const generateEmbedding = async (text) => {
    // Truncate text if it's too long (OpenAI has a token limit)
    const truncatedText = text.slice(0, 8000);
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: truncatedText,
    });
    return response.data[0].embedding;
};
exports.generateEmbedding = generateEmbedding;
/**
 * Generate embeddings for multiple files
 */
const generateFileEmbeddings = async (files) => {
    const fileVectors = [];
    for (const file of files) {
        if (!file.content)
            continue;
        try {
            const embedding = await (0, exports.generateEmbedding)(file.content);
            fileVectors.push({
                id: file.id, // Use as unique ID in Pinecone
                fileName: file.name,
                fileId: file.id,
                webViewLink: file.webViewLink,
                content: file.content,
                embedding,
            });
        }
        catch (error) {
            console.error(`Error generating embedding for ${file.name}:`, error);
        }
    }
    return fileVectors;
};
exports.generateFileEmbeddings = generateFileEmbeddings;
