
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard, SkillMapping, AIPreview } from '../types';
import { generateSkillMapping } from '../geminiService';
import { StepLayout } from './StepLayout';

interface ValidationPageProps {
  role: RoleCard;
  context: UserContext;
  preview: AIPreview;
  cachedSkills: SkillMapping[] | undefined;
  onSkillsUpdate: (skills: SkillMapping[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ANALYSIS_STEPS = [
  { id: 1, label: 'Deconstructing Role', icon: 'fa-layer-group', description: 'Breaking down market expectations for this position...' },
  { id: 2, label: 'Scanning Background', icon: 'fa-id-badge', description: 'Identifying hidden transferable assets in your origin story...' },
  { id: 3, label: 'Standardizing Context', icon: 'fa-bridge', description: 'Translating your experience into industry-standard terms...' },
  { id: 4, label: 'Gap Identification', icon: 'fa-magnifying-glass-chart', description: 'Mapping assumptions against critical role requirements...' },
  { id: 5, label: 'Finalizing Bridge', icon: 'fa-check-double', description: 'Preparing your validation dashboard...' },
];

export const ValidationPage: React.FC<ValidationPageProps> = ({ role, context, preview, cachedSkills, onSkillsUpdate, onNext, onBack }) => {
  const [skills, setSkills] = useState<SkillMapping[]>(cachedSkills || []);
  const [loading, setLoading] = useState(!cachedSkills);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let stepInterval: number;
    if (loading) {
      stepInterval = window.setInterval(() => {
        setActiveStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500); // Progress through visuals every 1.5s
    }

    if (!cachedSkills) {
      const fetchSkills = async () => {
        try {
          const res = await generateSkillMapping(role, context);
          // Wait a tiny bit if the API is too fast, so the user sees the cool animation
          await new Promise(resolve => setTimeout(resolve, 3000));
          setSkills(res);
          onSkillsUpdate(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
          if (stepInterval) clearInterval(stepInterval);
        }
      };
      fetchSkills();
    }

    return () => {
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [role, context, cachedSkills, onSkillsUpdate, loading]);

  const updateConfidence = (index: number, confidence: 'high' | 'unsure' | 'gap') => {
    const updated = skills.map((s, i) => i === index ? { ...s, confidence } : s);
    setSkills(updated);
    onSkillsUpdate(updated);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 mb-6 relative overflow-hidden">
               <i className={`fas ${ANALYSIS_STEPS[activeStep].icon} text-3xl z-10 animate-bounce`}></i>
               <div className="absolute inset-0 bg-indigo-100/50 animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Analysis Engine Active</h2>
            <p className="text-gray-500 italic">{ANALYSIS_STEPS[activeStep].description}</p>
          </div>

          <div className="space-y-6">
            {ANALYSIS_STEPS.map((step, idx) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-4 transition-all duration-500 ${idx === activeStep ? 'scale-100 opacity-100' : idx < activeStep ? 'opacity-50 scale-95' : 'opacity-20 scale-90'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  idx <= activeStep ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 text-gray-300'
                }`}>
                  {idx < activeStep ? <i className="fas fa-check text-xs"></i> : <span className="text-xs font-bold">{step.id}</span>}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-bold uppercase tracking-widest ${idx === activeStep ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                    {idx === activeStep && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-black animate-pulse">PROCESSING</span>
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-indigo-600 transition-all duration-1000 ease-out ${idx === activeStep ? 'w-1/2' : idx < activeStep ? 'w-full' : 'w-0'}`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              Neural Bridge Connection: Established
            </div>
            <div className="mt-2 h-16 overflow-hidden relative">
              <div className="text-[10px] font-mono text-indigo-400/60 space-y-1 animate-[slideUp_10s_linear_infinite]">
                <p>&gt; fetch market_data --role="{role.name}"</p>
                <p>&gt; parsing experience_summary --origin="{context.origin}"</p>
                <p>&gt; cross_referencing skills[transferable]</p>
                <p>&gt; weighting uncertainty_factors...</p>
                <p>&gt; mapping evidence_nodes...</p>
                <p>&gt; generating bridge_narrative_matrix...</p>
                <p>&gt; success: context_sync_complete</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent"></div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes slideUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <StepLayout 
      title="Let’s validate this transition together"
      subtitle="We’re checking assumptions — not making decisions yet."
    >
      <div className="space-y-8">
        <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg border border-indigo-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold opacity-80 uppercase tracking-widest">Current Assumption</h3>
            <span className="bg-indigo-700 px-4 py-1 rounded-full text-sm font-bold">Transitioning into: {role.name}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div>
               <h4 className="text-indigo-300 text-xs font-bold uppercase mb-2">What's Clear</h4>
               <ul className="text-sm space-y-2 opacity-90">
                 {preview.clear.slice(0, 3).map((item, i) => <li key={i}>• {item}</li>)}
               </ul>
             </div>
             <div>
               <h4 className="text-indigo-300 text-xs font-bold uppercase mb-2">Transferable Strengths</h4>
               <ul className="text-sm space-y-2 opacity-90">
                 {preview.assumptions.slice(0, 3).map((item, i) => <li key={i}>• {item}</li>)}
               </ul>
             </div>
             <div>
               <h4 className="text-indigo-300 text-xs font-bold uppercase mb-2">Critical Uncertainties</h4>
               <ul className="text-sm space-y-2 opacity-90">
                 {role.uncertainties.slice(0, 2).map((item, i) => <li key={i}>• {item}</li>)}
               </ul>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">Skill</th>
                  <th className="px-6 py-4">Why it matters</th>
                  <th className="px-6 py-4">Assumed Background</th>
                  <th className="px-6 py-4 text-center">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {skills.map((s, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{s.skill}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{s.whyItMatters}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs italic">{s.assumedBackground}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-1">
                        <button 
                          onClick={() => updateConfidence(idx, 'high')}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                            s.confidence === 'high' ? 'bg-green-500 text-white border-green-600' : 'bg-white text-gray-400 border-gray-200 hover:border-green-300'
                          }`}
                          title="Confident"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button 
                          onClick={() => updateConfidence(idx, 'unsure')}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                            s.confidence === 'unsure' ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-400 border-gray-200 hover:border-orange-300'
                          }`}
                          title="Unsure"
                        >
                          <i className="fas fa-question"></i>
                        </button>
                        <button 
                          onClick={() => updateConfidence(idx, 'gap')}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                            s.confidence === 'gap' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300'
                          }`}
                          title="Likely a gap"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8">
          <button 
            onClick={onBack}
            className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to options
          </button>
          <button 
            onClick={onNext}
            className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg transform hover:-translate-y-1"
          >
            Continue to decision support
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </StepLayout>
  );
};
