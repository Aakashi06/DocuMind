
import React, { useRef, useEffect } from 'react';
import { Send, User, Bot, FileText, Sparkles, BookOpen } from 'lucide-react';
import { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  /**
   * Extremely simple Markdown renderer for the SPA context.
   * Handles headers, bolding, and lists.
   */
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Process bold text using regex: **text** -> <strong>text</strong>
      const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      if (line.startsWith('###')) {
        return (
          <h3 key={i} className="text-sm font-black text-indigo-900 mt-6 mb-3 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
            {line.replace('###', '').trim()}
          </h3>
        );
      }
      
      if (line.startsWith('-') || line.startsWith('*')) {
        return (
          <li key={i} className="ml-4 list-disc mb-2 pl-2 text-gray-700 leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: processedLine.replace(/^[-*]\s?/, '') }} />
        );
      }
      
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      
      return (
        <p key={i} 
           className="mb-3 text-gray-800 leading-relaxed" 
           dangerouslySetInnerHTML={{ __html: processedLine }} />
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {messages.map((m, idx) => (
          <div key={m.id} className={`flex gap-4 md:gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`
              shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm
              ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-100 text-indigo-600'}
            `}>
              {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] md:max-w-[80%] space-y-3 ${m.role === 'user' ? 'items-end' : ''}`}>
              <div className={`
                p-6 rounded-2xl text-sm leading-relaxed shadow-sm
                ${m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}
              `}>
                {m.isLoading ? (
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">Synthesizing...</span>
                  </div>
                ) : (
                  <div className="max-w-none">
                    {renderContent(m.content)}
                  </div>
                )}
              </div>

              {m.citations && m.citations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {m.citations.map((cit, cidx) => (
                    <div 
                      key={cidx} 
                      className="group relative flex items-center gap-1.5 bg-white border border-gray-100 text-[10px] font-bold text-gray-500 px-3 py-1.5 rounded-lg shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-help"
                    >
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      Page {cit.pageNumber}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none leading-relaxed">
                        <p className="font-bold text-indigo-300 mb-1">Context Fragment:</p>
                        {cit.snippet}
                        <div className="absolute top-full left-4 border-8 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-gray-50">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
          <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-md opacity-0 group-focus-within:opacity-10 transition-opacity"></div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            disabled={isLoading}
            className="relative w-full bg-gray-50 border border-gray-100 rounded-3xl py-5 pl-8 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-3 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-lg hover:shadow-indigo-200 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="flex justify-center items-center gap-4 mt-4 opacity-40 grayscale">
           <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Verified Context</span>
           <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
           <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Gemini 3 Flash</span>
           <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
           <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Safe RAG Pipeline</span>
        </div>
      </div>
    </div>
  );
};
