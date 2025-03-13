import { GoogleGenerativeAI } from "@google/generative-ai";
import { DriveFile, FileVector } from "../types/file";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generate embeddings for a text using Google Gemini
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const truncatedText = text.slice(0, 8000);

    // Use the correct embedding model
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(truncatedText);

    if (
      !result ||
      !result.embedding ||
      !Array.isArray(result.embedding.values)
    ) {
      throw new Error("Failed to generate embedding - invalid result");
    }

    // Extract embedding values correctly
    return [...result.embedding.values];
  } catch (error) {
    console.error("Error generating embedding with Gemini:", error);
    throw error;
  }
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
        id: file.id,
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
