import React, { useEffect, useState, useRef } from 'react';
import { UserContext, RoleCard, SkillMapping, ResumeDraft, UserExperienceInput } from '../types';
import { generateResumeDraft, refineResumeWithFeedback } from '../geminiService';
import { StepLayout } from './StepLayout';
import { AnalysisProgressDisplay } from './AnalysisProgressDisplay';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ResumePageProps {
  role: RoleCard;
  skills: SkillMapping[];
  context: UserContext;
  personalInfo?: UserExperienceInput;
  cachedResume: ResumeDraft | undefined;
  onResumeFetched: (r: ResumeDraft) => void;
  onBack: () => void;
}

export const ResumePage: React.FC<ResumePageProps> = ({
  role,
  skills,
  context,
  personalInfo,
  cachedResume,
  onResumeFetched,
  onBack,
}) => {
  const [resume, setResume] = useState<ResumeDraft | null>(cachedResume || null);
  const [loading, setLoading] = useState(!cachedResume);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const resumeSteps = [
    { id: 'parse', label: 'EXPERIENCE PARSING', progress: 25 },
    { id: 'extract', label: 'KEY ACHIEVEMENT EXTRACTION', progress: 50 },
    { id: 'align', label: 'ROLE ALIGNMENT', progress: 75 },
    { id: 'narrative', label: 'BRIDGE NARRATIVE GENERATION', progress: 95 },
  ];

  const resumeConsoleLogs = [
    { text: 'RESUME ENGINE: INITIALIZED' },
    { text: `PARSING EXPERIENCE FOR: ${role.name}`, highlight: true },
    { text: `ORIGIN: ${context.origin}` },
    { text: `EXTRACTING OUTCOMES & METRICS...` },
    { text: 'MAPPING SKILLS TO TARGET ROLE...' },
    { text: 'GENERATING REFRAMED BULLET POINTS...' },
    { text: 'SYNTHESIZING PROFESSIONAL SUMMARY...' },
  ];
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchResume = async () => {
    if (!personalInfo?.rawExperience?.trim()) {
      setError('Please add your resume or experience first.');
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    setAnalysisStep(0);
    try {
      const res = await generateResumeDraft(role, skills, context, personalInfo);
      setResume(res);
      onResumeFetched(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate resume. Please try again.');
      setResume(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cachedResume) {
      fetchResume();
    }
  }, [role.id, cachedResume]);

  useEffect(() => {
    if (!loading) return;
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        const next = prev + 1;
        return next >= resumeSteps.length ? prev : next;
      });
    }, 1200);
    return () => clearInterval(stepInterval);
  }, [loading]);

  const handleCopy = async () => {
    if (!resume) return;

    const bullets = (resume.experienceBullets || []).length > 0
      ? resume.experienceBullets
      : resume.pivotPoints?.map((p) => p.reframed) || [];

    const text = `
${personalInfo?.fullName || 'Your Name'}
${role.name} | ${personalInfo?.contactEmail || ''} ${personalInfo?.linkedIn || ''}

PROFESSIONAL SUMMARY
${resume.summary}

KEY EXPERIENCE & ACHIEVEMENTS
${bullets.map((b) => `• ${b}`).join('\n')}

SKILLS
${(resume.suggestedSkills || []).join(', ')}
    `.trim();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
      alert('Copy failed — please select and copy manually.');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg || !resume || chatLoading) return;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const updated = await refineResumeWithFeedback(resume, msg, role);
      setResume(updated);
      onResumeFetched(updated);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I've updated your resume based on your feedback. Check the content below." },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err instanceof Error ? err.message : 'Failed to apply changes. Please try again.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    const activeProgress = 40 + (analysisStep % 4) * 20;
    return (
      <StepLayout title="" subtitle="">
        <AnalysisProgressDisplay
          title="RESUME ENGINE"
          subtitle={`Customizing your experience for ${role.name}...`}
          steps={resumeSteps}
          currentStepIndex={analysisStep}
          activeStepProgress={activeProgress}
          consoleTitle="RESUME PROCESSING LAYER"
          consoleLogs={resumeConsoleLogs}
          activeStatus="PROCESSING"
        />
      </StepLayout>
    );
  }

  if (error) {
    const isQuota = error.toLowerCase().includes('quota') || error.includes('429');
    return (
      <StepLayout title="Resume Generation" subtitle="We'll create a customized resume for your target role.">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="p-6 bg-red-50 border border-red-100 rounded-xl">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
            <p className="text-red-700 font-medium">{error}</p>
            {isQuota && (
              <p className="text-red-600/80 text-sm mt-3">
                Free tier quota resets periodically. Wait 1–2 minutes, then click Try again.
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={onBack} className="px-6 py-3 text-gray-600 font-bold hover:text-gray-900 transition-colors">
              <i className="fas fa-arrow-left mr-2"></i> Update experience
            </button>
            <button
              onClick={fetchResume}
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all"
            >
              <i className="fas fa-redo mr-2"></i> Try again
            </button>
          </div>
        </div>
      </StepLayout>
    );
  }

  const displayName = personalInfo?.fullName?.trim() || 'Your Name';
  const bullets = (resume?.experienceBullets || []).length > 0
    ? resume.experienceBullets
    : resume?.pivotPoints?.map((p) => p.reframed) || [];

  const guidanceBullets = resume?.experienceGuidance
    ? resume.experienceGuidance
        .split(/(?<=[.!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 15)
        .slice(0, 3)
    : [];

  return (
    <StepLayout
      title="Your Customized Resume"
      subtitle={`Generated from your experience, tailored for a ${role.name} role.`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-sm text-indigo-900/80 font-medium">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            Customized from your uploaded resume and experience.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchResume}
              className="px-3 py-2 text-indigo-600 text-sm font-bold hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <i className="fas fa-sync-alt mr-1"></i> Regenerate
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg border border-indigo-200 font-bold text-sm hover:shadow-sm transition-all"
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden print:shadow-none">
          <div className="p-10 md:p-12 space-y-8">
            <header className="border-b border-gray-200 pb-6">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {displayName}
              </h1>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mt-1">
                {role.name}
              </p>
              {(personalInfo?.contactEmail || personalInfo?.linkedIn) && (
                <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-4">
                  {personalInfo.contactEmail && <span>{personalInfo.contactEmail}</span>}
                  {personalInfo.linkedIn && <span>{personalInfo.linkedIn}</span>}
                </div>
              )}
            </header>

            {resume?.summary && (
              <section>
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Professional Summary
                </h2>
                <p className="text-gray-800 leading-relaxed">{resume.summary}</p>
              </section>
            )}

            {bullets.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  Key Experience & Achievements
                </h2>
                <ul className="space-y-2">
                  {bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-2 text-gray-800 leading-relaxed">
                      <span className="text-indigo-500 font-bold shrink-0">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {resume?.suggestedSkills && resume.suggestedSkills.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  Skills
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {resume.suggestedSkills.map((s, i) => {
                    const pct = 65 + (i % 3) * 12;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 truncate" title={s}>
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {resume?.pivotPoints && resume.pivotPoints.length > 0 && (
              <section className="pt-6 border-t border-gray-100">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <i className="fas fa-arrows-alt-h text-indigo-400"></i>
                  Reframing
                </h2>
                <div className="space-y-4">
                  {resume.pivotPoints.map((p, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0 w-12">Before</span>
                        <p className="text-xs text-gray-600 line-through leading-relaxed flex-1 min-w-0">
                          {p.original}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-400 my-1">
                        <i className="fas fa-arrow-down text-xs"></i>
                      </div>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0 w-12">After</span>
                        <p className="text-xs font-medium text-gray-900 leading-relaxed flex-1 min-w-0">
                          {p.reframed}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedWhy(expandedWhy === i ? null : i);
                        }}
                        className="text-xs text-indigo-600 font-medium hover:text-indigo-700 hover:underline cursor-pointer select-none mt-1 inline-flex items-center gap-1"
                      >
                        <i className={`fas fa-chevron-${expandedWhy === i ? 'up' : 'down'} text-[10px]`}></i>
                        {expandedWhy === i ? 'Hide why' : 'Why'}
                      </button>
                      {expandedWhy === i && (
                        <p className="text-xs text-indigo-600 mt-2 pl-4 border-l-2 border-indigo-200">{p.why}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {guidanceBullets.length > 0 && (
              <section className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i>
                  Coach Tips
                </h2>
                <div className="space-y-2">
                  {guidanceBullets.map((tip, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-700 leading-snug">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden print:hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <i className="fas fa-comments text-indigo-500"></i>
              Ask for adjustments
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              e.g. &quot;Make the summary shorter&quot;, &quot;Add more emphasis on data analysis&quot;
            </p>
          </div>
          <div className="max-h-48 overflow-y-auto p-4 space-y-3 min-h-[80px]">
            {chatMessages.length === 0 && (
              <p className="text-sm text-gray-400 italic">Type your feedback below to refine the resume.</p>
            )}
            {chatMessages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Updating resume...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe the changes you want..."
                disabled={chatLoading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-6">
          <button onClick={onBack} className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Update experience
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-lg"
          >
            <i className="fas fa-print mr-2"></i> Print
          </button>
        </div>
      </div>
    </StepLayout>
  );
};
