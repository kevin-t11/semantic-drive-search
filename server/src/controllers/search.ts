import { Request, Response } from "express";
import {
  fetchMultipleFileContents,
  getTextFilesFromDrive,
} from "../services/drive";
import {
  generateEmbedding,
  generateFileEmbeddings,
} from "../services/embedding";
import { storeFileVectors, searchVectors } from "../services/pinecone";
import { asyncHandler } from "../utils/asyncHandler";
import { SearchQuery } from "../types/search";

export const ingestFiles = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get text files from Drive
  const files = await getTextFilesFromDrive(req.tokens!);
  if (files.length === 0) {
    return res.json({
      status: "success",
      message: "No text files found in Drive",
      data: { count: 0 },
    });
  }

  // 2. Fetch file contents
  const filesWithContent = await fetchMultipleFileContents(req.tokens!, files);

  // 3. Generate embeddings
  const fileVectors = await generateFileEmbeddings(filesWithContent);

  // 4. Store in Pinecone
  await storeFileVectors(fileVectors);

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

export const searchQuery = asyncHandler(async (req: Request, res: Response) => {
  const { query, limit = 10 }: SearchQuery = req.body;

  if (!query) {
    return res.status(400).json({
      status: "error",
      message: "Search query is required",
    });
  }

  try {
    // Generate embedding for the query using the free model
    const queryEmbedding = await generateEmbedding(query);
    console.log("Query Embedding:", queryEmbedding);

    // Search for similar vectors in Pinecone
    const results = await searchVectors(queryEmbedding, limit);
    console.log("Search Results:", results);

    res.json({
      status: "success",
      data: { results },
    });
  } catch (error: any) {
    console.error("Error in searchQuery handler:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the search query.",
      error: error.message,
    });
  }
});
