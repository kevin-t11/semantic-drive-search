import OpenAI from "openai";
import { DriveFile, FileVector } from "../types/file";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for a text using OpenAI
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  // Truncate text if it's too long (OpenAI has a token limit)
  const truncatedText = text.slice(0, 8000);

  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: truncatedText,
  });

  return response.data[0].embedding;
};

/**
 * Generate embeddings for multiple files
 */
export const generateFileEmbeddings = async (
  files: DriveFile[]
): Promise<FileVector[]> => {
  const fileVectors: FileVector[] = [];

  for (const file of files) {
    if (!file.content) continue;

    try {
      const embedding = await generateEmbedding(file.content);

      fileVectors.push({
        id: file.id, // Use as unique ID in Pinecone
        fileName: file.name,
        fileId: file.id,
        webViewLink: file.webViewLink,
        content: file.content,
        embedding,
      });
    } catch (error) {
      console.error(`Error generating embedding for ${file.name}:`, error);
    }
  }

  return fileVectors;
};
