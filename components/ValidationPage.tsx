
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard, SkillMapping, AIPreview } from '../types';
import { generateSkillMapping } from '../geminiService';
import { StepLayout } from './StepLayout';
import { AnalysisProgressDisplay } from './AnalysisProgressDisplay';

interface ValidationPageProps {
  role: RoleCard;
  context: UserContext;
  preview: AIPreview;
  onNext: (skills: SkillMapping[]) => void;
  onBack: () => void;
}

export const ValidationPage: React.FC<ValidationPageProps> = ({ role, context, preview, onNext, onBack }) => {
  const [skills, setSkills] = useState<SkillMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [filter, setFilter] = useState<'all' | 'high' | 'unsure' | 'gap'>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const validationSteps = [
    { id: 'deconstruct', label: 'DECONSTRUCTING ROLE', progress: 20 },
    { id: 'scan', label: 'SCANNING BACKGROUND', progress: 40 },
    { id: 'standardize', label: 'STANDARDIZING CONTEXT', progress: 60 },
    { id: 'gap', label: 'GAP IDENTIFICATION', progress: 80 },
    { id: 'bridge', label: 'FINALIZING BRIDGE', progress: 95 },
  ];

  const validationConsoleLogs = [
    { text: 'NEURAL BRIDGE CONNECTION: ESTABLISHED' },
    { text: 'success: context_sync_complete', highlight: true },
    { text: `MAPPING SKILLS FOR: ${role.name}` },
    { text: 'CROSS-REFERENCING BACKGROUND ASSUMPTIONS...' },
    { text: 'FINALIZING VALIDATION MATRIX...' },
  ];

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await generateSkillMapping(role, context);
        setSkills(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [role, context]);

  useEffect(() => {
    if (!loading) return;
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        const next = prev + 1;
        return next >= validationSteps.length ? prev : next;
      });
    }, 1800);
    return () => clearInterval(stepInterval);
  }, [loading, validationSteps.length]);

  const updateConfidence = (index: number, confidence: 'high' | 'unsure' | 'gap') => {
    setSkills(prev => prev.map((s, i) => i === index ? { ...s, confidence } : s));
  };

  const toggleExpanded = (index: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (loading) {
    const activeProgress = 50 + (analysisStep % 3) * 20;
    return (
      <StepLayout title="" subtitle="">
        <AnalysisProgressDisplay
          title="Analysis Engine Active"
          subtitle="Preparing your validation dashboard..."
          steps={validationSteps}
          currentStepIndex={analysisStep}
          activeStepProgress={activeProgress}
          consoleTitle="NEURAL BRIDGE CONNECTION"
          consoleLogs={validationConsoleLogs}
          activeStatus="PROCESSING"
        />
      </StepLayout>
    );
  }

  const counts = skills.reduce(
    (acc, s) => {
      acc[s.confidence] += 1;
      return acc;
    },
    { high: 0, unsure: 0, gap: 0 } as Record<'high' | 'unsure' | 'gap', number>
  );

  const filteredSkills = skills
    .map((s, idx) => ({ s, idx }))
    .filter(({ s }) => (filter === 'all' ? true : s.confidence === filter));

  const truncate = (text: string, max = 88) => (text.length > max ? `${text.slice(0, max)}…` : text);

  return (
    <StepLayout 
      title="Mark confidence"
      subtitle="Default is “Unsure”. That’s normal."
    >
      <div className="space-y-8">
        {/* Compact context + reassurance (secondary) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <i className="fas fa-sign-out-alt mr-1.5"></i>{context.origin}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <i className="fas fa-briefcase mr-1.5"></i>{role.name}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Mark uncertainty first; “Unsure” is the default.
          </div>
        </div>

        {/* Legend + filters (visual scanning) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                All <span className="opacity-70">({skills.length})</span>
              </button>
              <button
                onClick={() => setFilter('unsure')}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  filter === 'unsure' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
                title="Uncertainty is normal"
              >
                <i className="fas fa-question-circle mr-2"></i>Unsure <span className="opacity-80">({counts.unsure})</span>
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  filter === 'high' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-check-circle mr-2"></i>Confident <span className="opacity-80">({counts.high})</span>
              </button>
              <button
                onClick={() => setFilter('gap')}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  filter === 'gap' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-circle-minus mr-2"></i>Gap <span className="opacity-80">({counts.gap})</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><i className="fas fa-check-circle text-green-600"></i>Confident</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-question-circle text-indigo-600"></i>Unsure</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-circle-minus text-red-600"></i>Gap</span>
            </div>
          </div>
        </div>

        {/* Skill cards (no table) */}
        <div className="space-y-4">
          {filteredSkills.map(({ s, idx }) => {
            const isOpen = expanded.has(idx);
            const confidenceStyles =
              s.confidence === 'high'
                ? 'bg-green-50 border-green-200'
                : s.confidence === 'gap'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-indigo-50 border-indigo-200';

            return (
              <div key={idx} className={`rounded-2xl border p-5 bg-white shadow-sm ${confidenceStyles}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-puzzle-piece"></i>
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-black text-gray-900">{s.skill}</div>
                        <div className="mt-1 text-sm text-gray-700">
                          <span className="font-bold text-gray-500">Why:</span>{' '}
                          {isOpen ? s.whyItMatters : truncate(s.whyItMatters)}
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          <span className="font-bold text-gray-500">Assumed from:</span>{' '}
                          <span className="italic">{isOpen ? s.assumedBackground : truncate(s.assumedBackground)}</span>
                        </div>
                        <button
                          onClick={() => toggleExpanded(idx)}
                          className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800"
                        >
                          {isOpen ? 'Hide details' : 'Show details'} <i className={`fas ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} ml-2`}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Confidence control (primary micro-action) */}
                  <div className="flex md:flex-col gap-2 md:items-end">
                    <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
                      <button
                        onClick={() => updateConfidence(idx, 'unsure')}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                          s.confidence === 'unsure' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title="Unsure (default / normal)"
                      >
                        <i className="fas fa-question-circle mr-2"></i>Unsure
                      </button>
                      <button
                        onClick={() => updateConfidence(idx, 'high')}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                          s.confidence === 'high' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title="Confident"
                      >
                        <i className="fas fa-check-circle mr-2"></i>Confident
                      </button>
                      <button
                        onClick={() => updateConfidence(idx, 'gap')}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                          s.confidence === 'gap' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title="Gap"
                      >
                        <i className="fas fa-circle-minus mr-2"></i>Gap
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 md:text-right">
                      Mark what you know.<br />Leave the rest “Unsure”.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSkills.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10">
              Nothing here for this filter.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-8">
          <button 
            onClick={onBack}
            className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to options
          </button>
          <button 
            onClick={() => onNext(skills)}
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
