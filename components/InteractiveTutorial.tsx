import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export interface TutorialStep {
  targetId?: string; // If undefined, shows as a centered modal
  title: string;
  content: string;
  position?: 'right' | 'left' | 'top' | 'bottom';
}

interface InteractiveTutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
  onStepChange?: (stepIndex: number) => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ steps, onComplete, onSkip, onStepChange }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = steps[currentStepIndex];
  
  // Trigger onStepChange on initial mount
  useEffect(() => {
    onStepChange?.(currentStepIndex);
  }, []);

  // Calculate position of the target element
  useEffect(() => {
    const updatePosition = () => {
      if (step.targetId) {
        const element = document.getElementById(step.targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
          // Scroll element into view with padding for mobile
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        } else {
            // Fallback if element not found (e.g. mobile view hidden)
            setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    };

    // Small delay to allow for rendering/transitions (like sidebar opening)
    const timeout = setTimeout(updatePosition, 400);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStepIndex, step.targetId]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onStepChange?.(nextIndex);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onStepChange?.(prevIndex);
    }
  };

  // Render centered modal for steps without a target (e.g., Intro)
  if (!step.targetId || !targetRect) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl relative flex flex-col items-center text-center">
            <button onClick={onSkip} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Sparkles className="w-8 h-8 text-primary-500" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">{step.content}</p>

            <div className="flex gap-3 w-full">
                {currentStepIndex > 0 && (
                    <button onClick={handlePrev} className="px-6 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl font-medium transition-colors">
                        Back
                    </button>
                )}
                <button 
                    onClick={handleNext}
                    className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
                >
                    {currentStepIndex === steps.length - 1 ? 'Finish' : 'Start Tour'} <ChevronRight size={18} />
                </button>
            </div>
            
            <div className="mt-6 flex gap-1.5">
                {steps.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={clsx(
                            "w-2 h-2 rounded-full transition-all", 
                            idx === currentStepIndex ? "bg-primary-500 w-4" : "bg-slate-700"
                        )} 
                    />
                ))}
            </div>
        </div>
      </div>
    );
  }

  // Spotlight Logic
  const getPopoverStyle = (): React.CSSProperties => {
    if (!targetRect) return {};
    
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        // Smart Mobile Positioning:
        // If element is in top half, show card at bottom.
        // If element is in bottom half, show card at top.
        const centerY = targetRect.top + (targetRect.height / 2);
        const screenMiddle = window.innerHeight / 2;
        const placeAtBottom = centerY < screenMiddle;

        return {
            position: 'fixed',
            left: 12,
            right: 12,
            width: 'auto',
            zIndex: 61,
            // Flip position based on element location to avoid obstruction
            ...(placeAtBottom ? { bottom: 20, top: 'auto' } : { top: 20, bottom: 'auto' })
        };
    }
    
    // Desktop Logic
    const gap = 16;
    const width = 320;
    
    // Determine coordinates based on preferred position
    let top = 0;
    let left = 0;
    
    const safePosition = step.position || 'right';

    switch (safePosition) {
        case 'right':
            top = targetRect.top + (targetRect.height / 2) - 100;
            left = targetRect.right + gap;
            break;
        case 'left':
            top = targetRect.top + (targetRect.height / 2) - 100;
            left = targetRect.left - width - gap;
            break;
        case 'bottom':
            top = targetRect.bottom + gap;
            left = targetRect.left + (targetRect.width / 2) - (width / 2);
            break;
        case 'top':
            top = targetRect.top - 200 - gap;
            left = targetRect.left + (targetRect.width / 2) - (width / 2);
            break;
    }

    // Keep onscreen
    if (left < 10) left = 10;
    if (left + width > window.innerWidth - 10) left = window.innerWidth - width - 10;
    if (top < 10) top = 10;
    if (top + 200 > window.innerHeight) top = window.innerHeight - 220;

    return { top, left, width, position: 'fixed', zIndex: 61 };
  };

  const style = getPopoverStyle();

  return (
    <>
        {/* Full screen backdrop */}
        <div className="fixed inset-0 z-[60] pointer-events-none">
            {/* Top */}
            <div className="absolute bg-slate-950/80 backdrop-blur-[2px] transition-all duration-300 ease-out" style={{ top: 0, left: 0, right: 0, height: targetRect.top }} />
            {/* Bottom */}
            <div className="absolute bg-slate-950/80 backdrop-blur-[2px] transition-all duration-300 ease-out" style={{ top: targetRect.bottom, left: 0, right: 0, bottom: 0 }} />
            {/* Left */}
            <div className="absolute bg-slate-950/80 backdrop-blur-[2px] transition-all duration-300 ease-out" style={{ top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height }} />
            {/* Right */}
            <div className="absolute bg-slate-950/80 backdrop-blur-[2px] transition-all duration-300 ease-out" style={{ top: targetRect.top, left: targetRect.right, right: 0, height: targetRect.height }} />
            
            {/* Highlight Box Border */}
            <div 
                className="absolute border-2 border-primary-500 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 ease-out animate-pulse"
                style={{ top: targetRect.top - 4, left: targetRect.left - 4, width: targetRect.width + 8, height: targetRect.height + 8 }}
            />
        </div>

        {/* Tutorial Card */}
        <div 
            className="bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-2xl transition-all duration-300 ease-out flex flex-col"
            style={style}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg">{step.title}</h3>
                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {currentStepIndex + 1}/{steps.length}
                </span>
            </div>
            
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                {step.content}
            </p>

            <div className="flex justify-between items-center mt-auto">
                <button 
                    onClick={onSkip} 
                    className="text-xs text-slate-500 hover:text-slate-300 font-medium px-2 py-1"
                >
                    Skip
                </button>
                <div className="flex gap-2">
                    <button 
                        onClick={handlePrev} 
                        disabled={currentStepIndex === 0}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={handleNext} 
                        className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary-900/20 flex items-center gap-1 transition-all"
                    >
                        {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    </>
  );
};

export default InteractiveTutorial;