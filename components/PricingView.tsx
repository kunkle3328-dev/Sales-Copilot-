import React from 'react';
import { Check, Zap, Users, Shield } from 'lucide-react';

const PricingCard = ({ title, price, subtitle, features, highlight, icon: Icon }: any) => (
    <div className={`relative p-6 rounded-2xl border flex flex-col h-full ${highlight ? 'bg-slate-900 border-primary-500 shadow-xl shadow-primary-500/10' : 'bg-slate-950 border-slate-800'}`}>
        {highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                MOST POPULAR
            </div>
        )}
        <div className="mb-6">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-300">
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white">{price}</span>
                {price !== 'Custom' && <span className="text-slate-500">/ month</span>}
            </div>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{subtitle}</p>
        </div>
        <div className="flex-1 space-y-3 mb-8">
            {features.map((feat: string, i: number) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{feat}</span>
                </div>
            ))}
        </div>
        <button className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${highlight ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
            {price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
        </button>
    </div>
);

const PricingView = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 pb-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
         <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Win More Deals While the Call Is Still Happening
         </h1>
         <p className="text-lg text-slate-400 leading-relaxed">
            Live Sales Copilot listens during your sales calls and gives you real-time objection handling, buying-signal detection, and deal guidance—before the deal slips away.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <PricingCard 
            title="Starter"
            price="$49"
            subtitle="For individual sellers who want live help on critical calls."
            icon={Zap}
            features={[
                "Live AI suggestions",
                "Real-time transcription",
                "Objection detection",
                "Post-call summary",
                "10 live call hours / month"
            ]}
         />
         <PricingCard 
            title="Pro"
            price="$99"
            highlight={true}
            icon={Shield}
            subtitle="For professionals who sell every day."
            features={[
                "Unlimited live calls",
                "Buying signal detection",
                "Deal health scoring",
                "Follow-up email generation",
                "Personal objection memory"
            ]}
         />
         <PricingCard 
            title="Team"
            price="$299"
            icon={Users}
            subtitle="For small sales teams that want consistency."
            features={[
                "5 team seats",
                "Shared objection insights",
                "Team performance dashboard",
                "Playbook-based suggestions",
                "Manager visibility"
            ]}
         />
      </div>

      <div className="mt-16 bg-slate-900 rounded-2xl border border-slate-800 p-8 md:p-12 text-center">
         <h2 className="text-2xl font-bold text-white mb-4">Enterprise & Agency</h2>
         <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Need custom objection models, white-label options, or unlimited seats for a call center? We build custom solutions for high-velocity revenue teams.
         </p>
         <button className="px-8 py-3 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-colors">
            Contact Enterprise Sales
         </button>
      </div>
    </div>
  );
};

export default PricingView;