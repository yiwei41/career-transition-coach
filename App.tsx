
import React, { useEffect, useMemo, useState } from 'react';
import {
  Page,
  UserContext,
  AIPreview,
  RoleCard,
  SkillMapping,
  User,
  DecisionSupport,
  ResumeDraft,
  UserExperienceInput,
  HistoryRecord,
} from './types';

import { BuilderPage } from './components/BuilderPage';
import { ExplorationPage } from './components/ExplorationPage';
import { ValidationPage } from './components/ValidationPage';
import { DecisionPage } from './components/DecisionPage';
import { ResumeFormPage } from './components/ResumeFormPage';
import { ResumePage } from './components/ResumePage';
import { ExitPage } from './components/ExitPage';
import { HistoryPage } from './components/HistoryPage';
import { SettingsSidebar } from './components/SettingsSidebar';
import { UserMenu } from './components/UserMenu';

import { saveHistoryRecord, getHistoryRecords, initGuestId } from './historyService';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  // ===== Auth (user or guest) =====
  const [user, setUser] = useState<User | null>(() => {
    const saved =
      localStorage.getItem('ctc_google_user') ||
      localStorage.getItem('coach_user'); // fallback
    return saved ? JSON.parse(saved) : null;
  });

  const isGuest = localStorage.getItem('ctc_auth_method') === 'guest';

  // If neither user nor guest, send to /auth (since index.tsx controls routing)
  useEffect(() => {
    if (!user && !isGuest) {
      window.location.href = '/auth';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('coach_user', JSON.stringify(loggedInUser));

    // Save/update user in Supabase (best-effort)
    try {
      const { error } = await supabase
        .from('bgcc_users')
        .upsert(
          {
            email: loggedInUser.email,
            name: loggedInUser.name,
            avatar: loggedInUser.avatar,
            last_login: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );

      if (error) console.error('Error saving user to Supabase:', error);
    } catch (err) {
      console.error('Supabase error:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('coach_user');
    localStorage.removeItem('ctc_auth_method');
    localStorage.removeItem('ctc_google_id_token');
    localStorage.removeItem('ctc_google_user');
    window.location.href = '/auth';
  };

  // ===== Navigation / UI =====
  const [currentPage, setCurrentPage] = useState<Page>('builder');
  const [showSettings, setShowSettings] = useState(false);

  // ===== Core context =====
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [aiPreview, setAiPreview] = useState<AIPreview | null>(null);

  // ===== Exploration cache =====
  const [cachedRoles, setCachedRoles] = useState<RoleCard[] | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleCard | null>(null);

  // ===== Validation cache (keyed by role.id) =====
  const [cachedSkillsMap, setCachedSkillsMap] = useState<Record<string, SkillMapping[]>>({});

  // ===== Resume form input =====
  const [userExperienceInput, setUserExperienceInput] = useState<UserExperienceInput | undefined>(undefined);

  // ===== Decision & Resume cache (keyed by role.id) =====
  const [cachedDecisionMap, setCachedDecisionMap] = useState<Record<string, DecisionSupport>>({});
  const [cachedResumeMap, setCachedResumeMap] = useState<Record<string, ResumeDraft>>({});

  const [exitType, setExitType] = useState<'not_for_me' | 'unsure' | null>(null);

  // Derived skills for current role (avoid missing validatedSkills state)
  const validatedSkills = useMemo(() => {
    if (!selectedRole) return [];
    return cachedSkillsMap[selectedRole.id] || [];
  }, [cachedSkillsMap, selectedRole]);

  // ===== History init =====
  useEffect(() => {
    initGuestId();
    const fromAuth = sessionStorage.getItem('ctc_from_auth') === 'true';
    if (fromAuth) {
      sessionStorage.removeItem('ctc_from_auth');
      const history = getHistoryRecords();
      if (history.length > 0) setCurrentPage('history');
    }
  }, []);

  // ===== Handlers =====
  const handleBuilderComplete = (context: UserContext, preview: AIPreview) => {
    setUserContext(context);
    setAiPreview(preview);
    setCachedRoles(null);
    setCachedSkillsMap({});
    setCachedDecisionMap({});
    setCachedResumeMap({});
    setSelectedRole(null);
    setUserExperienceInput(undefined);
    setExitType(null);
    setCurrentPage('exploration');
  };

  const handleRoleSelect = (role: RoleCard) => {
    setSelectedRole(role);
    setCurrentPage('validation');
  };

  const handleValidationUpdate = (roleId: string, skills: SkillMapping[]) => {
    setCachedSkillsMap((prev) => ({ ...prev, [roleId]: skills }));
  };

  const handleDecisionFetched = (roleId: string, decision: DecisionSupport) => {
    setCachedDecisionMap((prev) => ({ ...prev, [roleId]: decision }));
  };

  const handleResumeFormSubmit = (input: UserExperienceInput) => {
    setUserExperienceInput(input);
    if (selectedRole) {
      setCachedResumeMap((prev) => {
        const next = { ...prev };
        delete next[selectedRole.id];
        return next;
      });
    }
    setCurrentPage('resume');
  };

  const handleResumeFetched = (roleId: string, resume: ResumeDraft) => {
    setCachedResumeMap((prev) => ({ ...prev, [roleId]: resume }));
  };

  const handleDecisionReady = (decision: DecisionSupport) => {
    if (selectedRole && userContext && validatedSkills.length > 0) {
      const record: HistoryRecord = {
        id: `record_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
        role: selectedRole,
        context: userContext,
        skills: validatedSkills,
        decision,
        completed: true,
      };
      saveHistoryRecord(record);
    }
  };

  const handleExit = (type: 'not_for_me' | 'unsure') => {
    setExitType(type);

    if (selectedRole && userContext && validatedSkills.length > 0) {
      const record: HistoryRecord = {
        id: `record_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
        role: selectedRole,
        context: userContext,
        skills: validatedSkills,
        completed: false,
      };
      saveHistoryRecord(record);
    }

    setCurrentPage('exit');
  };

  const handleReset = () => {
    setUserContext(null);
    setAiPreview(null);
    setCachedRoles(null);
    setSelectedRole(null);
    setCachedSkillsMap({});
    setCachedDecisionMap({});
    setCachedResumeMap({});
    setUserExperienceInput(undefined);
    setExitType(null);
    setCurrentPage('builder');
  };

  const handleSelectHistoryRecord = (record: HistoryRecord) => {
    setUserContext(record.context);
    setSelectedRole(record.role);
    setCachedSkillsMap((prev) => ({ ...prev, [record.role.id]: record.skills }));
    if (record.decision) setCachedDecisionMap((prev) => ({ ...prev, [record.role.id]: record.decision! }));
    setCurrentPage('decision');
  };

  // ===== Steps UI (treat decision/resume as one "Action" step) =====
  const steps: { keys: Page[]; label: string }[] = [
    { keys: ['builder'], label: 'Context' },
    { keys: ['exploration'], label: 'Explore' },
    { keys: ['validation'], label: 'Validate' },
    { keys: ['decision', 'resume-form', 'resume'], label: 'Action' },
  ];

  const stepIndex = steps.findIndex((s) => s.keys.includes(currentPage));
  const progressPercent = stepIndex >= 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-route"></i>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Coach.ai</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
            {steps.map((s, i) => (
              <span
                key={s.label}
                className={s.keys.includes(currentPage) ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : ''}
              >
                {i + 1}. {s.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-500 hidden lg:block">
              {user ? user.name : isGuest ? 'Guest' : ''}
            </div>

            <UserMenu
              onHistoryClick={() => setCurrentPage('history')}
              onSettingsClick={() => setShowSettings(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </nav>

      <main className="pt-20 pb-20">
        {currentPage === 'builder' && <BuilderPage onNext={handleBuilderComplete} />}

        {currentPage === 'exploration' && userContext && (
          <ExplorationPage
            context={userContext}
            cachedRoles={cachedRoles}
            onRolesFetched={setCachedRoles}
            onSelectRole={handleRoleSelect}
            onExit={handleExit}
            onBack={() => setCurrentPage('builder')}
          />
        )}

        {currentPage === 'validation' && selectedRole && userContext && aiPreview && (
          <ValidationPage
            role={selectedRole}
            context={userContext}
            preview={aiPreview}
            cachedSkills={cachedSkillsMap[selectedRole.id]}
            onSkillsUpdate={(skills) => handleValidationUpdate(selectedRole.id, skills)}
            onNext={() => setCurrentPage('decision')}
            onBack={() => setCurrentPage('exploration')}
          />
        )}

        {currentPage === 'decision' && selectedRole && userContext && validatedSkills.length > 0 && (
          <DecisionPage
            role={selectedRole}
            skills={validatedSkills}
            context={userContext}
            cachedDecision={cachedDecisionMap[selectedRole.id]}
            onDecisionFetched={(d) => handleDecisionFetched(selectedRole.id, d)}
            onDecisionReady={handleDecisionReady}
            onNavigateToResume={() => setCurrentPage('resume-form')}
            onReset={handleReset}
            onBack={() => setCurrentPage('validation')}
            onExit={handleExit}
          />
        )}

        {currentPage === 'resume-form' && selectedRole && validatedSkills.length > 0 && (
          <ResumeFormPage
            role={selectedRole}
            skills={validatedSkills}
            onNext={handleResumeFormSubmit}
            onBack={() => setCurrentPage('decision')}
          />
        )}

        {currentPage === 'resume' && selectedRole && userContext && validatedSkills.length > 0 && (
          <ResumePage
            role={selectedRole}
            skills={validatedSkills}
            context={userContext}
            personalInfo={userExperienceInput}
            cachedResume={cachedResumeMap[selectedRole.id]}
            onResumeFetched={(r) => handleResumeFetched(selectedRole.id, r)}
            onBack={() => setCurrentPage('resume-form')}
            onReset={handleReset}
          />
        )}

        {currentPage === 'exit' && exitType && <ExitPage type={exitType} onReset={handleReset} />}

        {currentPage === 'history' && (
          <HistoryPage onSelectRecord={handleSelectHistoryRecord} onBack={() => setCurrentPage('builder')} />
        )}
      </main>

      <SettingsSidebar isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 mb-2 font-medium uppercase tracking-widest">Principles</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-gray-500 font-bold uppercase">
            <span>Make uncertainty visible</span>
            <span>Test assumptions, not people</span>
            <span>Allow exit without penalty</span>
            <span>Transparency over Authority</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
