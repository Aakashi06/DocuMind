
export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface TextChunk {
  id: string;
  text: string;
  pageNumber: number;
  tokens?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: number;
  isLoading?: boolean;
}

export interface Citation {
  pageNumber: number;
  snippet: string;
}

export interface ProcessingState {
  status: 'idle' | 'extracting' | 'chunking' | 'indexing' | 'ready' | 'error';
  progress: number;
  message?: string;
}

export interface SearchResult {
  pageNumber: number;
  snippet: string;
  matchIndex: number;
}
