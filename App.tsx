
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Layout } from './components/ui/Layout';
import { FileUploader } from './components/FileUploader';
import { ChatWindow } from './components/ChatWindow';
import { extractTextFromFile, chunkText, searchDocument } from './services/documentService';
import { retrieveRelevantChunks, getAnswerFromGemini, summarizeDocument } from './services/geminiService';
import { DocumentPage, TextChunk, Message, ProcessingState, SearchResult } from './types';
import { BookOpen, HelpCircle, FileSearch, Trash2, Info, Bot, Sparkles, Search, X, LayoutDashboard, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle', progress: 0 });
  const [isBotThinking, setIsBotThinking] = useState(false);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'info' | 'search'>('info');

  const searchResults = useMemo(() => {
    return searchDocument(searchTerm, pages);
  }, [searchTerm, pages]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      setProcessing({ status: 'extracting', progress: 10, message: 'Processing document layers...' });
      
      const extractedPages = await extractTextFromFile(selectedFile);
      setPages(extractedPages);

      if (extractedPages.length === 0) {
        throw new Error("The document appears to have no text or is unreadable.");
      }
      
      setProcessing({ status: 'chunking', progress: 40, message: 'Analyzing semantic structure...' });
      const textChunks = chunkText(extractedPages);
      setChunks(textChunks);
      
      setProcessing({ status: 'indexing', progress: 70, message: 'Synthesizing initial overview...' });
      
      const fullText = extractedPages.map(p => p.text).join(' ');
      
      let summary = "I have analyzed the document and am ready for your questions.";
      if (fullText.trim().length > 50) {
        summary = await summarizeDocument(fullText);
      }
      
      const summaryMsg: Message = {
        id: 'initial-summary',
        role: 'assistant',
        content: `### Document Briefing\n\n${summary}`,
        timestamp: Date.now(),
        isLoading: false
      };
      
      setMessages([summaryMsg]);
      setProcessing({ status: 'ready', progress: 100 });

    } catch (error) {
      console.error('Error processing file:', error);
      setProcessing({ 
        status: 'error', 
        progress: 0, 
        message: error instanceof Error ? error.message : 'Failed to process document.' 
      });
    }
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setChunks([]);
    setMessages([]);
    setProcessing({ status: 'idle', progress: 0 });
    setSearchTerm('');
    setSidebarTab('info');
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsBotThinking(true);

    const botMsgId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      const relevantChunks = retrieveRelevantChunks(text, chunks);
      const { text: answer, citations } = await getAnswerFromGemini(text, relevantChunks);

      setMessages(prev => prev.map(m => 
        m.id === botMsgId 
          ? { ...m, content: answer, citations, isLoading: false }
          : m
      ));
    } catch (error) {
      console.error('Error getting answer:', error);
      setMessages(prev => prev.map(m => 
        m.id === botMsgId 
          ? { ...m, content: 'Sorry, I encountered an error. Please try asking again.', isLoading: false }
          : m
      ));
    } finally {
      setIsBotThinking(false);
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">DocuMind</h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Universal Research AI</p>
          </div>
        </div>

        {file && (
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setSidebarTab('info')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${sidebarTab === 'info' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Overview
            </button>
            <button 
              onClick={() => setSidebarTab('search')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${sidebarTab === 'search' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sidebarTab === 'info' ? (
          <div className="p-6 space-y-8 animate-in fade-in duration-300">
            {file && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1">
                  <div className="w-12 h-12 bg-indigo-100 rotate-45 translate-x-6 -translate-y-6 rounded-lg opacity-50"></div>
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-indigo-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-indigo-500 font-medium uppercase">{pages.length > 1 ? `${pages.length} Pages` : 'Single Source'} Loaded</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Discard File
                </button>
              </div>
            )}

            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Intelligence Engine
              </h3>
              <div className="space-y-3">
                <StatusItem label="Extraction" active={processing.status !== 'idle'} />
                <StatusItem label="Gemini 3 Flash" active={true} />
                <StatusItem label="Vector Mapping" active={chunks.length > 0} />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5" />
                Contextual Queries
              </h3>
              <ul className="text-xs text-gray-600 space-y-4 pl-1 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>"Summarize the key findings"</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>"Extract all dates and events"</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>"What are the main risks mentioned?"</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 animate-in slide-in-from-right-2 fade-in duration-300">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Find specific terminology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-gray-400" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {searchTerm ? (
                <>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    {searchResults.length} Direct Matches
                  </p>
                  <div className="space-y-3">
                    {searchResults.map((result, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:border-indigo-200 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">Context {result.pageNumber}</span>
                          <Sparkles className="w-3 h-3 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p 
                          className="text-[11px] text-gray-600 leading-relaxed line-clamp-3"
                          dangerouslySetInnerHTML={{ 
                            __html: result.snippet.replace(new RegExp(`(${searchTerm})`, 'gi'), '<mark class="bg-indigo-100 text-indigo-900 font-bold rounded-sm px-0.5">$1</mark>') 
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">Deep Keyword Search</h4>
                  <p className="text-xs text-gray-400 mt-2 px-8">
                    Scan for exact phrase matches across all document layers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Multi-Format Hub</p>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90 relative z-10">
            Analyzing PDF, DOCX, and TXT with unified RAG context.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout sidebar={SidebarContent}>
      {processing.status === 'ready' ? (
        <ChatWindow 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isBotThinking} 
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100">
                <Sparkles className="w-3 h-3" />
                Universal DocuMind
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
                Unlock any document.
              </h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed font-medium">
                Upload PDFs, Word docs, or Text files. Get instant summaries and ask 
                anything with cited evidence.
              </p>
            </div>
            
            <FileUploader onFileSelect={handleFileSelect} processing={processing} />
            
            {processing.status === 'error' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <Info className="w-5 h-5 shrink-0" />
                <p className="font-medium">{processing.message}</p>
              </div>
            )}
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <BenefitItem 
                icon={<FileSearch className="w-6 h-6" />}
                title="Universal Scan"
                description="Native support for PDF, DOCX, and Text extraction."
              />
              <BenefitItem 
                icon={<Bot className="w-6 h-6" />}
                title="Instant Insights"
                description="Briefings generated automatically for all file types."
              />
              <BenefitItem 
                icon={<BookOpen className="w-6 h-6" />}
                title="Verified Source"
                description="Every answer is mapped back to the source text."
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const StatusItem: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center justify-between py-1 px-1">
    <span className="text-xs font-semibold text-gray-600">{label}</span>
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse' : 'bg-gray-200'}`}></div>
  </div>
);

const BenefitItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center group cursor-default">
    <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-indigo-600 mb-4 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:shadow-indigo-200 transition-all duration-300">
      {icon}
    </div>
    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tighter">{title}</h4>
    <p className="text-xs text-gray-500 mt-2 leading-relaxed px-4">{description}</p>
  </div>
);

export default App;
