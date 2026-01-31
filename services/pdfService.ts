
import * as pdfjsLib from 'pdfjs-dist';
import { PdfPage, TextChunk } from '../types';

// Set the worker source to the matching version from a reliable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;

/**
 * Loads and extracts text from a PDF file.
 */
export async function extractTextFromPdf(file: File): Promise<PdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Initialize document loading
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer,
    useSystemFonts: true,
    isEvalSupported: false 
  });
  
  const pdf = await loadingTask.promise;
  const pages: PdfPage[] = [];

  console.log(`Document loaded with ${pdf.numPages} pages.`);

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // Extract string items and join with spaces
      const text = content.items
        .map((item: any) => item.str || '')
        .join(' ');
      
      pages.push({ 
        pageNumber: i, 
        text: text.trim() || `[Blank Page ${i}]` 
      });
    } catch (pageError) {
      console.warn(`Error extracting page ${i}:`, pageError);
      pages.push({ 
        pageNumber: i, 
        text: `[Error extracting text from page ${i}]` 
      });
    }
  }

  return pages;
}

/**
 * Splits text into overlapping chunks for semantic retrieval.
 */
export function chunkText(pages: PdfPage[], chunkSize: number = 800, overlap: number = 150): TextChunk[] {
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
