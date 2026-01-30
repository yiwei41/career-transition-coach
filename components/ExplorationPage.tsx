
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard } from '../types';
import { generateRolePossibilities } from '../geminiService';
import { StepLayout } from './StepLayout';

interface ExplorationPageProps {
  context: UserContext;
  cachedRoles: RoleCard[] | null;
  onRolesFetched: (roles: RoleCard[]) => void;
  onSelectRole: (role: RoleCard) => void;
  onExit: (type: 'not_for_me' | 'unsure') => void;
}

const SYNTHESIS_STEPS = [
  { id: 1, label: 'Context Distillation', icon: 'fa-filter', description: 'Extracting core value from your background...' },
  { id: 2, label: 'Directional Analysis', icon: 'fa-compass', description: 'Aligning origin background with target aspirations...' },
  { id: 3, label: 'Possibility Mapping', icon: 'fa-diagram-project', description: 'Generating role hypotheses that bridge the gap...' },
  { id: 4, label: 'Constraint Checking', icon: 'fa-shield-halved', description: 'Applying real-world market constraints and expectations...' },
  { id: 5, label: 'Role Synthesis', icon: 'fa-wand-magic-sparkles', description: 'Finalizing your exploration dashboard...' },
];

export const ExplorationPage: React.FC<ExplorationPageProps> = ({ context, cachedRoles, onRolesFetched, onSelectRole, onExit }) => {
  const [roles, setRoles] = useState<RoleCard[]>(cachedRoles || []);
  const [loading, setLoading] = useState(!cachedRoles);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let stepInterval: number;
    if (loading) {
      stepInterval = window.setInterval(() => {
        setActiveStep((prev) => (prev < SYNTHESIS_STEPS.length - 1 ? prev + 1 : prev));
      }, 1800);
    }

    if (!cachedRoles) {
      const fetchRoles = async () => {
        try {
          const res = await generateRolePossibilities(context);
          // Ensure minimum duration for the animation to feel meaningful
          await new Promise(resolve => setTimeout(resolve, 4000));
          setRoles(res);
          onRolesFetched(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
          if (stepInterval) clearInterval(stepInterval);
        }
      };
      fetchRoles();
    }

    return () => {
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [context, cachedRoles, onRolesFetched, loading]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-indigo-900 text-white mb-8 relative shadow-2xl shadow-indigo-200 overflow-hidden">
               <i className={`fas ${SYNTHESIS_STEPS[activeStep].icon} text-4xl z-10 transition-transform duration-500 scale-110`}></i>
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 animate-pulse"></div>
               <div className="absolute inset-0 border-4 border-white/20 rounded-[2rem]"></div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">Synthesis Engine</h2>
            <p className="text-gray-500 font-medium italic">{SYNTHESIS_STEPS[activeStep].description}</p>
          </div>

          <div className="space-y-6">
            {SYNTHESIS_STEPS.map((step, idx) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-5 transition-all duration-700 ${idx === activeStep ? 'scale-105 opacity-100' : idx < activeStep ? 'opacity-40 scale-95' : 'opacity-10 scale-90'}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-colors duration-500 ${
                  idx <= activeStep ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-200'
                }`}>
                  {idx < activeStep ? <i className="fas fa-check text-sm"></i> : <i className={`fas ${step.icon} text-xs`}></i>}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-black uppercase tracking-[0.2em] ${idx === activeStep ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                    {idx === activeStep && (
                      <div className="flex items-center gap-1.5">
                         <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                         </span>
                         <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Active</span>
                      </div>
                    )}
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-indigo-600 transition-all duration-[2000ms] ease-in-out ${idx === activeStep ? 'w-3/4' : idx < activeStep ? 'w-full' : 'w-0'}`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gray-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <i className="fas fa-microchip text-6xl text-white"></i>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-indigo-300 uppercase tracking-widest mb-4">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Neural Network Reasoning Layer
            </div>
            <div className="h-20 overflow-hidden relative">
              <div className="text-[10px] font-mono text-gray-400/80 space-y-1.5 animate-[scrollUp_12s_linear_infinite]">
                <p className="text-indigo-400 font-bold">&gt; INITIALIZING ROLE_ENGINE_V4</p>
                <p className="text-gray-500">&gt; DECODING ORIGIN_CONTEXT: {context.origin}</p>
                <p className="text-gray-500">&gt; MAPPING DIRECTIONS: {context.considering.join(", ")}</p>
                <p className="text-gray-500">&gt; EVALUATING FRICTION_NODES: {context.frictionPoints.length} points detected</p>
                <p className="text-gray-500">&gt; QUERYING MARKET_TAXONOMY: PIVOT_PATH_ALPHA</p>
                <p className="text-indigo-400">&gt; GENERATING HYPOTHESIS: ADJACENT_ROLE_MATCH</p>
                <p className="text-gray-500">&gt; OPTIMIZING ASSET_REUSE_RATIO...</p>
                <p className="text-gray-500">&gt; CALCULATING PIVOT_VELOCITY...</p>
                <p className="text-green-400 font-bold">&gt; STATUS: SYNTHESIS_READY_FOR_VALIDATION</p>
                <p className="text-gray-500">&gt; PREPARING POSSIBILITY_CARDS...</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes scrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <StepLayout 
      title="Let’s explore what this transition could look like."
      subtitle="These are not recommendations — just possibilities worth examining."
    >
      <div className="mb-10 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Based on what we know so far</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="bg-gray-100 px-3 py-1 rounded-full"><i className="fas fa-sign-out-alt mr-2"></i> {context.origin}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full"><i className="fas fa-compass mr-2"></i> Considering {context.considering.join(", ")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full">
            <div className="p-6 flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{role.name}</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Why this might make sense</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.why.map((w, i) => <li key={i} className="flex items-start"><i className="fas fa-check text-indigo-400 mt-1 mr-2 text-[10px]"></i>{w}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">This path assumes that...</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.assumptions.map((a, i) => <li key={i} className="flex items-start"><i className="fas fa-circle text-indigo-400 mt-1.5 mr-2 text-[6px]"></i>{a}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">What we don't know yet</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.uncertainties.map((u, i) => <li key={i} className="flex items-start"><i className="fas fa-question text-orange-400 mt-1 mr-2 text-[10px]"></i>{u}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-3 gap-2">
              <button 
                onClick={() => onSelectRole(role)}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-green-50 border border-transparent hover:border-green-200 transition-all text-gray-600 hover:text-green-700"
              >
                <i className="fas fa-thumbs-up text-lg mb-1"></i>
                <span className="text-[10px] font-bold uppercase">Worth exploring</span>
              </button>
              <button 
                onClick={() => onExit('unsure')}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all text-gray-600 hover:text-blue-700"
              >
                <i className="fas fa-meh text-lg mb-1"></i>
                <span className="text-[10px] font-bold uppercase">Not sure yet</span>
              </button>
              <button 
                onClick={() => onExit('not_for_me')}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-all text-gray-600 hover:text-red-700"
              >
                <i className="fas fa-thumbs-down text-lg mb-1"></i>
                <span className="text-[10px] font-bold uppercase">Probably not</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400 italic">
        These possibilities are based on limited information. We’ll validate assumptions before making any decisions.
      </div>
    </StepLayout>
  );
};
