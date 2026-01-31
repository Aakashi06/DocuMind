
import { GoogleGenAI } from "@google/genai";
import { TextChunk, Message, Citation } from "../types";

// Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a comprehensive, detailed summary of the uploaded document.
 */
export async function summarizeDocument(text: string): Promise<string> {
  const model = 'gemini-3-flash-preview';
  
  // Send up to 60,000 characters for a more holistic view
  const truncatedText = text.slice(0, 60000); 

  const systemInstruction = `
    You are an elite research analyst and document specialist. 
    Your goal is to provide a "Properly Detailed Executive Briefing" of the provided document.
    
    STRUCTURE YOUR RESPONSE AS FOLLOWS:
    
    ### 1. COMPREHENSIVE OVERVIEW
    - Start with a clear 2-3 sentence paragraph defining exactly what the document is, its origin (if apparent), and its primary objective.
    
    ### 2. CORE PILLARS & THEMES
    - Identify the 3-4 most significant themes or sections. 
    - For each theme, provide a concise but meaningful explanation of what it covers.
    
    ### 3. CRITICAL INSIGHTS & TAKEAWAYS
    - Provide a detailed list of specific facts, findings, or directives found in the text.
    - Go beyond generic statements; include specific concepts mentioned.
    
    ### 4. SIGNIFICANCE & CONTEXT
    - Explain who this document is for and why it matters.
    - Mention any notable dates, figures, or entities found.

    FORMATTING RULES:
    - Use Markdown for structure.
    - Use bold text (**important**) to highlight key terms.
    - Use bullet points for readability.
    - Avoid filler words like "The document says..." or "In conclusion...".
  `;

  const response = await ai.models.generateContent({
    model,
    contents: truncatedText,
    config: {
      systemInstruction,
      temperature: 0.3,
    },
  });

  return response.text || "I was unable to synthesize a detailed summary for this document.";
}

/**
 * Uses Gemini to generate an answer based on retrieved document chunks.
 */
export async function getAnswerFromGemini(
  question: string,
  chunks: TextChunk[]
): Promise<{ text: string; citations: Citation[] }> {
  const model = 'gemini-3-flash-preview';
  
  const contextText = chunks
    .map(c => `[ID: ${c.id} | Page ${c.pageNumber}]: ${c.text}`)
    .join('\n\n---\n\n');

  const systemInstruction = `
    You are a professional PDF analysis assistant.
    Your task is to answer questions based strictly on the provided context.
    
    CRITICAL RULES:
    1. Use ONLY the information provided in the DOCUMENT CONTEXT below.
    2. If the answer is not contained within the context, state: "I'm sorry, but the provided document does not contain information to answer that question."
    3. You MUST provide inline citations for every claim. Use the format [Page X].
    4. At the end of your response, list the sources used if helpful.
    5. Maintain a helpful, neutral, and academic tone.
  `;

  const prompt = `
    QUESTION: ${question}

    DOCUMENT CONTEXT:
    ${contextText}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 0 }
    },
  });

  const responseText = response.text || "No response generated.";

  // Extract citations
  const citationRegex = /\[Page (\d+)\]/g;
  const foundPages = new Set<number>();
  let match;
  while ((match = citationRegex.exec(responseText)) !== null) {
    foundPages.add(parseInt(match[1]));
  }

  const citations: Citation[] = Array.from(foundPages).map(pageNo => {
    const relevantChunk = chunks.find(c => c.pageNumber === pageNo);
    return {
      pageNumber: pageNo,
      snippet: relevantChunk ? relevantChunk.text.slice(0, 200) + '...' : 'Context from page ' + pageNo
    };
  });

  return {
    text: responseText,
    citations
  };
}

/**
 * Basic semantic retrieval simulation using keyword overlap.
 */
export function retrieveRelevantChunks(question: string, chunks: TextChunk[], topK: number = 6): TextChunk[] {
  const queryWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const chunkLower = chunk.text.toLowerCase();
    queryWords.forEach(word => {
      if (chunkLower.includes(word)) score += 1;
    });
    // Bias towards earlier chunks slightly if scores are tied
    return { chunk, score: score - (chunks.indexOf(chunk) * 0.001) };
  });

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk);
}
