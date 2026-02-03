
import React, { useState, useEffect } from 'react';
import { Page, UserContext, AIPreview, RoleCard, SkillMapping, DecisionSupport, HistoryRecord } from './types';
import { BuilderPage } from './components/BuilderPage';
import { ExplorationPage } from './components/ExplorationPage';
import { ValidationPage } from './components/ValidationPage';
import { DecisionPage } from './components/DecisionPage';
import { ExitPage } from './components/ExitPage';
import { ResumePage } from './components/ResumePage';
import { HistoryPage } from './components/HistoryPage';
import { SettingsSidebar } from './components/SettingsSidebar';
import { UserMenu } from './components/UserMenu';
import { saveHistoryRecord, getHistoryRecords, initGuestId } from './historyService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('builder');
  const [showSettings, setShowSettings] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [aiPreview, setAiPreview] = useState<AIPreview | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleCard | null>(null);
  const [validatedSkills, setValidatedSkills] = useState<SkillMapping[]>([]);
  const [exitType, setExitType] = useState<'not_for_me' | 'unsure' | null>(null);
  const [decisionData, setDecisionData] = useState<DecisionSupport | null>(null);

  // Initialize guest ID and check for history on mount
  useEffect(() => {
    initGuestId();
    const fromAuth = sessionStorage.getItem('ctc_from_auth') === 'true';
    if (fromAuth) {
      sessionStorage.removeItem('ctc_from_auth');
      const history = getHistoryRecords();
      if (history.length > 0) {
        // Show history page if user has history and is coming from auth
        setCurrentPage('history');
      }
    }
  }, []);

  const handleBuilderComplete = (context: UserContext, preview: AIPreview) => {
    setUserContext(context);
    setAiPreview(preview);
    setCurrentPage('exploration');
  };

  const handleRoleSelect = (role: RoleCard) => {
    setSelectedRole(role);
    setCurrentPage('validation');
  };

  const handleValidationComplete = (skills: SkillMapping[]) => {
    setValidatedSkills(skills);
    setCurrentPage('decision');
  };

  const handleDecisionReady = (decision: DecisionSupport) => {
    setDecisionData(decision);
    // Save history record when decision is ready
    if (selectedRole && userContext && validatedSkills.length > 0) {
      const record: HistoryRecord = {
        id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        role: selectedRole,
        context: userContext,
        skills: validatedSkills,
        decision: decision,
        completed: true,
      };
      saveHistoryRecord(record);
    }
  };

  const handleExit = (type: 'not_for_me' | 'unsure') => {
    setExitType(type);
    // Save incomplete history record
    if (selectedRole && userContext && validatedSkills.length > 0) {
      const record: HistoryRecord = {
        id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    setSelectedRole(null);
    setValidatedSkills([]);
    setExitType(null);
    setDecisionData(null);
    setCurrentPage('builder');
  };

  const handleSelectHistoryRecord = (record: HistoryRecord) => {
    setUserContext(record.context);
    setSelectedRole(record.role);
    setValidatedSkills(record.skills);
    setDecisionData(record.decision || null);
    setCurrentPage('decision');
  };

  const steps: { key: Page; label: string }[] = [
    { key: 'builder', label: 'Context' },
    { key: 'exploration', label: 'Explore' },
    { key: 'validation', label: 'Validate' },
    { key: 'decision', label: 'Decision' },
  ];
  const stepIndex = steps.findIndex(s => s.key === currentPage);
  const progressPercent = stepIndex >= 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-route"></i>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Coach.ai</span>
          </div>
          
          {/* Steps Navigation */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
            {steps.map((s, i) => (
              <span
                key={s.key}
                className={currentPage === s.key ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : ''}
              >
                {i + 1}. {s.label}
              </span>
            ))}
          </div>

          {/* Right Side: User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-500 hidden lg:block">
              US Market Analyst
            </div>
            <UserMenu
              onHistoryClick={() => {
                setCurrentPage('history');
              }}
              onSettingsClick={() => {
                setShowSettings(true);
              }}
              onLogout={() => {
                localStorage.removeItem('ctc_auth_method');
                localStorage.removeItem('ctc_google_id_token');
                localStorage.removeItem('ctc_google_user');
                window.location.href = '/auth';
              }}
            />
          </div>
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </nav>

      <main className="pt-20 pb-20">
        {currentPage === 'builder' && (
          <BuilderPage onNext={handleBuilderComplete} />
        )}
        
        {currentPage === 'exploration' && userContext && (
          <ExplorationPage 
            context={userContext} 
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
            onNext={handleValidationComplete}
            onBack={() => setCurrentPage('exploration')}
          />
        )}

        {currentPage === 'decision' && selectedRole && validatedSkills && userContext && (
          <DecisionPage 
            role={selectedRole} 
            skills={validatedSkills} 
            context={userContext}
            onReset={handleReset}
            onDecisionReady={handleDecisionReady}
            onResume={() => setCurrentPage('resume')}
            onBackToValidation={() => setCurrentPage('validation')}
            onExit={handleExit}
          />
        )}

        {currentPage === 'resume' && selectedRole && validatedSkills && userContext && (
          <ResumePage
            role={selectedRole}
            context={userContext}
            skills={validatedSkills}
            onBack={() => setCurrentPage('decision')}
            onReset={handleReset}
          />
        )}

        {currentPage === 'exit' && exitType && (
          <ExitPage type={exitType} onReset={handleReset} />
        )}

        {currentPage === 'history' && (
          <HistoryPage 
            onSelectRecord={handleSelectHistoryRecord}
            onBack={() => setCurrentPage('builder')}
          />
        )}
      </main>

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      
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
