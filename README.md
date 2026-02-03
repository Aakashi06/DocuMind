# DocuMind

DocuMind is an AI-powered PDF intelligence system that transforms static PDF documents into dynamic, queryable knowledge bases using Retrieval-Augmented Generation (RAG) architecture and Google's Gemini 1.5 Flash model. It operates entirely client-side for complete data privacy, enabling users to upload PDFs, generate multi-faceted executive summaries, and perform natural language question-answering with verifiable page-level citations.

##  Key Features

- **🧠 Intelligent Document Summarization**  
  Generates structured executive briefings covering core themes, critical takeaways, and document significance.

- **💬 Semantic Question Answering**  
  Natural language queries with interactive page citations and context tooltips to prevent AI hallucinations.

- **🔒 Client-Side Processing**  
  All PDF parsing, chunking, and analysis happens in your browser using PDF.js—no servers or data transmission required.

- **🔍 Hybrid Search**  
  Toggle between AI-powered semantic search and precise keyword matching with highlighted results.

- **📱 Responsive UI**  
  Sidebar layout with chat interface, real-time progress indicators, and mobile-friendly design.

## Demo Screenshots

| Landing Page | Processing | Executive Summary |
|--------------|------------|-------------------|
| ![Landing](screenshots/landing.png) | ![Processing](screenshots/processing.png) | ![Summary](screenshots/summary.png) |

| Chat QA | Keyword Search |
|---------|----------------|
| ![Chat](screenshots/chat.png) | ![Search](screenshots/search.png) |

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **AI** | Google Generative AI SDK, Gemini 1.5 Flash |
| **PDF Processing** | PDF.js (client-side parsing) |
| **Icons** | Lucide React |

##  Quick Start

### Prerequisites
- Node.js 18+
- Google AI API key ([Get yours here](https://makersuite.google.com/app/apikey))

### Installation
```bash
# Clone the repo
git clone <your-repo-url>
cd documind

# Install dependencies
npm install

# Add your API key
echo "VITE_GOOGLE_AI_API_KEY=your-key-here" > .env

# Run locally
npm run dev

Build for Production
bash
npm run build
#

### Usage
Upload any PDF document

View auto-generated executive summary with 4 pillars:

-Comprehensive Overview
-Core Themes & Concepts
-Critical Takeaways
-Document Significance

Ask questions in natural language:
"What are the main findings?"
"Summarize section 3"
"What does it say about AI?"

Hover citations (Page X) for source context

Switch to keyword search for exact phrase matching

Architecture Overview
text
PDF Upload → PDF.js Parsing → Text Extraction → Chunking (800 words + 150 overlap)
                    ↓
Query → Keyword Retrieval (Top 6 chunks) → Gemini RAG → Cited Response + Tooltips
Key Components:

App.tsx - Main container & state management

FileUploader.tsx - PDF upload & processing pipeline

ChatInterface.tsx - Conversational QA with citations

SummaryDisplay.tsx - Multi-pillar executive briefing

DocumentSidebar.tsx - Search & metadata panel

Future Enhancements
 Persistence: IndexedDB for documents & chat history

 Multimodal: Image/chart analysis via Gemini vision

 Multi-doc: Cross-document search & analysis

 Export: PDF/Markdown reports of chats & summaries

 Advanced RAG: Semantic embeddings for better retrieval

📚 References
Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (NeurIPS 2020)

Zhang et al., "Optimal chunking strategies for RAG systems" (2023)

Google Gemini 1.5 Flash documentation

Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request



Built with ❤️ for efficient document intelligence
