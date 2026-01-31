
import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
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
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (processing.status !== 'idle' && processing.status !== 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-blue-200 rounded-xl">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 capitalize">{processing.status}...</h3>
        <p className="text-sm text-gray-500 mt-2">{processing.message || 'Preparing your document for analysis'}</p>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4 max-w-xs">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
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
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
      `}
    >
      <input
        type="file"
        accept=".pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
      />
      
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-800">Upload PDF</h3>
      <p className="text-gray-500 text-center mt-2 max-w-xs">
        Drag and drop your document here, or click to browse
      </p>
      
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
        <CheckCircle className="w-4 h-4" />
        <span>Text Extraction</span>
        <CheckCircle className="w-4 h-4" />
        <span>Semantic Search</span>
        <CheckCircle className="w-4 h-4" />
        <span>AI Powered QA</span>
      </div>
    </div>
  );
};
