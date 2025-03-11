export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  content?: string;
}

export interface FileVector {
  id: string;
  fileName: string;
  fileId: string;
  webViewLink: string;
  content: string;
  embedding: number[];
}
