import React, { useState, useEffect } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import { SessionStatus, CallSummary, AppConfig, ViewType } from './types';
import { generateCallSummary } from './services/geminiService';
import TranscriptView from './components/TranscriptView';
import DealHealthMeter from './components/DealHealthMeter';
import ObjectionCard from './components/ObjectionCard';
import SummaryView from './components/SummaryView';
import AdminView from './components/AdminView';
import PricingView from './components/PricingView';
import InteractiveTutorial, { TutorialStep } from './components/InteractiveTutorial';
import { Mic, Play, Square, Loader2, Sparkles, CheckCheck, Menu, X, HelpCircle, Settings, CreditCard, Home } from 'lucide-react';
import { clsx } from 'clsx';

// Tutorial Steps Definition
const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: "Welcome to Sales Copilot",
        content: "This interactive tour will guide you through using real-time AI to close more deals. Let's get your workspace set up.",
    },
    {
        targetId: "tutorial-start-btn",
        title: "1. Start Listening",
        content: "When your call begins, click here. The AI will start listening to audio and transcribing the conversation in real-time.",
        position: "right"
    },
    {
        targetId: "tutorial-transcript",
        title: "2. Live Transcript",
        content: "The conversation appears here instantly. You'll see both your words and the prospect's distinctively.",
        position: "left"
    },
    {
        targetId: "tutorial-deal-health",
        title: "3. Deal Health Meter",
        content: "This score updates live (0-100%). It analyzes sentiment and engagement to tell you if you're winning or losing the deal.",
        position: "right"
    },
    {
        targetId: "tutorial-insights",
        title: "4. Live Coaching",
        content: "This area surfaces objections, buying signals, and suggests exactly what to say next to handle pushback.",
        position: "right"
    },
    {
        targetId: "tutorial-start-btn", // Re-using this area as the button changes state
        title: "5. End & Analyze",
        content: "When the call is over, click 'End Call'. We'll instantly generate a summary, follow-up email, and action items for your CRM.",
        position: "right"
    }
];

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('copilot');
  const [appConfig, setAppConfig] = useState<AppConfig>({
      enableLiveSuggestions: true,
      enableObjectionDetection: true,
      enableBuyingSignals: true,
      enableDealHealth: true,
      adminMode: true,
      systemLimits: {
        maxCallDuration: 60,
        suggestionFrequency: 'Medium',
        memoryRetention: 'Session'
      }
  });

  const { 
    status, 
    connect, 
    disconnect, 
    transcript, 
    currentInsight, 
    objections 
  } = useGeminiLive(appConfig);

  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check for first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedSalesCopilot');
    if (!hasVisited) {
        setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
      setShowTutorial(false);
      localStorage.setItem('hasVisitedSalesCopilot', 'true');
      setSidebarOpen(false); // Reset sidebar state
  };
  
  const handleTutorialStepChange = (index: number) => {
      const step = TUTORIAL_STEPS[index];
      if (window.innerWidth < 768) {
          // List of IDs that reside in the sidebar
          const sidebarIds = ['tutorial-start-btn', 'tutorial-deal-health', 'tutorial-insights'];
          
          if (step.targetId && sidebarIds.includes(step.targetId)) {
              setSidebarOpen(true);
          } else if (step.targetId === 'tutorial-transcript') {
              setSidebarOpen(false);
          }
      }
  };

  const handleEndCall = async () => {
    disconnect();
    if (transcript.length > 0) {
      setIsGeneratingSummary(true);
      try {
        const summary = await generateCallSummary(transcript);
        setCallSummary(summary);
      } catch (e) {
        console.error("Failed to generate summary", e);
      } finally {
        setIsGeneratingSummary(false);
      }
    }
  };

  const handleStartCall = () => {
    setCallSummary(null);
    connect();
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  };

  const handleNavigation = (view: ViewType) => {
    setCurrentView(view);
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  };

  if (callSummary) {
    return (
      <div className="h-full bg-slate-950 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <SummaryView summary={callSummary} onReset={() => setCallSummary(null)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden relative">
      {showTutorial && (
          <InteractiveTutorial 
            steps={TUTORIAL_STEPS} 
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialComplete}
            onStepChange={handleTutorialStepChange}
          />
      )}

      {/* --- Mobile Sidebar Overlay --- */}
      <div 
        className={clsx(
            "fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
            isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )} 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* --- Sidebar (Navigation & Insights) --- */}
      <aside className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-out md:static md:translate-x-0",
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">Sales Copilot</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
            <button 
                onClick={() => handleNavigation('copilot')}
                className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    currentView === 'copilot' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
            >
                <Home size={18} /> Copilot
            </button>
            <button 
                onClick={() => handleNavigation('pricing')}
                className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    currentView === 'pricing' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
            >
                <CreditCard size={18} /> Pricing
            </button>
            <button 
                onClick={() => handleNavigation('admin')}
                className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    currentView === 'admin' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
            >
                <Settings size={18} /> Admin
            </button>
        </nav>

        {/* Dynamic Sidebar Content */}
        <div className="flex-1 overflow-y-auto border-t border-slate-800 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
             {/* Only show Call Insights if we are in Copilot mode */}
             {currentView === 'copilot' && (
                <div className="p-4 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                         <span className={clsx(
                             "w-2 h-2 rounded-full",
                             status === SessionStatus.ACTIVE ? "bg-green-500 animate-pulse" : "bg-slate-600"
                         )} />
                         <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                             {status === SessionStatus.ACTIVE ? "Live Monitoring" : "Standby"}
                         </span>
                    </div>

                    <div id="tutorial-deal-health">
                        <DealHealthMeter score={appConfig.enableDealHealth ? currentInsight.dealHealth : 0} />
                    </div>
                    
                    <div id="tutorial-insights" className="space-y-4">
                        {currentInsight.latestSuggestion && appConfig.enableLiveSuggestions && (
                            <div className="bg-primary-900/20 border border-primary-500/30 p-4 rounded-xl animate-in slide-in-from-left-2 fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-primary-400" />
                                <span className="text-xs font-bold text-primary-400 uppercase">Live Suggestion</span>
                            </div>
                            <p className="text-primary-100 text-sm font-medium leading-snug">
                                {currentInsight.latestSuggestion}
                            </p>
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between items-center mb-3 px-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Objections</span>
                            <span className="text-xs text-slate-600">{objections.length}</span>
                            </div>
                            <div className="space-y-2">
                            {objections.length === 0 && (
                                <div className="text-center py-6 text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-lg">
                                No objections detected.
                                </div>
                            )}
                            {objections.map((obj, i) => (
                                <ObjectionCard key={i} objection={obj} />
                            ))}
                            </div>
                        </div>

                        {currentInsight.buyingSignal && appConfig.enableBuyingSignals && (
                            <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl animate-in slide-in-from-bottom-2 fade-in duration-700">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-400 uppercase">Buying Signal</span>
                            </div>
                            <p className="text-emerald-100 text-sm font-medium leading-snug">
                                {currentInsight.buyingSignal}
                            </p>
                            </div>
                        )}
                    </div>
                </div>
             )}

             {/* Show placeholder or specific help for other views if needed */}
             {currentView !== 'copilot' && (
                 <div className="p-6 text-center text-slate-500 text-sm italic">
                    Configure your workspace settings and manage subscription tiers.
                 </div>
             )}
        </div>

        {/* Call Controls */}
        {currentView === 'copilot' && (
            <div id="tutorial-start-btn" className="p-4 border-t border-slate-800 bg-slate-900/50">
            {status === SessionStatus.IDLE || status === SessionStatus.FINISHED || status === SessionStatus.ERROR ? (
                <button 
                onClick={handleStartCall}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary-900/20 active:scale-95"
                >
                <Play className="w-4 h-4" fill="currentColor" />
                Start Listening
                </button>
            ) : (
                <button 
                onClick={handleEndCall}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-red-900/20 active:scale-95"
                >
                <Square className="w-4 h-4" fill="currentColor" />
                End Call & Analyze
                </button>
            )}
            </div>
        )}
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col relative bg-slate-950 w-full md:w-auto h-full overflow-hidden">
         {/* Top Bar */}
         <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
               <button 
                 onClick={() => setSidebarOpen(true)}
                 className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
               >
                 <Menu size={20} />
               </button>

               <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  {currentView === 'copilot' && <><Mic className="w-4 h-4 text-slate-500" /> <span>Live Transcript</span></>}
                  {currentView === 'admin' && <><Settings className="w-4 h-4 text-slate-500" /> <span>Admin Console</span></>}
                  {currentView === 'pricing' && <><CreditCard className="w-4 h-4 text-slate-500" /> <span>Subscription Plans</span></>}
               </div>
               
               {isGeneratingSummary && (
                 <div className="flex items-center gap-2 text-primary-400 text-sm animate-pulse ml-2">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <span className="hidden md:inline">Analyzing...</span>
                 </div>
               )}
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setShowTutorial(true)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-2 hover:bg-slate-900 rounded-lg"
                title="Restart Tutorial"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
         </header>

         {/* Content based on View */}
         <div id="tutorial-transcript" className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 relative">
             {currentView === 'copilot' && <TranscriptView transcript={transcript} />}
             {currentView === 'admin' && <AdminView config={appConfig} onConfigChange={setAppConfig} />}
             {currentView === 'pricing' && <PricingView />}
             
             {/* Connection Overlay */}
             {status === SessionStatus.CONNECTING && currentView === 'copilot' && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                    <p className="text-slate-300 font-medium">Connecting to Gemini Live...</p>
                </div>
            )}
         </div>
      </main>
    </div>
  );
}

export default App;