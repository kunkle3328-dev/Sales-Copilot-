import React from 'react';
import { Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface DealHealthMeterProps {
  score: number;
}

const DealHealthMeter: React.FC<DealHealthMeterProps> = ({ score }) => {
  let colorClass = 'bg-red-500';
  let textClass = 'text-red-400';
  
  if (score >= 70) {
    colorClass = 'bg-green-500';
    textClass = 'text-green-400';
  } else if (score >= 40) {
    colorClass = 'bg-yellow-500';
    textClass = 'text-yellow-400';
  }

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-2 w-full">
        <Activity className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Deal Health</span>
      </div>
      
      <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden mt-2">
        <div 
          className={clsx("h-full transition-all duration-1000 ease-out", colorClass)}
          style={{ width: `${score}%` }}
        />
      </div>
      
      <div className="flex justify-between w-full mt-2 items-baseline">
        <span className="text-sm text-slate-500">Probability</span>
        <span className={clsx("text-2xl font-bold", textClass)}>{score}%</span>
      </div>
    </div>
  );
};

export default DealHealthMeter;