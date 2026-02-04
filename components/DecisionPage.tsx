
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard, SkillMapping, DecisionSupport } from '../types';
import { generateDecisionSupport } from '../geminiService';
import { StepLayout } from './StepLayout';
import { AnalysisProgressDisplay } from './AnalysisProgressDisplay';

interface DecisionPageProps {
  role: RoleCard;
  skills: SkillMapping[];
  context: UserContext;
  cachedDecision: DecisionSupport | undefined;
  onDecisionFetched: (d: DecisionSupport) => void;
  onReset: () => void;
<<<<<<< HEAD
  onDecisionReady?: (decision: DecisionSupport) => void;
  onResume?: () => void;
  onBackToValidation?: () => void;
  onExit?: (type: 'not_for_me' | 'unsure') => void;
}

export const DecisionPage: React.FC<DecisionPageProps> = ({ role, skills, context, onReset, onDecisionReady, onResume, onBackToValidation, onExit }) => {
  const [decision, setDecision] = useState<DecisionSupport | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expandedSignals, setExpandedSignals] = useState(false);
  const [expandedRisks, setExpandedRisks] = useState(false);

  const highSkills = skills.filter(s => s.confidence === 'high');
  const unsureSkills = skills.filter(s => s.confidence === 'unsure');
  const gapSkills = skills.filter(s => s.confidence === 'gap');

  const verdictSteps = [
    { id: 'risk', label: 'RISK MODELING', progress: 25 },
    { id: 'confidence', label: 'CONFIDENCE CALIBRATION', progress: 50 },
    { id: 'strategic', label: 'STRATEGIC SYNTHESIS', progress: 75 },
    { id: 'verdict', label: 'VERDICT FINALIZATION', progress: 95 },
  ];

  const verdictConsoleLogs = [
    { text: 'STRATEGIC REASONING CONSOLE', highlight: true },
    { text: 'Synthesizing signal-to-noise ratio...', prefix: '$' },
    { text: 'Generating actionable next-step priorities...', prefix: '$' },
    { text: 'Determining critical path friction levels...', prefix: '$' },
    { text: "Weighting 'high confidence' vs 'unsure' inputs...", prefix: '$' },
  ];

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        const res = await generateDecisionSupport(role, skills, context);
        setDecision(res);
        // Notify parent that decision is ready
        if (onDecisionReady) {
          onDecisionReady(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecision();
  }, [role, skills, context, onDecisionReady]);

  // Rotate through analysis steps while loading
  useEffect(() => {
    if (!loading) return;
    
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        const next = prev + 1;
        return next >= verdictSteps.length ? prev : next;
      });
    }, 2000);

    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timeInterval);
    };
  }, [loading, verdictSteps.length]);
=======
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
>>>>>>> main

  if (loading) {
    const activeProgress = 60 + (elapsedTime % 4) * 10;
    
    return (
<<<<<<< HEAD
      <StepLayout title="" subtitle="">
        <AnalysisProgressDisplay
          title="Verdict Engine"
          subtitle="Preparing your decision support..."
          steps={verdictSteps}
          currentStepIndex={analysisStep}
          activeStepProgress={activeProgress}
          consoleTitle="STRATEGIC REASONING CONSOLE"
          consoleLogs={verdictConsoleLogs}
          activeStatus="CALCULATING"
        />
      </StepLayout>
=======
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
>>>>>>> main
    );
  }

  const confidenceColors = {
    'Low': 'bg-red-50 text-red-700 border-red-200',
    'Medium': 'bg-orange-50 text-orange-700 border-orange-200',
    'High': 'bg-green-50 text-green-700 border-green-200',
  };

  const handleCopySummary = async () => {
    if (!decision) return;
    const lines: string[] = [];
    lines.push(`Role: ${role.name}`);
    lines.push(`From: ${context.origin}`);
    lines.push(`Confidence: ${decision.confidenceLevel}`);
    lines.push('');
    lines.push(`Main uncertainty: ${decision.mainUncertainty}`);
    lines.push('');
    if (decision.signals.length || highSkills.length) {
      lines.push('Signals in favor:');
      decision.signals.forEach(s => lines.push(`- ${s}`));
      highSkills.forEach(s => lines.push(`- ${s.skill} (verified skill)`));
      lines.push('');
    }
    if (decision.risks.length || gapSkills.length) {
      lines.push('Open risks / gaps:');
      decision.risks.forEach(r => lines.push(`- ${r}`));
      gapSkills.forEach(s => lines.push(`- ${s.skill} (gap)`));
      lines.push('');
    }
    if (decision.suggestedNextSteps && decision.suggestedNextSteps.length) {
      lines.push('Suggested next steps:');
      decision.suggestedNextSteps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    }

    const summary = lines.join('\n');
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = summary;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed', err);
          alert('Failed to copy. Please select and copy manually.');
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy summary', err);
      alert('Failed to copy. Please select and copy manually.');
    }
  };

  const signalsCount = (decision?.signals.length || 0) + highSkills.length;
  const risksCount = (decision?.risks.length || 0) + gapSkills.length;
  const totalItems = signalsCount + risksCount;
  const signalsPercent = totalItems > 0 ? (signalsCount / totalItems) * 100 : 0;
  const risksPercent = totalItems > 0 ? (risksCount / totalItems) * 100 : 0;

  const confidenceLevel = decision?.confidenceLevel || 'Medium';
  const confidenceValue = confidenceLevel === 'High' ? 75 : confidenceLevel === 'Medium' ? 50 : 25;

  return (
    <StepLayout 
      title="Signals & open questions"
      subtitle=""
    >
      <div className="space-y-6">
        {/* Visual Summary - Role & Confidence */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg">
                <i className="fas fa-briefcase text-2xl"></i>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 mb-1">{role.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>{context.origin}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Confidence Visual Gauge */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Confidence Level</span>
              <span className={`text-lg font-bold ${
                confidenceLevel === 'High' ? 'text-green-600' :
                confidenceLevel === 'Medium' ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {confidenceValue}%
              </span>
            </div>
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2 ${
                  confidenceLevel === 'High' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  confidenceLevel === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${confidenceValue}%` }}
              >
                {confidenceValue >= 20 && (
                  <i className={`fas ${
                    confidenceLevel === 'High' ? 'fa-check-circle' :
                    confidenceLevel === 'Medium' ? 'fa-circle-half-stroke' :
                    'fa-exclamation-circle'
                  } text-white text-xs`}></i>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Visual Balance - Signals vs Risks with Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Signals Visual */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md">
                  <i className="fas fa-arrow-trend-up text-xl"></i>
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-widest text-green-700">Signals</div>
                  <div className="text-xs text-gray-500">{signalsCount} items</div>
                </div>
              </div>
            </div>
            <div className="relative h-4 bg-green-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${signalsPercent}%` }}
              ></div>
            </div>
            {/* Show first 3, expand to show all */}
            <div className="space-y-2">
              {(() => {
                const signalsList: { text: string; isSkill: boolean }[] = [
                  ...(decision?.signals || []).map(s => ({ text: s, isSkill: false })),
                  ...highSkills.map(s => ({ text: s.skill, isSkill: true })),
                ];
                const toShow = expandedSignals ? signalsList : signalsList.slice(0, 3);
                return (
                  <>
                    {toShow.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-white p-2 rounded-lg border border-green-100">
                        <i className={`fas ${item.isSkill ? 'fa-star' : 'fa-check-circle'} text-green-500 mt-0.5 flex-shrink-0`}></i>
                        <span className="flex-1 min-w-0 break-words">{item.text}</span>
                      </div>
                    ))}
                    {signalsList.length > 3 && (
                      <button
                        onClick={() => setExpandedSignals(!expandedSignals)}
                        className="text-xs text-green-600 hover:text-green-800 font-medium w-full text-center pt-1"
                      >
                        {expandedSignals ? '− Show less' : `+${signalsList.length - 3} more`}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Risks Visual */}
          <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md">
                  <i className="fas fa-shield-halved text-xl"></i>
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-widest text-red-700">Risks</div>
                  <div className="text-xs text-gray-500">{risksCount} items</div>
                </div>
              </div>
            </div>
            <div className="relative h-4 bg-red-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${risksPercent}%` }}
              ></div>
            </div>
            {/* Show first 3, expand to show all */}
            <div className="space-y-2">
              {(() => {
                const risksList: { text: string; isGap: boolean }[] = [
                  ...(decision?.risks || []).map(r => ({ text: r, isGap: false })),
                  ...gapSkills.map(s => ({ text: s.skill, isGap: true })),
                ];
                const toShow = expandedRisks ? risksList : risksList.slice(0, 3);
                return (
                  <>
                    {toShow.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-white p-2 rounded-lg border border-red-100">
                        <i className={`fas ${item.isGap ? 'fa-circle-minus' : 'fa-exclamation-triangle'} text-red-500 mt-0.5 flex-shrink-0`}></i>
                        <span className="flex-1 min-w-0 break-words">{item.text}</span>
                      </div>
                    ))}
                    {risksList.length > 3 && (
                      <button
                        onClick={() => setExpandedRisks(!expandedRisks)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium w-full text-center pt-1"
                      >
                        {expandedRisks ? '− Show less' : `+${risksList.length - 3} more`}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Main Question - Visual Card */}
        {decision?.mainUncertainty && (
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 shadow-sm p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                <i className="fas fa-circle-question"></i>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">Key Question</div>
                <p className="text-sm text-gray-800 leading-relaxed">{decision.mainUncertainty}</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps - Visual Timeline */}
        {decision?.suggestedNextSteps && decision.suggestedNextSteps.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-list-check text-indigo-500 text-lg"></i>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">Next Steps</span>
            </div>
            <div className="relative">
              {/* Timeline connector line */}
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-300 via-violet-300 to-purple-300 hidden md:block"></div>
              <div className="space-y-4">
                {decision.suggestedNextSteps.map((step, i) => {
                  const stepConfigs = [
                    { icon: 'fa-comments', bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', label: 'text-indigo-600' },
                    { icon: 'fa-book-open', bg: 'bg-gradient-to-br from-violet-500 to-violet-600', label: 'text-violet-600' },
                    { icon: 'fa-hands-helping', bg: 'bg-gradient-to-br from-purple-500 to-purple-600', label: 'text-purple-600' },
                    { icon: 'fa-magnifying-glass', bg: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600', label: 'text-fuchsia-600' },
                  ];
                  const cfg = stepConfigs[i % stepConfigs.length];
                  return (
                    <div key={i} className="relative flex items-start gap-4 group">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${cfg.bg} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <i className={`fas ${cfg.icon} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold ${cfg.label}`}>Step {i + 1}</span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed break-words">{step}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* What would you like to do next? */}
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What would you like to do next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={onResume}
              className="flex items-start gap-4 p-5 bg-white rounded-2xl border-2 border-indigo-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                <i className="fas fa-file-pen text-xl"></i>
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1">Generate pivot-ready resume draft</div>
                <div className="text-sm text-gray-500">Reframes your origin story for {role.name}.</div>
              </div>
            </button>
            <button
              onClick={() => onExit?.('unsure')}
              className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-400 text-white flex items-center justify-center flex-shrink-0">
                <i className="fas fa-pause text-xl"></i>
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1">Pause and reflect</div>
                <div className="text-sm text-gray-500">Save progress and come back with a clear mind.</div>
=======
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
>>>>>>> main
              </div>
            </button>
          </div>

<<<<<<< HEAD
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onBackToValidation}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to validation
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onReset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Start over
              </button>
              <button
                onClick={handleCopySummary}
                disabled={!decision || copied}
                className={`px-6 py-3 rounded-full border text-sm font-semibold transition-colors flex items-center ${
                  copied
                    ? 'border-green-300 bg-green-50 text-green-700 cursor-default'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {copied ? (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Copied!
                  </>
                ) : (
                  <>
                    <i className="fas fa-copy mr-2"></i>
                    Copy summary
                  </>
                )}
              </button>
<button
                onClick={() => onExit?.('not_for_me')}
                className="px-6 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-black transition-colors"
              >
                Mark as not a priority
              </button>
            </div>
=======
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
>>>>>>> main
          </div>
        </div>
      </div>
    </StepLayout>
  );
};
