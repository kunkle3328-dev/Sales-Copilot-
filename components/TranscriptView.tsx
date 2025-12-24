import React, { useEffect, useRef } from 'react';
import { TranscriptItem } from '../types';
import { clsx } from 'clsx';
import { User, Bot } from 'lucide-react';

interface TranscriptViewProps {
  transcript: TranscriptItem[];
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ transcript }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pb-24 md:pb-6">
      {transcript.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center animate-pulse ring-1 ring-slate-800">
            <User className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">Ready to listen...</p>
        </div>
      )}
      
      {transcript.map((item, idx) => (
        <div key={idx} className={clsx("flex gap-3", item.role === 'model' ? "flex-row-reverse" : "")}>
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5",
            item.role === 'model' ? "bg-primary-900/50 text-primary-400" : "bg-slate-800 text-slate-400"
          )}>
            {item.role === 'model' ? <Bot size={16} /> : <User size={16} />}
          </div>
          <div className={clsx(
            "max-w-[85%] md:max-w-[75%] rounded-2xl p-3.5 text-sm shadow-sm",
            item.role === 'model' 
              ? "bg-primary-900/20 text-primary-100 border border-primary-900/50 rounded-tr-sm" 
              : "bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/50"
          )}>
            <p className="leading-relaxed whitespace-pre-wrap">{item.text}</p>
            <span className="text-[10px] opacity-40 mt-1.5 block font-mono">
              {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
            </span>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default TranscriptView;