import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Objection } from '../types';

interface ObjectionCardProps {
  objection: Objection;
}

const ObjectionCard: React.FC<ObjectionCardProps> = ({ objection }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 mb-3">
      <div className="bg-slate-900/50 border-l-4 border-orange-500 rounded-r-lg p-3 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-100 uppercase tracking-wide">{objection.type} Detected</span>
          </div>
          <span className="text-xs text-slate-500">{new Date(objection.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}</span>
        </div>
        
        <p className="text-slate-300 text-sm mt-1 mb-2 font-medium">
          "{objection.suggestion}"
        </p>
        
        <div className="flex gap-2">
          <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors">
            Acknowledge
          </button>
          <button className="text-xs bg-orange-900/30 hover:bg-orange-900/50 text-orange-200 px-2 py-1 rounded transition-colors border border-orange-900/50">
            View Playbook
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObjectionCard;