
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard, SkillMapping, DecisionSupport } from '../types';
import { generateDecisionSupport } from '../geminiService';
import { StepLayout } from './StepLayout';

interface DecisionPageProps {
  role: RoleCard;
  skills: SkillMapping[];
  context: UserContext;
  cachedDecision: DecisionSupport | undefined;
  onDecisionFetched: (d: DecisionSupport) => void;
  onReset: () => void;
  onNavigateToResume: () => void;
  onBack: () => void;
}

const JUDGMENT_STEPS = [
  { id: 1, label: 'Signal Integration', icon: 'fa-file-medical', description: 'Merging validated strengths with market demand...' },
  { id: 2, label: 'Risk Modeling', icon: 'fa-shield-virus', description: 'Simulating potential friction points and talent gaps...' },
  { id: 3, label: 'Confidence Calibration', icon: 'fa-scale-balanced', description: 'Calculating transition probability score...' },
  { id: 4, label: 'Strategic Synthesis', icon: 'fa-brain-circuit', description: 'Formulating actionable career advice...' },
  { id: 5, label: 'Verdict Finalization', icon: 'fa-gavel', description: 'Assembling your decision support matrix...' },
];

export const DecisionPage: React.FC<DecisionPageProps> = ({ role, skills, context, cachedDecision, onDecisionFetched, onReset, onNavigateToResume, onBack }) => {
  const [decision, setDecision] = useState<DecisionSupport | null>(cachedDecision || null);
  const [loading, setLoading] = useState(!cachedDecision);
  const [activeStep, setActiveStep] = useState(0);
  const [logicLogs, setLogicLogs] = useState<string[]>([]);

  useEffect(() => {
    let stepInterval: number;
    let logInterval: number;

    if (loading) {
      stepInterval = window.setInterval(() => {
        setActiveStep((prev) => (prev < JUDGMENT_STEPS.length - 1 ? prev + 1 : prev));
      }, 1600);

      const possibleLogs = [
        "Aggregating validated skill nodes...",
        "Identifying high-impact transferable assets...",
        "Evaluating residual market uncertainties...",
        "Cross-referencing against peer transition data...",
        "Weighting 'high confidence' vs 'unsure' inputs...",
        "Determining critical path friction levels...",
        "Synthesizing signal-to-noise ratio...",
        "Generating actionable next-step priorities...",
        "Calibrating final confidence metrics...",
        "Success: Decision matrix ready."
      ];

      logInterval = window.setInterval(() => {
        setLogicLogs(prev => {
          const next = [...prev, possibleLogs[Math.floor(Math.random() * possibleLogs.length)]];
          return next.slice(-5); // Keep last 5
        });
      }, 700);
    }

    if (!cachedDecision) {
      const fetchDecision = async () => {
        try {
          const res = await generateDecisionSupport(role, skills, context);
          // Allow users to experience the "Judgment Engine" visuals
          await new Promise(resolve => setTimeout(resolve, 4500));
          setDecision(res);
          onDecisionFetched(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
          if (stepInterval) clearInterval(stepInterval);
          if (logInterval) clearInterval(logInterval);
        }
      };
      fetchDecision();
    }

    return () => {
      if (stepInterval) clearInterval(stepInterval);
      if (logInterval) clearInterval(logInterval);
    };
  }, [role, skills, context, cachedDecision, onDecisionFetched, loading]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-50 text-indigo-600 mb-8 relative shadow-xl shadow-indigo-100/50 overflow-hidden">
               <i className={`fas ${JUDGMENT_STEPS[activeStep].icon} text-4xl z-10 transition-all duration-500 transform ${activeStep % 2 === 0 ? 'scale-110' : 'scale-95'}`}></i>
               <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">Judgment Engine V1</h2>
            <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                <p className="text-gray-500 font-medium italic text-sm">{JUDGMENT_STEPS[activeStep].description}</p>
            </div>
          </div>

          <div className="space-y-5 mb-12">
            {JUDGMENT_STEPS.map((step, idx) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-4 transition-all duration-500 ${idx === activeStep ? 'scale-100 opacity-100' : idx < activeStep ? 'opacity-40 scale-95' : 'opacity-10 scale-90'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  idx <= activeStep ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'border-gray-100 text-gray-200'
                }`}>
                  {idx < activeStep ? <i className="fas fa-check text-[10px]"></i> : <span className="text-[10px] font-black">{step.id}</span>}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${idx === activeStep ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                    {idx === activeStep && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-black animate-pulse">CALCULATING</span>}
                  </div>
                  <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div 
                      className={`h-full bg-indigo-600 transition-all duration-[1600ms] ease-out ${idx === activeStep ? 'w-2/3' : idx < activeStep ? 'w-full' : 'w-0'}`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl relative border border-white/5">
             <div className="flex items-center gap-3 text-[9px] font-mono text-indigo-400 uppercase tracking-widest mb-4">
                <i className="fas fa-terminal"></i>
                Strategic Reasoning Console
             </div>
             <div className="h-28 overflow-hidden flex flex-col justify-end">
               <div className="text-[10px] font-mono text-gray-400 space-y-2">
                 {logicLogs.map((log, i) => (
                    <p key={i} className={`flex gap-3 animate-[fadeInLog_0.2s_ease-out] ${i === logicLogs.length - 1 ? 'text-indigo-300' : 'opacity-60'}`}>
                        <span className="text-gray-600 font-bold">$</span>
                        <span>{log}</span>
                    </p>
                 ))}
               </div>
             </div>
             {/* Decorative Scan Line */}
             <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/10 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-[scanTerminal_3s_linear_infinite]"></div>
          </div>
        </div>

        <style>{`
          @keyframes fadeInLog {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes scanTerminal {
            0% { top: 0%; opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  const confidenceColors = {
    'Low': 'bg-red-50 text-red-700 border-red-200',
    'Medium': 'bg-orange-50 text-orange-700 border-orange-200',
    'High': 'bg-green-50 text-green-700 border-green-200'
  };

  return (
    <StepLayout 
      title="Decision Support"
      subtitle="Actionable judgment based on your validation, not just a generic conclusion."
    >
      <div className="space-y-8">
        <div className={`p-8 rounded-2xl border ${confidenceColors[decision?.confidenceLevel || 'Medium']} shadow-sm`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Based on what we've validated so far:</h3>
              <p className="text-2xl font-black mb-4">This transition looks <span className="underline decoration-4">{decision?.confidenceLevel} confidence</span></p>
            </div>
            <div className="hidden md:block">
              <i className={`fas ${decision?.confidenceLevel === 'High' ? 'fa-check-double' : decision?.confidenceLevel === 'Medium' ? 'fa-exclamation-triangle' : 'fa-times-circle'} text-5xl opacity-20`}></i>
            </div>
          </div>
          <div className="pt-4 border-t border-current border-opacity-20">
            <p className="font-medium"><span className="opacity-70">Main Uncertainty:</span> {decision?.mainUncertainty}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4 flex items-center">
              <i className="fas fa-arrow-trend-up mr-2"></i> Signals in your favor
            </h4>
            <ul className="space-y-3">
              {decision?.signals.map((s, i) => (
                <li key={i} className="flex items-start text-sm text-gray-700">
                  <i className="fas fa-plus-circle text-green-400 mt-1 mr-2"></i> {s}
                </li>
              ))}
              {skills.filter(s => s.confidence === 'high').map((s, i) => (
                <li key={`skill-${i}`} className="flex items-start text-sm text-gray-700">
                  <i className="fas fa-check-circle text-green-400 mt-1 mr-2"></i> {s.skill} (Verified Confidence)
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center">
              <i className="fas fa-shield-halved mr-2"></i> Open risks
            </h4>
            <ul className="space-y-3">
              {decision?.risks.map((r, i) => (
                <li key={i} className="flex items-start text-sm text-gray-700">
                  <i className="fas fa-circle-exclamation text-red-400 mt-1 mr-2"></i> {r}
                </li>
              ))}
              {skills.filter(s => s.confidence === 'gap').map((s, i) => (
                <li key={`gap-${i}`} className="flex items-start text-sm text-gray-700">
                  <i className="fas fa-minus-circle text-red-400 mt-1 mr-2"></i> {s.skill} (Identified Gap)
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">What would you like to do next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={onNavigateToResume}
              className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left bg-indigo-50/20 group"
            >
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-file-signature"></i>
              </div>
              <div>
                <span className="block font-bold text-gray-900">Generate pivot-ready resume draft</span>
                <span className="text-xs text-gray-500 italic">Reframes your origin story for {role.name}.</span>
              </div>
            </button>
            <button className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-gray-900 hover:bg-gray-50 transition-all text-left" onClick={onReset}>
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-pause"></i>
              </div>
              <div>
                <span className="block font-bold text-gray-900">Pause and reflect</span>
                <span className="text-xs text-gray-500">Save progress and come back with a clear mind.</span>
              </div>
            </button>
          </div>
        </section>

        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
          <button 
            onClick={onBack}
            className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to validation
          </button>
          <div className="flex gap-4">
            <button onClick={onReset} className="px-6 py-2 text-gray-500 hover:text-gray-900 font-bold">Start over</button>
            <button onClick={onReset} className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all">Mark as not a priority</button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};
