
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

export const ValidationPage: React.FC<ValidationPageProps> = ({
  role,
  context,
  preview, // 目前未使用，但保留 props 以兼容其他调用处
  cachedSkills,
  onSkillsUpdate,
  onNext,
  onBack,
}) => {
  const [skills, setSkills] = useState<SkillMapping[]>(cachedSkills || []);
  const [loading, setLoading] = useState(!cachedSkills);
  const [activeStep, setActiveStep] = useState(0);

  const [filter, setFilter] = useState<'all' | 'high' | 'unsure' | 'gap'>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    let stepInterval: number | undefined;

    if (loading) {
      stepInterval = window.setInterval(() => {
        setActiveStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    }

    if (!cachedSkills) {
      const fetchSkills = async () => {
        try {
          const res = await generateSkillMapping(role, context);
          // 给 loading 动画一点展示时间（可删）
          await new Promise((resolve) => setTimeout(resolve, 1200));
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
    } else {
      // cachedSkills 存在时，确保 loading 关掉
      setLoading(false);
      if (stepInterval) clearInterval(stepInterval);
    }

    return () => {
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [role, context, cachedSkills, onSkillsUpdate, loading]);

  const updateConfidence = (index: number, confidence: 'high' | 'unsure' | 'gap') => {
    const updated = skills.map((s, i) => (i === index ? { ...s, confidence } : s));
    setSkills(updated);
    onSkillsUpdate(updated);
  };

  const toggleExpanded = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-50 text-primary-600 mb-6 relative overflow-hidden">
              <i className={`fas ${ANALYSIS_STEPS[activeStep].icon} text-3xl z-10 animate-bounce`}></i>
              <div className="absolute inset-0 bg-primary-100/50 animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Analysis Engine Active</h2>
            <p className="text-gray-500 italic">{ANALYSIS_STEPS[activeStep].description}</p>
          </div>

          <div className="space-y-6">
            {ANALYSIS_STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  idx === activeStep ? 'scale-100 opacity-100' : idx < activeStep ? 'opacity-50 scale-95' : 'opacity-20 scale-90'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    idx <= activeStep ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-300'
                  }`}
                >
                  {idx < activeStep ? <i className="fas fa-check text-xs"></i> : <span className="text-xs font-bold">{step.id}</span>}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-bold uppercase tracking-widest ${idx === activeStep ? 'text-primary-600' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                    {idx === activeStep && (
                      <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded font-black animate-pulse">PROCESSING</span>
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-primary-600 transition-all duration-1000 ease-out ${
                        idx === activeStep ? 'w-1/2' : idx < activeStep ? 'w-full' : 'w-0'
                      }`}
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
              <div className="text-[10px] font-mono text-primary-400/60 space-y-1 animate-[slideUp_10s_linear_infinite]">
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
    <StepLayout title="Mark confidence" subtitle="Default is “Unsure”. That’s normal.">
      <div className="space-y-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <i className="fas fa-sign-out-alt mr-1.5"></i>
              {context.origin}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              <i className="fas fa-briefcase mr-1.5"></i>
              {role.name}
            </span>
          </div>
          <div className="text-xs text-gray-400">Mark uncertainty first; “Unsure” is the default.</div>
        </div>

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
                  filter === 'unsure'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-question-circle mr-2"></i>Unsure <span className="opacity-80">({counts.unsure})</span>
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  filter === 'high'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
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
              <span className="flex items-center gap-1.5">
                <i className="fas fa-check-circle text-green-600"></i>Confident
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fas fa-question-circle text-primary-600"></i>Unsure
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fas fa-circle-minus text-red-600"></i>Gap
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSkills.map(({ s, idx }) => {
            const isOpen = expanded.has(idx);
            const confidenceStyles =
              s.confidence === 'high' ? 'bg-green-50 border-green-200' : s.confidence === 'gap' ? 'bg-red-50 border-red-200' : 'bg-primary-50 border-primary-200';

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
                          <span className="font-bold text-gray-500">Why:</span> {isOpen ? s.whyItMatters : truncate(s.whyItMatters)}
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          <span className="font-bold text-gray-500">Assumed from:</span>{' '}
                          <span className="italic">{isOpen ? s.assumedBackground : truncate(s.assumedBackground)}</span>
                        </div>
                        <button
                          onClick={() => toggleExpanded(idx)}
                          className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800"
                        >
                          {isOpen ? 'Hide details' : 'Show details'}{' '}
                          <i className={`fas ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} ml-2`}></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 md:items-end">
                    <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
                      <button
                        onClick={() => updateConfidence(idx, 'unsure')}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                          s.confidence === 'unsure' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <i className="fas fa-question-circle mr-2"></i>Unsure
                      </button>
                      <button
                        onClick={() => updateConfidence(idx, 'high')}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                          s.confidence === 'high' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <i className="fas fa-check-circle mr-2"></i>Confident
                      </button>
                      <button
                        onClick={() => updateConfidence(idx, 'gap')}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                          s.confidence === 'gap' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <i className="fas fa-circle-minus mr-2"></i>Gap
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 md:text-right">
                      Mark what you know.
                      <br />
                      Leave the rest “Unsure”.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSkills.length === 0 && <div className="text-center text-sm text-gray-500 py-10">Nothing here for this filter.</div>}
        </div>

        <div className="flex items-center justify-between pt-8">
          <button onClick={onBack} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Back to options
          </button>
          <button
            onClick={onNext}
            className="px-8 py-4 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
          >
            Continue to decision support
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </StepLayout>
  );
};
