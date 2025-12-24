import React from 'react';
import { CallSummary } from '../types';
import { CheckCheck, Mail, AlertTriangle, FileText } from 'lucide-react';

interface SummaryViewProps {
  summary: CallSummary;
  onReset: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, onReset }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Call Analysis Complete</h2>
        <button 
          onClick={onReset}
          className="w-full md:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 shadow-sm"
          title="Return to the live monitoring screen"
        >
          Start New Call
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Overview */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 md:col-span-2 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-primary-500 w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">
            {summary.overview}
          </p>
        </div>

        {/* Objections */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-orange-500 w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">Objections Raised</h3>
          </div>
          {summary.objections.length > 0 ? (
            <ul className="space-y-3">
                {summary.objections.map((obj, i) => (
                <li key={i} className="flex gap-3 text-slate-300 text-sm bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <span className="leading-snug">{obj}</span>
                </li>
                ))}
            </ul>
          ) : (
            <div className="text-slate-500 text-sm italic">No significant objections detected.</div>
          )}
        </div>

        {/* Action Items */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCheck className="text-green-500 w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">Next Steps</h3>
          </div>
          <ul className="space-y-3">
            {summary.actionItems.map((item, i) => (
              <li key={i} className="flex gap-3 text-slate-300 text-sm bg-slate-950/50 p-3 rounded-lg items-start border border-slate-800/50">
                <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center shrink-0 mt-0.5 opacity-60">
                  <div className="w-2.5 h-2.5 bg-transparent hover:bg-green-500 rounded-sm transition-colors cursor-pointer" />
                </div>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Follow Up Email */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 md:col-span-2 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="text-blue-400 w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">Draft Follow-Up Email</h3>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg font-mono text-sm text-slate-400 whitespace-pre-wrap border border-slate-800 overflow-x-auto">
            {summary.followUpEmail}
          </div>
          <div className="mt-4 flex justify-end">
             <button 
                onClick={() => navigator.clipboard.writeText(summary.followUpEmail)}
                className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 font-medium"
                title="Copy email text to clipboard"
             >
               <span className="w-4 h-4 flex items-center justify-center rounded border border-blue-400/30">+</span> Copy to Clipboard
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;