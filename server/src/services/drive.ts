import { google, drive_v3 } from "googleapis";
import { createAuthenticatedClient } from "./auth";
import { DriveFile } from "../types/file";
import { TokenInfo } from "../types/auth";
/**
 * Get list of text files from Google Drive
 */
export const getTextFilesFromDrive = async (
  tokens: TokenInfo
): Promise<DriveFile[]> => {
  const auth = createAuthenticatedClient(tokens);
  const drive = google.drive({ version: "v3", auth });

  // Query for .txt and .md files
  const query = "mimeType='text/plain' or mimeType='text/markdown'";

  const response = await drive.files.list({
    q: query,
    fields: "files(id, name, mimeType, webViewLink)",
    spaces: "drive",
  });

  if (!response.data.files) {
    return [];
  }

  return response.data.files.map((file) => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    webViewLink: file.webViewLink!,
  }));
};

/**
 * Get file content from Google Drive
 */
export const getFileContentFromDrive = async (
  tokens: TokenInfo,
  fileId: string
): Promise<string> => {
  const auth = createAuthenticatedClient(tokens);
  const drive = google.drive({ version: "v3", auth });

  const response = await drive.files.get({
    fileId,
    alt: "media",
  });

  // Drive API returns file content directly
  return response.data as string;
};

/**
 * Fetch multiple file contents
 */
export const fetchMultipleFileContents = async (
  tokens: TokenInfo,
  files: DriveFile[]
): Promise<DriveFile[]> => {
  const filesWithContent = await Promise.all(
    files.map(async (file) => {
      try {
        const content = await getFileContentFromDrive(tokens, file.id);
        return { ...file, content };
      } catch (error) {
        console.error(`Error fetching content for file ${file.name}:`, error);
        return { ...file, content: "" };
      }
    })
  );

  return filesWithContent.filter((file) => !!file.content);
};
