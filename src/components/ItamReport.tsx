import React from 'react';
import Markdown from 'react-markdown';
import { X } from 'lucide-react';

interface ItamReportProps {
  reportContent: string;
  onClose: () => void;
}

export function ItamReport({ reportContent, onClose }: ItamReportProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-xl shadow-2xl shrink-0 w-full max-w-4xl max-h-full flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Informe de Asset Management</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="prose prose-blue max-w-none prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-500">
            <Markdown>{reportContent}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
