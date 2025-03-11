export interface SearchQuery {
  query: string;
  limit?: number;
}

export interface SearchResult {
  fileName: string;
  fileId: string;
  webViewLink: string;
  score: number;
  content: string;
}
