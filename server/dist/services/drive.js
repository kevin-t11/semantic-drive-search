"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMultipleFileContents = exports.getFileContentFromDrive = exports.getTextFilesFromDrive = void 0;
const googleapis_1 = require("googleapis");
const auth_1 = require("./auth");
/**
 * Get list of text files from Google Drive
 */
const getTextFilesFromDrive = async (tokens) => {
    const auth = (0, auth_1.createAuthenticatedClient)(tokens);
    const drive = googleapis_1.google.drive({ version: "v3", auth });
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
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink,
    }));
};
exports.getTextFilesFromDrive = getTextFilesFromDrive;
/**
 * Get file content from Google Drive
 */
const getFileContentFromDrive = async (tokens, fileId) => {
    const auth = (0, auth_1.createAuthenticatedClient)(tokens);
    const drive = googleapis_1.google.drive({ version: "v3", auth });
    const response = await drive.files.get({
        fileId,
        alt: "media",
    });
    // Drive API returns file content directly
    return response.data;
};
exports.getFileContentFromDrive = getFileContentFromDrive;
/**
 * Fetch multiple file contents
 */
const fetchMultipleFileContents = async (tokens, files) => {
    const filesWithContent = await Promise.all(files.map(async (file) => {
        try {
            const content = await (0, exports.getFileContentFromDrive)(tokens, file.id);
            return { ...file, content };
        }
        catch (error) {
            console.error(`Error fetching content for file ${file.name}:`, error);
            return { ...file, content: "" };
        }
    }));
    return filesWithContent.filter((file) => !!file.content);
};
exports.fetchMultipleFileContents = fetchMultipleFileContents;
