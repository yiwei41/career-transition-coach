
import React, { useState } from 'react';
import { RoleCard, SkillMapping, UserExperienceInput } from '../types';
import { StepLayout } from './StepLayout';

interface ResumeFormPageProps {
  role: RoleCard;
  skills: SkillMapping[];
  onNext: (input: UserExperienceInput) => void;
  onBack: () => void;
}

export const ResumeFormPage: React.FC<ResumeFormPageProps> = ({ role, skills, onNext, onBack }) => {
  const [formData, setFormData] = useState<UserExperienceInput>({
    rawExperience: '',
    contactEmail: '',
    linkedIn: ''
  });

  const highConfidenceSkills = skills.filter(s => s.confidence === 'high');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <StepLayout 
      title="Paste your current experience"
      subtitle={`We'll use your existing bullet points to build a bridge narrative for a ${role.name} role.`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">
                Resume Content / Experience
              </label>
              <textarea 
                required
                value={formData.rawExperience}
                onChange={e => setFormData({...formData, rawExperience: e.target.value})}
                placeholder="Paste your current resume bullet points, work history, and key achievements here. Don't worry about formatting..."
                className="w-full p-6 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 min-h-[400px] outline-none transition-all font-mono text-sm bg-gray-50/30"
              />
              <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
                <i className="fas fa-info-circle mt-0.5"></i>
                <p>The more specific data you provide (metrics, tool names, outcomes), the better our AI can reframe it for your target role.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row gap-4">
               <div className="flex-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contact Email (Optional)</label>
                 <input 
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                  placeholder="hello@example.com"
                  className="w-full p-3 rounded-lg border border-gray-100 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                 />
               </div>
               <div className="flex-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">LinkedIn URL (Optional)</label>
                 <input 
                  type="text"
                  value={formData.linkedIn}
                  onChange={e => setFormData({...formData, linkedIn: e.target.value})}
                  placeholder="linkedin.com/in/username"
                  className="w-full p-3 rounded-lg border border-gray-100 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                 />
               </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button 
                type="button"
                onClick={onBack}
                className="px-6 py-2 text-gray-500 font-bold hover:text-gray-900 transition-colors"
              >
                Back
              </button>
              <button 
                type="submit"
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 group"
              >
                Generate Bridge Narrative
                <i className="fas fa-magic transition-transform group-hover:rotate-12"></i>
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Focus Points</h4>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              We'll focus on these validated strengths when reframing your history:
            </p>
            <div className="space-y-2">
              {highConfidenceSkills.map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-xs font-bold">
                  <i className="fas fa-check-circle text-indigo-400"></i>
                  {s.skill}
                </div>
              ))}
              {highConfidenceSkills.length === 0 && (
                <p className="text-xs text-indigo-300 italic">No high-confidence skills selected yet.</p>
              )}
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Reframe Strategy</h4>
            <div className="space-y-3">
               <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                 <p className="text-xs text-gray-600">Extracting outcomes from your tasks.</p>
               </div>
               <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                 <p className="text-xs text-gray-600">Translating specialized jargon to <strong>{role.name}</strong> terminology.</p>
               </div>
               <div className="flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                 <p className="text-xs text-gray-600">Weighting bullet points by relevance.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};
