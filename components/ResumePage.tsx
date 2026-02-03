import React, { useState, useRef } from 'react';
import { RoleCard, UserContext, SkillMapping } from '../types';
import { StepLayout } from './StepLayout';
import { extractTextFromFile } from '../fileExtract';
import { generateResumeReframe } from '../geminiService';
import { AnalysisProgressDisplay } from './AnalysisProgressDisplay';

interface ResumePageProps {
  role: RoleCard;
  context: UserContext;
  skills: SkillMapping[];
  onBack: () => void;
  onReset: () => void;
}

const MAX_FILE_SIZE_MB = 10;

export const ResumePage: React.FC<ResumePageProps> = ({ role, context, skills, onBack, onReset }) => {
  const [resumeText, setResumeText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reframedResult, setReframedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const highSkills = skills.filter(s => s.confidence === 'high').map(s => s.skill);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
      setUploadedFileName(file.name);
      setReframedResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract text from file.');
    }
    e.target.value = '';
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
    setUploadedFileName(null);
    setReframedResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    const trimmed = resumeText.trim();
    if (!trimmed) {
      setError('Please paste your resume content or upload a file.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateResumeReframe(role, context, trimmed, highSkills);
      setReframedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate reframed resume.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    const steps = [
      { id: 'extract', label: 'EXTRACTING OUTCOMES', progress: 25 },
      { id: 'translate', label: 'TRANSLATING TERMINOLOGY', progress: 50 },
      { id: 'weight', label: 'WEIGHTING BULLET POINTS', progress: 75 },
      { id: 'finalize', label: 'FINALIZING DRAFT', progress: 95 },
    ];
    return (
      <StepLayout title="" subtitle="">
        <AnalysisProgressDisplay
          title="Resume Reframe"
          subtitle={`Building a bridge narrative for ${role.name}...`}
          steps={steps}
          currentStepIndex={2}
          activeStepProgress={70}
          consoleTitle="REFRAME ENGINE"
          consoleLogs={[
            { text: `PARSING ORIGIN: ${context.origin}`, highlight: true },
            { text: `TARGET ROLE: ${role.name}` },
            { text: 'EXTRACTING OUTCOMES FROM TASKS...' },
            { text: 'TRANSLATING TO ROLE-SPECIFIC TERMINOLOGY...' },
          ]}
          activeStatus="PROCESSING"
        />
      </StepLayout>
    );
  }

  return (
    <StepLayout
      title="Paste your current experience"
      subtitle={`We'll use your existing bullet points to build a bridge narrative for a ${role.name} role.`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Resume input */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Resume content / experience
              </h3>
              <textarea
                value={resumeText}
                onChange={handleTextChange}
                placeholder="Paste your current resume bullet points, work history, and key achievements here. Don't worry about formatting—we'll reframe them for your target role."
                className="w-full h-64 p-4 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                disabled={loading}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-file-upload"></i>
                  Upload PDF, Word, or TXT
                </button>
                {uploadedFileName && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <i className="fas fa-check-circle text-green-500"></i>
                    {uploadedFileName}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-400 flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5 flex-shrink-0"></i>
                The more specific data you provide (metrics, tool names, outcomes), the better our reframe will be.
              </p>
              {error && (
                <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Right: Focus points & strategy */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-3">
                Focus points
              </h3>
              <p className="text-sm text-indigo-100 mb-3">
                We'll focus on these validated strengths when reframing your history:
              </p>
              {highSkills.length > 0 ? (
                <ul className="space-y-2">
                  {highSkills.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <i className="fas fa-check mt-0.5 flex-shrink-0"></i>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-indigo-200 italic">No high-confidence skills selected yet.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
                Reframe strategy
              </h3>
              <ol className="space-y-3">
                {[
                  'Extracting outcomes from your tasks.',
                  `Translating specialized jargon to ${role.name} terminology.`,
                  'Weighting bullet points by relevance.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Reframed result */}
        {reframedResult && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">
              Reframed resume draft
            </h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed bg-gray-50 p-4 rounded-xl overflow-x-auto">
              {reframedResult}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(reframedResult);
              }}
              className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <i className="fas fa-copy mr-2"></i>
              Copy to clipboard
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to decision
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Start over
            </button>
            <button
              onClick={handleGenerate}
              disabled={!resumeText.trim()}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Generate reframed draft
            </button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};
