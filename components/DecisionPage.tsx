
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard, SkillMapping, DecisionSupport } from '../types';
import { generateDecisionSupport } from '../geminiService';
import { StepLayout } from './StepLayout';

interface DecisionPageProps {
  role: RoleCard;
  skills: SkillMapping[];
  context: UserContext;
  onReset: () => void;
}

export const DecisionPage: React.FC<DecisionPageProps> = ({ role, skills, context, onReset }) => {
  const [decision, setDecision] = useState<DecisionSupport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        const res = await generateDecisionSupport(role, skills, context);
        setDecision(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecision();
  }, [role, skills, context]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-chart-line fa-spin text-4xl text-indigo-500 mb-4"></i>
          <p className="text-gray-600 font-medium">Synthesizing risks and signals for your next step...</p>
        </div>
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
            <button className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-search"></i>
              </div>
              <div>
                <span className="block font-bold text-gray-900">Stress-test with real job postings</span>
                <span className="text-xs text-gray-500">Map your assumptions against live requirements.</span>
              </div>
            </button>
            <button className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-shuffle"></i>
              </div>
              <div>
                <span className="block font-bold text-gray-900">Explore a neighboring role</span>
                <span className="text-xs text-gray-500">Compare this with similar paths.</span>
              </div>
            </button>
            <button className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-bullseye"></i>
              </div>
              <div>
                <span className="block font-bold text-gray-900">Identify 1–2 gaps worth validating</span>
                <span className="text-xs text-gray-500">Focus your energy on clearing specific hurdles.</span>
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

        <div className="flex flex-col items-center pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400 mb-6 italic max-w-lg">
            If this still doesn’t feel right, that’s okay. You can step back, switch roles, or revisit assumptions anytime.
          </p>
          <div className="flex gap-4">
            <button onClick={onReset} className="px-6 py-2 text-gray-500 hover:text-gray-900 font-bold">Start over</button>
            <button onClick={onReset} className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all">Mark as not a priority</button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};
