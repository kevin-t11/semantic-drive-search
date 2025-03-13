import { Pinecone, RecordMetadata } from "@pinecone-database/pinecone";
import { FileVector } from "../types/file";
import { SearchResult } from "../types/search";

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Get the index
const index = pinecone.index(process.env.PINECONE_INDEX!);

interface FileMetadata extends RecordMetadata {
  fileName: string;
  fileId: string;
  webViewLink: string;
  content: string;
}

/**
 * Store file vectors in Pinecone
 */
export const storeFileVectors = async (
  fileVectors: FileVector[]
): Promise<void> => {
  // Prepare vectors for batch upsert
  const vectors = fileVectors.map((fileVector) => ({
    id: fileVector.id,
    values: fileVector.embedding,
    metadata: {
      fileName: fileVector.fileName,
      fileId: fileVector.fileId,
      webViewLink: fileVector.webViewLink,
      content: fileVector.content.slice(0, 1000), // Store a preview of content
    } as FileMetadata,
  }));

  // Split into smaller batches if needed (Pinecone has upsert limits)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);

    await index.upsert(batch);
  }
};

/**
 * Search files in Pinecone by query embedding
 */
export const searchVectors = async (
  queryEmbedding: number[], // Ensure this is explicitly typed
  limit: number = 5
): Promise<SearchResult[]> => {
  const results = await index.query({
    vector: queryEmbedding as number[],
    topK: limit,
    includeMetadata: true,
  });

  return results.matches
    .filter((match) => match.metadata !== undefined)
    .map((match) => {
      const metadata = match.metadata as unknown as FileMetadata;

      return {
        fileName: metadata.fileName,
        fileId: metadata.fileId,
        webViewLink: metadata.webViewLink,
        content: metadata.content,
        score: match.score,
      } as SearchResult;
    });
};
