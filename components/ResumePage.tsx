
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard, SkillMapping, ResumeDraft, UserExperienceInput } from '../types';
import { generateResumeDraft } from '../geminiService';
import { StepLayout } from './StepLayout';

interface ResumePageProps {
  role: RoleCard;
  skills: SkillMapping[];
  context: UserContext;
  personalInfo?: UserExperienceInput;
  cachedResume: ResumeDraft | undefined;
  onResumeFetched: (r: ResumeDraft) => void;
  onBack: () => void;
}

export const ResumePage: React.FC<ResumePageProps> = ({ role, skills, context, personalInfo, cachedResume, onResumeFetched, onBack }) => {
  const [resume, setResume] = useState<ResumeDraft | null>(cachedResume || null);
  const [loading, setLoading] = useState(!cachedResume);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!cachedResume) {
      const fetchResume = async () => {
        try {
          const res = await generateResumeDraft(role, skills, context, personalInfo);
          setResume(res);
          onResumeFetched(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchResume();
    }
  }, [role, skills, context, personalInfo, cachedResume, onResumeFetched]);

  const handleCopy = () => {
    if (!resume) return;
    const text = `
Professional Summary:
${resume.summary}

Suggested Skills:
${resume.suggestedSkills.join(', ')}

Experience Reframing Tips:
${resume.pivotPoints.map(p => `- Instead of: "${p.original}"\n  Try: "${p.reframed}"`).join('\n')}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <i className="fas fa-file-signature text-4xl text-indigo-500 absolute inset-0 flex items-center justify-center"></i>
            <div className="absolute inset-0 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-900 font-black uppercase tracking-widest text-xs mb-2">Synthesizing Narrative</p>
          <p className="text-gray-500 text-sm italic">Reframing your specific experience for the {role.name} ecosystem...</p>
        </div>
      </div>
    );
  }

  return (
    <StepLayout 
      title="Resume Pivot Narrative"
      subtitle="Don't just list what you did—explain why it matters for what you'll do next."
    >
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="text-sm text-indigo-900/60 font-medium">
            <i className="fas fa-info-circle mr-2"></i> This draft incorporates your specific projects and achievements.
          </div>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg border border-indigo-200 font-bold text-sm hover:shadow-sm transition-all"
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            {copied ? 'Copied!' : 'Copy text'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-h-[800px] flex flex-col">
          <div className="p-12 space-y-10 flex-grow">
            
            <header className="border-b border-gray-100 pb-8 text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Your Name</h2>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm">{role.name} Aspirant</p>
              {personalInfo?.contactEmail && (
                <div className="mt-2 text-xs text-gray-400 flex justify-center gap-4">
                  <span>{personalInfo.contactEmail}</span>
                  {personalInfo.linkedIn && <span>{personalInfo.linkedIn}</span>}
                </div>
              )}
            </header>

            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Professional Summary</h3>
              <p className="text-gray-800 leading-relaxed italic border-l-4 border-indigo-100 pl-6 text-lg">
                "{resume?.summary}"
              </p>
            </section>

            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Transferable Strengths</h3>
              <div className="flex flex-wrap gap-2">
                {resume?.suggestedSkills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-50 text-gray-700 rounded-md border border-gray-200 text-sm font-medium italic">
                    {s}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Reframing Examples</h3>
              <p className="text-sm text-gray-500 mb-6">Replace generic task descriptions with these high-impact bridges:</p>
              
              <div className="space-y-6">
                {resume?.pivotPoints.map((p, i) => (
                  <div key={i} className="group relative bg-indigo-50/30 p-6 rounded-xl border border-indigo-100/50">
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Before: (Generic Evidence)</span>
                      <p className="text-sm text-gray-500 line-through decoration-red-300 opacity-60 italic">"{p.original}"</p>
                    </div>
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">After: (Optimized for ${role.name})</span>
                      <p className="text-base font-bold text-gray-900">"{p.reframed}"</p>
                    </div>
                    <div className="pt-3 border-t border-indigo-100 flex items-start gap-2">
                      <i className="fas fa-info-circle text-indigo-400 mt-0.5"></i>
                      <p className="text-xs text-indigo-600 font-medium">Strategy: {p.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3">Coach's Guidance</h3>
              <p className="text-sm leading-relaxed opacity-90">{resume?.experienceGuidance}</p>
            </section>

          </div>
        </div>

        <div className="flex items-center justify-between pt-8">
          <button 
            onClick={onBack}
            className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Update your evidence
          </button>
          <button 
            onClick={() => window.print()}
            className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-lg"
          >
            <i className="fas fa-print mr-2"></i> Print Guide
          </button>
        </div>
      </div>
    </StepLayout>
  );
};
