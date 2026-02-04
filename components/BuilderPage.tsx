
import React, { useEffect, useRef, useState } from 'react';
import { UserContext, AIPreview } from '../types';
import { generateAIUnderstanding } from '../geminiService';
import { StepLayout } from './StepLayout';
import { QuickScanCharts } from './QuickScanCharts';
import { AnalysisProgressDisplay } from './AnalysisProgressDisplay';

interface BuilderPageProps {
  onNext: (context: UserContext, preview: AIPreview) => void;
}

export const BuilderPage: React.FC<BuilderPageProps> = ({ onNext }) => {
  type BuilderStep = 'origin' | 'target_roles' | 'friction' | 'preview';

  const [step, setStep] = useState<BuilderStep>('origin');
  const [context, setContext] = useState<UserContext>({
    origin: '',
    considering: [],
    frictionPoints: [],
    frictionText: '',
  });

  const [customOrigin, setCustomOrigin] = useState('');
  const [cluster, setCluster] = useState<'product' | 'data' | 'business'>('product');

  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AIPreview | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const contextSteps = [
    { id: 'parse', label: 'CONTEXT PARSING', progress: 25 },
    { id: 'distill', label: 'CLARITY DISTILLATION', progress: 50 },
    { id: 'assumption', label: 'ASSUMPTION EXTRACTION', progress: 75 },
    { id: 'preview', label: 'QUICK SCAN GENERATION', progress: 95 },
  ];

  const contextConsoleLogs = [
    { text: 'CONTEXT ENGINE: INITIALIZED' },
    { text: `PARSING ORIGIN: ${context.origin || '...'}`, highlight: true },
    { text: `EXTRACTING CONSIDERATIONS: ${context.considering.join(', ') || '...'}` },
    { text: 'IDENTIFYING CLEAR vs UNCLEAR DIMENSIONS...' },
    { text: 'GENERATING QUICK SCAN PREVIEW...' },
  ];

  const origins: { id: string; label: string; icon: string }[] = [
    { id: 'Content', label: 'Content', icon: 'fa-pen-nib' },
    { id: 'Marketing', label: 'Marketing', icon: 'fa-bullhorn' },
    { id: 'Operations', label: 'Operations', icon: 'fa-gears' },
    { id: 'Data', label: 'Data', icon: 'fa-chart-line' },
    { id: 'Business', label: 'Business', icon: 'fa-briefcase' },
    { id: 'Mixed', label: 'Mixed / Other', icon: 'fa-layer-group' },
  ];

  const roleClusters: Record<'product' | 'data' | 'business', { label: string; icon: string; roles: string[] }> = {
    product: {
      label: 'Product-ish',
      icon: 'fa-cubes',
      roles: ['Product Ops', 'Product', 'Program / Project', 'UX / Research'],
    },
    data: {
      label: 'Data-ish',
      icon: 'fa-chart-pie',
      roles: ['Data / Analytics', 'Ops Analytics', 'RevOps / Sales Ops', 'Data Science'],
    },
    business: {
      label: 'Business-ish',
      icon: 'fa-compass',
      roles: ['Strategy / BizOps', 'Operations', 'Customer / Partnerships', 'Consulting-ish'],
    },
  };

  const frictionCards: { id: string; label: string; icon: string }[] = [
    { id: 'Value mismatch', label: 'Value mismatch', icon: 'fa-scale-balanced' },
    { id: 'What still counts', label: 'Not sure what still counts', icon: 'fa-layer-group' },
    { id: 'Fear of not fitting', label: 'Fear of not fitting', icon: 'fa-user-xmark' },
    { id: 'Feels like starting over', label: 'Feels like starting over', icon: 'fa-rotate-left' },
    { id: 'Not sure yet', label: 'Not sure yet', icon: 'fa-question' },
  ];

  const selectedFriction = context.frictionPoints[0] || '';

  const handleToggleConsidering = (val: string) => {
    setContext((prev) => ({
      ...prev,
      considering: prev.considering.includes(val)
        ? prev.considering.filter((i) => i !== val)
        : prev.considering.length >= 3
          ? [...prev.considering.slice(1), val] // Max 3 (drop oldest)
          : [...prev.considering, val],
    }));
  };

  const handleSelectFriction = (val: string) => {
    setContext((prev) => ({
      ...prev,
      frictionPoints: val ? [val] : [],
    }));
  };

  const getFinalContext = (): UserContext => {
    const finalOrigin =
      context.origin === 'Mixed' && customOrigin.trim() ? customOrigin.trim() : context.origin;

    return {
      ...context,
      origin: finalOrigin,
    };
  };

  const handleGeneratePreview = async () => {
    setError(null);

    const finalContext = getFinalContext();
    if (!finalContext.origin || finalContext.considering.length === 0) {
      setError('Please complete the previous steps: select your background and at least one target role.');
      return;
    }
    if (!finalContext.frictionPoints[0]) {
      setError('Please select your biggest friction point above.');
      return;
    }

    setLoading(true);
    setAnalysisStep(0);
    try {
      const res = await generateAIUnderstanding(finalContext);
      setPreview(res);
      setStep('preview');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } catch (err) {
      console.error(err);
      let msg = 'Analysis failed. Please try again.';

      let errStr = '';
      if (err instanceof Error) errStr = err.message;
      else if (err && typeof err === 'object') {
        const o = err as Record<string, unknown>;
        errStr = [o.message, o.error, o.details, o.statusMessage]
          .filter(Boolean)
          .map((x) => (typeof x === 'string' ? x : JSON.stringify(x)))
          .join(' ');
      } else errStr = String(err ?? '');

      if (/429|quota|RESOURCE_EXHAUSTED|limit.*0|exceeded/i.test(errStr)) {
        msg = 'API 配额已用尽，请稍后再试';
      } else if (/401|API key|invalid|unauthorized/i.test(errStr)) {
        msg = 'Invalid API key. Check GEMINI_API_KEY in .env.local';
      } else if (/model|not found|404/i.test(errStr)) {
        msg = 'Model unavailable. The API may have changed.';
      } else if (errStr && errStr.length < 200) {
        msg = errStr;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) return;
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        const next = prev + 1;
        return next >= contextSteps.length ? prev : next;
      });
    }, 1200);
    return () => clearInterval(stepInterval);
  }, [loading]);

  if (loading) {
    const activeProgress = 40 + (analysisStep % 4) * 20;
    return (
      <StepLayout title="" subtitle="">
        <AnalysisProgressDisplay
          title="CONTEXT ENGINE"
          subtitle="Generating your quick scan..."
          steps={contextSteps}
          currentStepIndex={analysisStep}
          activeStepProgress={activeProgress}
          consoleTitle="CONTEXT PROCESSING LAYER"
          consoleLogs={contextConsoleLogs}
          activeStatus="PROCESSING"
        />
      </StepLayout>
    );
  }

  return (
    <StepLayout
      title={
        step === 'origin'
          ? 'Your background'
          : step === 'target_roles'
            ? 'Target roles'
            : step === 'friction'
              ? 'Biggest friction'
              : 'Quick scan'
      }
      subtitle={
        step === 'origin'
          ? 'Pick one. Keep it simple.'
          : step === 'target_roles'
            ? 'Pick up to 3. You can change later.'
            : step === 'friction'
              ? 'Pick one. Optional: add your words.'
              : 'We’ll label what’s clear and what’s uncertain.'
      }
    >
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* ORIGIN */}
        {step === 'origin' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {origins.map((opt) => {
                const selected = context.origin === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setContext((prev) => ({ ...prev, origin: opt.id }));
                      if (opt.id !== 'Mixed') setCustomOrigin('');
                    }}
                    className={[
                      'rounded-2xl border p-4 text-left transition-all',
                      'hover:border-indigo-300 hover:bg-indigo-50/40',
                      selected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <i className={`fas ${opt.icon}`}></i>
                      </div>
                      <div className={`font-bold ${selected ? 'text-indigo-700' : 'text-gray-900'}`}>{opt.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {context.origin === 'Mixed' && (
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Tell us more (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Design + Engineering, Sales + Marketing..."
                  className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  value={customOrigin}
                  onChange={(e) => setCustomOrigin(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-400">Describe your background in a few words</p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => {
                  const finalOrigin =
                    context.origin === 'Mixed' && customOrigin.trim() ? customOrigin.trim() : context.origin;
                  setContext((prev) => ({ ...prev, origin: finalOrigin }));
                  setStep('target_roles');
                }}
                disabled={!context.origin}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Next <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {/* TARGET ROLES */}
        {step === 'target_roles' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-sm text-gray-500">
                Selected: <span className="font-bold text-gray-900">{context.considering.length}</span>/3
              </div>
              <div className="flex gap-2">
                {(['product', 'data', 'business'] as const).map((k) => {
                  const selected = cluster === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setCluster(k)}
                      className={[
                        'px-4 py-2 rounded-full text-sm font-bold border transition-all',
                        selected
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <i className={`fas ${roleClusters[k].icon} mr-2`}></i>
                      {roleClusters[k].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleClusters[cluster].roles.map((role) => {
                const selected = context.considering.includes(role);
                return (
                  <button
                    key={role}
                    onClick={() => handleToggleConsidering(role)}
                    className={[
                      'rounded-2xl border p-4 text-left transition-all',
                      'hover:border-indigo-300 hover:bg-indigo-50/40',
                      selected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className={`font-bold ${selected ? 'text-indigo-700' : 'text-gray-900'}`}>{role}</div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <i className={`fas ${selected ? 'fa-check' : 'fa-plus'}`}></i>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => setStep('origin')} className="px-5 py-2 text-gray-600 hover:text-gray-900 font-bold">
                <i className="fas fa-arrow-left mr-2"></i> Back
              </button>
              <button
                onClick={() => setStep('friction')}
                disabled={context.considering.length === 0}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Next <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {/* FRICTION */}
        {step === 'friction' && (
          <div className="space-y-8" ref={resultsRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frictionCards.map((card) => {
                const selected = selectedFriction === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectFriction(card.id)}
                    className={[
                      'rounded-2xl border p-4 text-left transition-all',
                      'hover:border-indigo-300 hover:bg-indigo-50/40',
                      selected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <i className={`fas ${card.icon}`}></i>
                      </div>
                      <div className={`font-bold ${selected ? 'text-indigo-700' : 'text-gray-900'}`}>{card.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Optional note</label>
              <textarea
                placeholder="Add a quick detail (optional)…"
                className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                rows={3}
                value={context.frictionText}
                onChange={(e) => setContext((prev) => ({ ...prev, frictionText: e.target.value }))}
              />
              <p className="mt-2 text-xs text-gray-400">Short is fine. We’ll refine later.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0"></i>
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700" aria-label="Dismiss">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => setStep('target_roles')} className="px-5 py-2 text-gray-600 hover:text-gray-900 font-bold">
                <i className="fas fa-arrow-left mr-2"></i> Back
              </button>
              <button
                onClick={handleGeneratePreview}
                disabled={loading || !context.origin || context.considering.length === 0 || !selectedFriction}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <i className="fas fa-wand-magic-sparkles mr-2"></i>
                Analyze
              </button>
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {step === 'preview' && preview && (
          <div className="space-y-8">
            <QuickScanCharts preview={preview} />

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => setStep('friction')} className="px-5 py-2 text-gray-600 hover:text-gray-900 font-bold">
                <i className="fas fa-arrow-left mr-2"></i> Back
              </button>
              <button
                onClick={() => onNext(getFinalContext(), preview)}
                className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-xl"
              >
                Continue <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">Reassurance: you can change any selection later.</p>
          </div>
        )}
      </div>
    </StepLayout>
  );
};
