
import React, { useState } from 'react';
import { UserContext, AIPreview } from '../types';
import { generateAIUnderstanding } from '../geminiService';
import { StepLayout } from './StepLayout';

interface BuilderPageProps {
  onNext: (context: UserContext, preview: AIPreview) => void;
}

export const BuilderPage: React.FC<BuilderPageProps> = ({ onNext }) => {
  const [context, setContext] = useState<UserContext>({
    origin: '',
    considering: [],
    frictionPoints: [],
    frictionText: '',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<AIPreview | null>(null);

  const origins = [
    'Content / Media / Communications',
    'Marketing / Growth',
    'Operations / Project coordination',
    'Engineering / Technical role',
    'Consulting / Business role',
    'Mixed background',
    'Others'
  ];

  const directions = [
    'Product operations / Product roles',
    'Digital marketing / Growth',
    'Data / Analytics',
    'Strategy / BizOps',
    'Others',
    'Still exploring / not sure yet'
  ];

  const frictionOptions = [
    "I've done meaningful work, but job descriptions seem to value something else",
    "I'm not sure which parts of my experience still count",
    "I worry recruiters might see me as 'not a fit'",
    "It feels like I'm starting over — but I'm not sure if that's true",
    "None of these quite capture it"
  ];

  const handleToggleConsidering = (val: string) => {
    setContext(prev => ({
      ...prev,
      considering: prev.considering.includes(val) 
        ? prev.considering.filter(i => i !== val) 
        : [...prev.considering.slice(-2), val] // Max 3
    }));
  };

  const handleToggleFriction = (val: string) => {
    setContext(prev => ({
      ...prev,
      frictionPoints: prev.frictionPoints.includes(val)
        ? prev.frictionPoints.filter(i => i !== val)
        : [...prev.frictionPoints.slice(-2), val]
    }));
  };

  const handleGeneratePreview = async () => {
    if (!context.origin) return;
    setLoading(true);
    try {
      const res = await generateAIUnderstanding(context);
      setPreview(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepLayout 
      title="You're not starting over. You're transitioning."
      subtitle="You don't need a polished story yet. We'll start with what's clear — and question the rest together."
    >
      <div className="space-y-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <section>
          <h2 className="text-xl font-semibold mb-4">1. What are you transitioning from?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {origins.map(opt => (
              <button
                key={opt}
                onClick={() => setContext({ ...context, origin: opt })}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  context.origin === opt 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. What roles are you considering moving into?</h2>
          <p className="text-sm text-gray-500 mb-4">(It’s okay if you’re still exploring. Select up to 3.)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {directions.map(opt => (
              <button
                key={opt}
                onClick={() => handleToggleConsidering(opt)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  context.considering.includes(opt)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Which part of your experience feels hardest to explain or reuse?</h2>
          <p className="text-sm text-gray-500 mb-4">(Select what resonates most)</p>
          <div className="space-y-3">
            {frictionOptions.map(opt => (
              <button
                key={opt}
                onClick={() => handleToggleFriction(opt)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  context.frictionPoints.includes(opt)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                {opt}
              </button>
            ))}
            {(context.frictionPoints.includes("None of these quite capture it") || context.frictionText) && (
              <textarea
                placeholder="If you want to add a thought in your own words (optional)..."
                className="w-full mt-2 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                rows={3}
                value={context.frictionText}
                onChange={(e) => setContext({...context, frictionText: e.target.value})}
              />
            )}
          </div>
        </section>

        <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
          <button
            onClick={handleGeneratePreview}
            disabled={loading || !context.origin || context.considering.length === 0}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-md"
          >
            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            Analyze my context
          </button>

          {preview && (
            <div className="w-full bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-brain text-indigo-500 mr-2"></i>
                Here’s how your transition looks so far
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider flex items-center">
                    <i className="fas fa-check-circle mr-2"></i> What's Clear
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {preview.clear.map((item, i) => <li key={i} className="flex items-start"><span className="mr-2">•</span>{item}</li>)}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider flex items-center">
                    <i className="fas fa-lightbulb mr-2"></i> Transferable Skills
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {preview.assumptions.map((item, i) => <li key={i} className="flex items-start"><span className="mr-2">•</span>{item}</li>)}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-orange-700 uppercase tracking-wider flex items-center">
                    <i className="fas fa-question-circle mr-2"></i> Still Unclear
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {preview.unclear.map((item, i) => <li key={i} className="flex items-start"><span className="mr-2">•</span>{item}</li>)}
                  </ul>
                </div>
              </div>
              
              <p className="mt-6 text-xs text-gray-400 italic">
                These are starting assumptions — you’ll be able to correct or refine them later.
              </p>
            </div>
          )}
        </div>

        {preview && (
          <div className="pt-8 flex flex-col items-center border-t border-gray-100">
            <button
              onClick={() => onNext(context, preview)}
              className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all transform hover:scale-105 shadow-xl"
            >
              Let’s stress-test this transition
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
            <p className="mt-3 text-sm text-gray-500">No decisions yet — just exploration.</p>
          </div>
        )}
      </div>
    </StepLayout>
  );
};
