
import React, { useState, useCallback, useEffect } from 'react';
import { Layout } from './components/ui/Layout';
import { FileUploader } from './components/FileUploader';
import { ChatWindow } from './components/ChatWindow';
import { extractTextFromPdf, chunkText } from './services/pdfService';
import { retrieveRelevantChunks, getAnswerFromGemini, summarizeDocument } from './services/geminiService';
import { PdfPage, TextChunk, Message, ProcessingState } from './types';
import { BookOpen, HelpCircle, FileSearch, Trash2, Info, Bot, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle', progress: 0 });
  const [isBotThinking, setIsBotThinking] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      setProcessing({ status: 'extracting', progress: 10, message: 'Reading PDF layers...' });
      
      const extractedPages = await extractTextFromPdf(selectedFile);
      setPages(extractedPages);

      if (extractedPages.length === 0) {
        throw new Error("The PDF appears to have no pages or is unreadable.");
      }
      
      setProcessing({ status: 'chunking', progress: 40, message: 'Segmenting text for analysis...' });
      const textChunks = chunkText(extractedPages);
      setChunks(textChunks);
      
      setProcessing({ status: 'indexing', progress: 70, message: 'Generating document summary...' });
      
      // Auto-summarize
      const fullText = extractedPages.map(p => p.text).join(' ');
      
      // Fallback if summary fails or is empty
      let summary = "I have analyzed the document and am ready for your questions.";
      if (fullText.trim().length > 50) {
        summary = await summarizeDocument(fullText);
      }
      
      const summaryMsg: Message = {
        id: 'initial-summary',
        role: 'assistant',
        content: `### Document Summary\n\n${summary}`,
        timestamp: Date.now(),
        isLoading: false
      };
      
      setMessages([summaryMsg]);
      setProcessing({ status: 'ready', progress: 100 });

    } catch (error) {
      console.error('Error processing PDF:', error);
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
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">DocuMind</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Research AI</p>
        </div>
      </div>

      {file && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1">
             <div className="w-12 h-12 bg-indigo-100 rotate-45 translate-x-6 -translate-y-6 rounded-lg opacity-50"></div>
          </div>
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FileSearch className="w-4 h-4 text-indigo-600 shrink-0" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-indigo-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[10px] text-indigo-500 font-medium uppercase">{pages.length} Pages</p>
              </div>
            </div>
          </div>
          <button 
            onClick={reset}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove Document
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            Intelligence Engine
          </h3>
          <div className="space-y-3">
            <StatusItem label="PDF OCR" active={processing.status !== 'idle'} />
            <StatusItem label="Gemini 3 Flash" active={true} />
            <StatusItem label="RAG Pipeline" active={chunks.length > 0} />
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Usage Guide
          </h3>
          <ul className="text-xs text-gray-600 space-y-3 pl-1 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>Ask for specific details, dates, or definitions.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>Hover over page tags to see source snippets.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>Summarize specific pages (e.g., "Summarize page 5").</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Pro Insight</p>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            Retrieval-Augmented Generation ensures answers are grounded in your data.
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
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100">
                <Sparkles className="w-3 h-3" />
                DocuMind Analysis
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
                Unlock your documents.
              </h2>
              <p className="mt-6 text-lg text-gray-500 leading-relaxed">
                Upload any PDF to get an instant AI-powered summary and start a 
                conversation with your data.
              </p>
            </div>
            
            <FileUploader onFileSelect={handleFileSelect} processing={processing} />
            
            {processing.status === 'error' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <Info className="w-5 h-5 shrink-0" />
                <p>{processing.message}</p>
              </div>
            )}
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <BenefitItem 
                icon={<FileSearch className="w-6 h-6" />}
                title="Deep Analysis"
                description="We process every word for context-aware retrieval."
              />
              <BenefitItem 
                icon={<Bot className="w-6 h-6" />}
                title="Smart Summary"
                description="Get an instant overview of even the longest docs."
              />
              <BenefitItem 
                icon={<BookOpen className="w-6 h-6" />}
                title="Verified Sources"
                description="Citations for every claim, linked to exact pages."
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
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-indigo-600 mb-4 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
      {icon}
    </div>
    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tighter">{title}</h4>
    <p className="text-xs text-gray-500 mt-2 leading-relaxed px-4">{description}</p>
  </div>
);

export default App;
