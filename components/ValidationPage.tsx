
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard, SkillMapping, AIPreview } from '../types';
import { generateSkillMapping } from '../geminiService';
import { StepLayout } from './StepLayout';

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

  const updateConfidence = (index: number, confidence: 'high' | 'unsure' | 'gap') => {
    setSkills(prev => prev.map((s, i) => i === index ? { ...s, confidence } : s));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-vial fa-spin text-4xl text-indigo-500 mb-4"></i>
          <p className="text-gray-600 font-medium">Deconstructing skills and mapping assumptions...</p>
        </div>
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
