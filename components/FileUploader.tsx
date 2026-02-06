
import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2, FileCode } from 'lucide-react';
import { ProcessingState } from '../types';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  processing: ProcessingState;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, processing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (processing.status !== 'idle' && processing.status !== 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-indigo-200 rounded-xl animate-pulse">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 capitalize">{processing.status}...</h3>
        <p className="text-sm text-gray-500 mt-2">{processing.message || 'Preparing your document for analysis'}</p>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4 max-w-xs">
          <div 
            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${processing.progress}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center p-12 
        border-2 border-dashed rounded-2xl transition-all duration-200
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
      `}
    >
      <input
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
      />
      
      <div className="bg-indigo-100 p-4 rounded-full mb-4">
        <Upload className="w-8 h-8 text-indigo-600" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-800">Upload Document</h3>
      <p className="text-gray-500 text-center mt-2 max-w-xs">
        Supports <span className="font-semibold text-indigo-600">PDF, Word, Text,</span> and <span className="font-semibold text-indigo-600">Markdown</span>
      </p>
      
      <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          <span>Extraction</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          <span>Semantic Search</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          <span>AI Powered QA</span>
        </div>
      </div>
    </div>
  );
};
