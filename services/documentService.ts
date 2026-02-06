
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { DocumentPage, TextChunk, SearchResult } from '../types';

// Set the worker source to the matching version from a reliable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;

/**
 * Main entry point for text extraction based on file type.
 */
export async function extractTextFromFile(file: File): Promise<DocumentPage[]> {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  switch (fileType) {
    case 'pdf':
      return extractTextFromPdf(file);
    case 'docx':
      return extractTextFromDocx(file);
    case 'txt':
    case 'md':
      return extractTextFromTextFile(file);
    default:
      throw new Error(`Unsupported file type: .${fileType}`);
  }
}

/**
 * Extracts text from PDF files.
 */
async function extractTextFromPdf(file: File): Promise<DocumentPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer,
    useSystemFonts: true,
    isEvalSupported: false 
  });
  
  const pdf = await loadingTask.promise;
  const pages: DocumentPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str || '').join(' ');
      pages.push({ pageNumber: i, text: text.trim() || `[Blank Page ${i}]` });
    } catch (e) {
      pages.push({ pageNumber: i, text: `[Error extracting page ${i}]` });
    }
  }
  return pages;
}

/**
 * Extracts text from Word (.docx) files.
 */
async function extractTextFromDocx(file: File): Promise<DocumentPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  // Since .docx doesn't provide explicit page breaks easily in raw text extraction, 
  // we treat it as a single "page" or break by large newlines if present.
  const fullText = result.value;
  return [{ pageNumber: 1, text: fullText }];
}

/**
 * Extracts text from simple text or markdown files.
 */
async function extractTextFromTextFile(file: File): Promise<DocumentPage[]> {
  const text = await file.text();
  return [{ pageNumber: 1, text }];
}

/**
 * Splits text into overlapping chunks.
 */
export function chunkText(pages: DocumentPage[], chunkSize: number = 800, overlap: number = 150): TextChunk[] {
  const chunks: TextChunk[] = [];
  
  pages.forEach((page) => {
    const text = page.text;
    if (!text || text.startsWith('[Error')) return;

    const words = text.split(/\s+/);
    let start = 0;

    while (start < words.length) {
      const end = start + chunkSize;
      const chunkWords = words.slice(start, end);
      const chunkText = chunkWords.join(' ');
      
      chunks.push({
        id: `p${page.pageNumber}-c${chunks.length}`,
        text: chunkText,
        pageNumber: page.pageNumber
      });

      if (words.length <= end) break;
      start = end - overlap;
    }
  });

  return chunks;
}

/**
 * Keyword search.
 */
export function searchDocument(query: string, pages: DocumentPage[]): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const SNIPPET_PADDING = 60;

  pages.forEach(page => {
    let match;
    while ((match = searchRegex.exec(page.text)) !== null) {
      const start = Math.max(0, match.index - SNIPPET_PADDING);
      const end = Math.min(page.text.length, match.index + query.length + SNIPPET_PADDING);
      let snippet = page.text.substring(start, end);
      if (start > 0) snippet = '...' + snippet;
      if (end < page.text.length) snippet = snippet + '...';

      results.push({ pageNumber: page.pageNumber, snippet, matchIndex: match.index });
      if (results.filter(r => r.pageNumber === page.pageNumber).length > 5) break;
    }
  });

  return results;
}
