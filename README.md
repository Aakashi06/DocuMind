<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DocuMind - AI Document Intelligence</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: 'Inter', system-ui, sans-serif;
        }
        .hero-bg {
            background: linear-gradient(135deg, #3b82f6, #1e40af);
        }
        .mermaid-container {
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 12px;
        }
    </style>
</head>
<body class="bg-zinc-50 text-zinc-800">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <header class="hero-bg text-white py-16 px-8">
            <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                    📄
                </div>
                <div>
                    <h1 class="text-5xl font-bold tracking-tight">DocuMind</h1>
                    <p class="text-xl opacity-90 mt-1">Client-side AI Document Intelligence</p>
                </div>
            </div>
            <p class="max-w-2xl text-lg opacity-90">
                Upload PDFs, DOCX, or TXT files and instantly chat with your documents. 
                Powered by Gemini with Retrieval-Augmented Generation (RAG) — all running in your browser.
            </p>
            <div class="flex gap-4 mt-8">
                <a href="#features" 
                   class="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-zinc-100 transition flex items-center gap-2">
                    <i class="fas fa-rocket"></i>
                    Explore Features
                </a>
                <a href="https://github.com/yourusername/documind" 
                   target="_blank"
                   class="border border-white/50 hover:border-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2">
                    <i class="fab fa-github"></i>
                    View on GitHub
                </a>
            </div>
        </header>

        <div class="px-8 py-12">
            <!-- Quick Stats -->
            <div class="grid grid-cols-3 gap-6 mb-16 bg-white rounded-3xl shadow-sm p-8 -mt-8">
                <div class="text-center">
                    <div class="text-4xl font-bold text-blue-600">100%</div>
                    <div class="text-sm text-zinc-500">Client-side</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-bold text-emerald-600">RAG</div>
                    <div class="text-sm text-zinc-500">Powered Q&amp;A</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-bold text-amber-600">3</div>
                    <div class="text-sm text-zinc-500">File Formats</div>
                </div>
            </div>

            <nav class="flex gap-8 border-b pb-4 mb-12 text-sm font-medium">
                <a href="#overview" class="hover:text-blue-600 transition">Overview</a>
                <a href="#tech" class="hover:text-blue-600 transition">Tech Stack</a>
                <a href="#structure" class="hover:text-blue-600 transition">Structure</a>
                <a href="#features" class="hover:text-blue-600 transition">Features</a>
                <a href="#architecture" class="hover:text-blue-600 transition">Architecture</a>
            </nav>

            <!-- 1. Project Overview -->
            <section id="overview" class="mb-20">
                <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span class="text-blue-600">📋</span> Project Overview
                </h2>
                <div class="prose prose-zinc max-w-none">
                    <p class="text-lg"><strong>DocuMind</strong> is a client-side, browser-based AI-powered document intelligence application built as a single-page React app.</p>
                    
                    <div class="grid md:grid-cols-2 gap-8 mt-10">
                        <div class="bg-white p-8 rounded-3xl shadow-sm">
                            <h3 class="font-semibold text-lg mb-4">Problem It Solves</h3>
                            <p class="text-zinc-600">Users struggle to quickly understand, search, and extract insights from long, dense documents. Manual reading is time-consuming and keyword search is imprecise.</p>
                        </div>
                        <div class="bg-white p-8 rounded-3xl shadow-sm">
                            <h3 class="font-semibold text-lg mb-4">Main Objective</h3>
                            <p class="text-zinc-600">Provide an instant, conversational interface over any document with accurate, source-cited answers — all running primarily in the browser.</p>
                        </div>
                    </div>

                    <h3 class="font-semibold text-xl mt-12 mb-6">Target Users</h3>
                    <ul class="grid md:grid-cols-2 gap-4">
                        <li class="flex items-start gap-3"><span class="text-emerald-500 mt-1">•</span> Researchers &amp; Students</li>
                        <li class="flex items-start gap-3"><span class="text-emerald-500 mt-1">•</span> Legal &amp; Professional Analysts</li>
                        <li class="flex items-start gap-3"><span class="text-emerald-500 mt-1">•</span> Knowledge Workers</li>
                        <li class="flex items-start gap-3"><span class="text-emerald-500 mt-1">•</span> Anyone needing rapid document insights</li>
                    </ul>
                </div>
            </section>

            <!-- Key Features -->
            <section id="features" class="mb-20">
                <h2 class="text-3xl font-bold mb-8">Key Features</h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-white border border-zinc-100 rounded-3xl p-8 hover:border-blue-200 transition">
                        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6">📤</div>
                        <h3 class="font-semibold text-xl mb-3">Multi-format Support</h3>
                        <p class="text-zinc-600">PDF (pdf.js), DOCX (mammoth), and TXT files.</p>
                    </div>
                    <div class="bg-white border border-zinc-100 rounded-3xl p-8 hover:border-blue-200 transition">
                        <div class="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🔍</div>
                        <h3 class="font-semibold text-xl mb-3">Semantic Chunking + RAG</h3>
                        <p class="text-zinc-600">Intelligent text extraction, chunking, and retrieval-augmented generation.</p>
                    </div>
                    <div class="bg-white border border-zinc-100 rounded-3xl p-8 hover:border-blue-200 transition">
                        <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-6">💬</div>
                        <h3 class="font-semibold text-xl mb-3">Conversational Q&amp;A</h3>
                        <p class="text-zinc-600">Real-time chat with citations back to original document pages.</p>
                    </div>
                    <div class="bg-white border border-zinc-100 rounded-3xl p-8 hover:border-blue-200 transition">
                        <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">📊</div>
                        <h3 class="font-semibold text-xl mb-3">Smart Summary</h3>
                        <p class="text-zinc-600">Automatic document briefing using Gemini AI.</p>
                    </div>
                </div>
            </section>

            <!-- Tech Stack -->
            <section id="tech" class="mb-20">
                <h2 class="text-3xl font-bold mb-8">Tech Stack</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-3xl">
                        <div class="font-mono text-sm text-zinc-500">Frontend</div>
                        <ul class="mt-4 space-y-3">
                            <li><strong>React 19 + TypeScript</strong></li>
                            <li><strong>Vite</strong></li>
                            <li><strong>Tailwind CSS</strong></li>
                            <li><strong>Lucide React</strong></li>
                        </ul>
                    </div>
                    <div class="bg-white p-6 rounded-3xl">
                        <div class="font-mono text-sm text-zinc-500">Document Processing</div>
                        <ul class="mt-4 space-y-3">
                            <li><strong>pdfjs-dist</strong></li>
                            <li><strong>mammoth</strong></li>
                            <li><strong>Custom chunking</strong></li>
                        </ul>
                    </div>
                    <div class="bg-white p-6 rounded-3xl">
                        <div class="font-mono text-sm text-zinc-500">AI Layer</div>
                        <ul class="mt-4 space-y-3">
                            <li><strong>@google/genai</strong></li>
                            <li><strong>Gemini 1.5 / 2.0</strong></li>
                            <li><strong>Client-side RAG</strong></li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Architecture -->
            <section id="architecture" class="mb-20">
                <h2 class="text-3xl font-bold mb-8">Architecture</h2>
                <div class="mermaid-container">
                    <pre class="mermaid">
graph TD
    A[User] --> B[React UI Layer]
    B --> C[FileUploader]
    C --> D[documentService: Extract + Chunk]
    D --> E[State: pages + chunks]
    B --> F[ChatWindow]
    F --> G[geminiService: Retrieve + LLM Call]
    G --> H[Gemini API]
    E --> G
    B --> I[Sidebar Search - Client-side]
                    </pre>
                </div>
                <p class="text-center text-sm text-zinc-500 mt-4">Client-side RAG Monolith — Maximum privacy, zero backend</p>
            </section>

            <!-- Folder Structure -->
            <section id="structure" class="mb-20">
                <h2 class="text-3xl font-bold mb-8">Folder Structure</h2>
                <div class="bg-zinc-900 text-zinc-300 p-8 rounded-3xl font-mono text-sm overflow-auto">
<pre>
/
├── App.tsx
├── index.tsx
├── index.html
├── types.ts
├── vite.config.ts
├── components/
│   ├── ui/Layout.tsx
│   ├── FileUploader.tsx
│   └── ChatWindow.tsx
├── services/
│   ├── documentService.ts
│   └── geminiService.ts
└── README.md
</pre>
                </div>
            </section>

            <!-- Future Improvements -->
            <section class="mb-16">
                <h2 class="text-3xl font-bold mb-8">Future Enhancements</h2>
                <div class="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="font-semibold mb-4 text-emerald-600">Performance</h3>
                        <ul class="space-y-2 text-zinc-600">
                            <li>• Client-side vector embeddings (Transformers.js)</li>
                            <li>• Web Workers for heavy processing</li>
                            <li>• Lazy loading for large documents</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-4 text-violet-600">Features</h3>
                        <ul class="space-y-2 text-zinc-600">
                            <li>• Multi-document knowledge base</li>
                            <li>• Voice input/output</li>
                            <li>• Citation highlighting in original doc</li>
                            <li>• Export conversations</li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="border-t pt-12 pb-16 text-center text-zinc-500 text-sm">
                <p>Built with ❤️ for knowledge workers who value privacy and speed.</p>
                <p class="mt-2">Pure client-side • Powered by Google Gemini</p>
                <div class="flex justify-center gap-6 mt-8 text-xl">
                    <i class="fab fa-react"></i>
                    <i class="fas fa-brain"></i>
                    <i class="fas fa-file-pdf"></i>
                </div>
            </footer>
        </div>
    </div>

    <script>
        // Initialize Tailwind
        tailwind.config = {
            content: [],
            theme: {
                extend: {}
            }
        }
        
        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: "default",
            flowchart: { useMaxWidth: true }
        });
    </script>
</body>
</html>