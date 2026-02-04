
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

import { IntroPage } from './components/IntroPage';
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
import { useLanguage } from './LanguageContext';

const EMPTY_SKILLS: SkillMapping[] = [];

const App: React.FC = () => {
  const { t } = useLanguage();
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
      if (history.length > 0) {
        setCurrentPage('history');
      } else {
        setCurrentPage('intro');
      }
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

  const handleRoleSelect = useCallback((role: RoleCard) => {
    setSelectedRole(role);
    setCurrentPage('validation');
  }, []);

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

  const handleExit = useCallback(
    (type: 'not_for_me' | 'unsure') => {
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
    },
    [selectedRole, userContext, validatedSkills]
  );

  const onBackToBuilder = useCallback(() => setCurrentPage('builder'), []);

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

  // ===== Steps UI =====
  const steps: { keys: Page[]; label: string }[] = [
    { keys: ['intro'], label: t.app.intro },
    { keys: ['builder'], label: t.app.context },
    { keys: ['exploration'], label: t.app.explore },
    { keys: ['validation'], label: t.app.validate },
    { keys: ['decision'], label: t.app.action },
    { keys: ['resume-form', 'resume'], label: t.app.resume },
  ];

  const stepIndex = steps.findIndex((s) => s.keys.includes(currentPage));
  const progressPercent = stepIndex >= 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;

  const handleStepClick = (step: (typeof steps)[number]) => {
    if (step.keys.includes('intro')) {
      setCurrentPage('intro');
      return;
    }
    if (step.keys.includes('builder')) {
      setCurrentPage('builder');
      return;
    }
    if (step.keys.includes('exploration')) {
      if (userContext) setCurrentPage('exploration');
      return;
    }
    if (step.keys.includes('validation')) {
      if (selectedRole && userContext) setCurrentPage('validation');
      return;
    }
    if (step.keys.includes('decision')) {
      if (selectedRole && validatedSkills.length > 0) setCurrentPage('decision');
      return;
    }
    if (step.keys.includes('resume-form') || step.keys.includes('resume')) {
      if (selectedRole && validatedSkills.length > 0) {
        setCurrentPage(userExperienceInput ? 'resume' : 'resume-form');
      }
    }
  };

  const canNavigateToStep = (step: (typeof steps)[number]): boolean => {
    if (step.keys.includes('intro')) return true;
    if (step.keys.includes('builder')) return true;
    if (step.keys.includes('exploration')) return !!userContext;
    if (step.keys.includes('validation')) return !!selectedRole && !!userContext;
    if (step.keys.includes('decision')) return !!selectedRole && validatedSkills.length > 0;
    if (step.keys.includes('resume-form') || step.keys.includes('resume')) {
      return !!selectedRole && validatedSkills.length > 0;
    }
    return false;
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 bg-white/95 border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-route"></i>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Coach.ai</span>
          </div>

          <div className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-bold uppercase tracking-widest">
            {steps.map((s, i) => {
              const isActive = s.keys.includes(currentPage);
              const canGo = canNavigateToStep(s);
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleStepClick(s)}
                  disabled={!canGo}
                  className={`py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded ${
                    isActive
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : canGo
                        ? 'text-gray-500 hover:text-indigo-600 cursor-pointer'
                        : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {i + 1}. {s.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-500 hidden lg:block">
              {user ? user.name : isGuest ? t.app.guest : ''}
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
        {currentPage === 'intro' && (
          <IntroPage onNext={() => setCurrentPage('builder')} />
        )}

        {currentPage === 'builder' && (
          <BuilderPage
            onNext={handleBuilderComplete}
            initialContext={userContext}
            initialPreview={aiPreview}
          />
        )}

        {currentPage === 'exploration' && userContext && (
          <ExplorationPage
            context={userContext}
            cachedRoles={cachedRoles}
            onRolesFetched={setCachedRoles}
            onSelectRole={handleRoleSelect}
            onExit={handleExit}
            onBack={onBackToBuilder}
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
            initialData={userExperienceInput}
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
          <p className="text-sm text-gray-400 mb-2 font-medium uppercase tracking-widest">{t.app.principles}</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-gray-500 font-bold uppercase">
            <span>{t.app.makeUncertaintyVisible}</span>
            <span>{t.app.testAssumptions}</span>
            <span>{t.app.allowExit}</span>
            <span>{t.app.transparencyOverAuthority}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
