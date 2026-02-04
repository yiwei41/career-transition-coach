
import React, { useState, useRef } from 'react';
import { RoleCard, SkillMapping, UserExperienceInput } from '../types';
import { StepLayout } from './StepLayout';
import { extractTextFromFile } from '../fileExtract';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.txt';
const ACCEPTED_EXT = ['pdf', 'doc', 'docx', 'txt'];

const emptyForm: UserExperienceInput = {
  rawExperience: '',
  fullName: '',
  contactEmail: '',
  linkedIn: ''
};

interface ResumeFormPageProps {
  role: RoleCard;
  skills: SkillMapping[];
  initialData?: UserExperienceInput;
  onNext: (input: UserExperienceInput) => void;
  onBack: () => void;
}

export const ResumeFormPage: React.FC<ResumeFormPageProps> = ({ role, skills, initialData, onNext, onBack }) => {
  const hasExistingContent = !!(initialData?.rawExperience?.trim());
  const [mode, setMode] = useState<'choice' | 'edit' | 'fresh'>(
    hasExistingContent ? 'choice' : 'edit'
  );
  const [formData, setFormData] = useState<UserExperienceInput>(() =>
    hasExistingContent ? { ...emptyForm, ...initialData } : emptyForm
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const highConfidenceSkills = skills.filter(s => s.confidence === 'high');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) {
      setUploadError('Please upload PDF, Word (.doc/.docx), or TXT format');
      return;
    }
    setUploadError(null);
    setUploading(true);
    setUploadedFileName(null);
    try {
      const text = await extractTextFromFile(file);
      setFormData(prev => ({ ...prev, rawExperience: text }));
      setUploadedFileName(file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) {
      setUploadError('Please upload PDF, Word (.doc/.docx), or TXT format');
      return;
    }
    const input = fileInputRef.current;
    if (input) {
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const showForm = mode !== 'choice';

  return (
    <StepLayout 
      title="Paste your current experience"
      subtitle={`We'll use your existing bullet points to build a bridge narrative for a ${role.name} role.`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {mode === 'choice' && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">
                You have previously submitted content
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Choose how you'd like to continue:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...emptyForm, ...initialData });
                    setMode('edit');
                  }}
                  className="flex-1 p-6 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 hover:border-indigo-300 transition-all text-left group"
                >
                  <i className="fas fa-edit text-indigo-600 text-xl mb-2 block"></i>
                  <span className="font-bold text-gray-900 block mb-1">Edit existing content</span>
                  <span className="text-xs text-gray-600">
                    View and modify your previously uploaded resume content
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(emptyForm);
                    setUploadedFileName(null);
                    setMode('fresh');
                  }}
                  className="flex-1 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
                >
                  <i className="fas fa-plus-circle text-gray-400 text-xl mb-2 block"></i>
                  <span className="font-bold text-gray-900 block mb-1">Start fresh</span>
                  <span className="text-xs text-gray-600">
                    Clear everything and upload or paste new content
                  </span>
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button type="button" onClick={onBack} className="text-sm text-gray-500 font-bold hover:text-gray-900">
                  ← Back
                </button>
              </div>
            </div>
          )}

          {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">
                Resume Content / Experience
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="mb-4 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-gray-500"
              >
                {uploading ? (
                  <span className="flex items-center gap-2 text-indigo-600">
                    <i className="fas fa-spinner fa-spin"></i>
                    Parsing file…
                  </span>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-2xl text-indigo-400"></i>
                    <span className="text-sm font-medium">
                      Click or drag to upload resume (PDF, Word, TXT)
                    </span>
                    {uploadedFileName && (
                      <span className="text-xs text-green-600">
                        <i className="fas fa-check-circle mr-1"></i>
                        Imported: {uploadedFileName}
                      </span>
                    )}
                  </>
                )}
              </div>
              {uploadError && (
                <p className="mb-3 text-sm text-red-500">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {uploadError}
                </p>
              )}

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

            <div className="pt-6 border-t border-gray-50 space-y-4">
               <div>
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name (for resume header)</label>
                 <input 
                  type="text"
                  value={formData.fullName || ''}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  placeholder="e.g. Jane Smith"
                  className="w-full p-3 rounded-lg border border-gray-100 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                 />
               </div>
               <div className="flex flex-col md:flex-row gap-4">
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
            </div>

            <div className="pt-4 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={onBack}
                  className="px-6 py-2 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                >
                  Back
                </button>
                {mode === 'edit' && hasExistingContent && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(emptyForm);
                      setUploadedFileName(null);
                      setMode('fresh');
                    }}
                    className="text-sm text-gray-500 hover:text-indigo-600 font-medium"
                  >
                    Start fresh instead
                  </button>
                )}
              </div>
              <button 
                type="submit"
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 group"
              >
                Generate Customized Resume
                <i className="fas fa-magic transition-transform group-hover:rotate-12"></i>
              </button>
            </div>
          </form>
          )}
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
