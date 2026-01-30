
import React, { useState } from 'react';
import { Page, UserContext, AIPreview, RoleCard, SkillMapping, User, DecisionSupport, ResumeDraft, UserExperienceInput } from './types';
import { BuilderPage } from './components/BuilderPage';
import { ExplorationPage } from './components/ExplorationPage';
import { ValidationPage } from './components/ValidationPage';
import { DecisionPage } from './components/DecisionPage';
import { ResumePage } from './components/ResumePage';
import { ResumeFormPage } from './components/ResumeFormPage';
import { ExitPage } from './components/ExitPage';
import { LoginPage } from './components/LoginPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('builder');
  
  // 1. 核心输入上下文
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [aiPreview, setAiPreview] = useState<AIPreview | null>(null);

  // 2. 角色探索阶段缓存
  const [cachedRoles, setCachedRoles] = useState<RoleCard[] | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleCard | null>(null);

  // 3. 验证阶段缓存 (Key 为 role.id，支持切换角色保留各自进度)
  const [cachedSkillsMap, setCachedSkillsMap] = useState<Record<string, SkillMapping[]>>({});
  
  // 4. 简历表单数据
  const [userExperienceInput, setUserExperienceInput] = useState<UserExperienceInput | undefined>(undefined);

  // 5. 决策与简历阶段缓存 (Key 为 role.id)
  const [cachedDecisionMap, setCachedDecisionMap] = useState<Record<string, DecisionSupport>>({});
  const [cachedResumeMap, setCachedResumeMap] = useState<Record<string, ResumeDraft>>({});

  const [exitType, setExitType] = useState<'not_for_me' | 'unsure' | null>(null);

  const handleLogin = () => {
    setUser({
      name: "Alex Johnson",
      email: "alex.j@gmail.com",
      avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=4f46e5&color=fff"
    });
  };

  const handleLogout = () => {
    setUser(null);
    handleReset();
  };

  const handleBuilderComplete = (context: UserContext, preview: AIPreview) => {
    setUserContext(context);
    setAiPreview(preview);
    setCachedRoles(null);
    setCachedSkillsMap({});
    setCachedDecisionMap({});
    setCachedResumeMap({});
    setCurrentPage('exploration');
  };

  const handleRoleSelect = (role: RoleCard) => {
    setSelectedRole(role);
    setCurrentPage('validation');
  };

  const handleValidationUpdate = (roleId: string, skills: SkillMapping[]) => {
    setCachedSkillsMap(prev => ({ ...prev, [roleId]: skills }));
  };

  const handleDecisionFetched = (roleId: string, decision: DecisionSupport) => {
    setCachedDecisionMap(prev => ({ ...prev, [roleId]: decision }));
  };

  const handleResumeFormSubmit = (input: UserExperienceInput) => {
    setUserExperienceInput(input);
    // Clear the specific resume cache for this role if the input changed
    if (selectedRole) {
      setCachedResumeMap(prev => {
        const next = { ...prev };
        delete next[selectedRole.id];
        return next;
      });
    }
    setCurrentPage('resume');
  };

  const handleResumeFetched = (roleId: string, resume: ResumeDraft) => {
    setCachedResumeMap(prev => ({ ...prev, [roleId]: resume }));
  };

  const handleExit = (type: 'not_for_me' | 'unsure') => {
    setExitType(type);
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

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
            <span className={currentPage === 'builder' ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : ''}>1. Context</span>
            <span className={currentPage === 'exploration' ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : ''}>2. Explore</span>
            <span className={currentPage === 'validation' ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : ''}>3. Validate</span>
            <span className={['decision', 'resume-form', 'resume'].includes(currentPage) ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : ''}>4. Action</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-bold text-gray-900 leading-tight">{user.name}</p>
              <button onClick={handleLogout} className="text-[10px] text-gray-400 hover:text-red-500 uppercase font-black tracking-widest transition-colors">Sign Out</button>
            </div>
            <img 
              src={user.avatar} 
              alt="User profile" 
              className="w-10 h-10 rounded-xl border-2 border-indigo-50 shadow-sm cursor-pointer hover:border-indigo-200 transition-all"
              onClick={handleLogout}
            />
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-20">
        {currentPage === 'builder' && (
          <BuilderPage onNext={handleBuilderComplete} />
        )}
        
        {currentPage === 'exploration' && userContext && (
          <ExplorationPage 
            context={userContext} 
            cachedRoles={cachedRoles}
            onRolesFetched={setCachedRoles}
            onSelectRole={handleRoleSelect} 
            onExit={handleExit} 
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

        {currentPage === 'decision' && selectedRole && userContext && cachedSkillsMap[selectedRole.id] && (
          <DecisionPage 
            role={selectedRole} 
            skills={cachedSkillsMap[selectedRole.id]} 
            context={userContext}
            cachedDecision={cachedDecisionMap[selectedRole.id]}
            onDecisionFetched={(d) => handleDecisionFetched(selectedRole.id, d)}
            onReset={handleReset}
            onNavigateToResume={() => setCurrentPage('resume-form')}
            onBack={() => setCurrentPage('validation')}
          />
        )}

        {currentPage === 'resume-form' && selectedRole && cachedSkillsMap[selectedRole.id] && (
          <ResumeFormPage 
            role={selectedRole}
            skills={cachedSkillsMap[selectedRole.id]}
            onNext={handleResumeFormSubmit}
            onBack={() => setCurrentPage('decision')}
          />
        )}

        {currentPage === 'resume' && selectedRole && userContext && cachedSkillsMap[selectedRole.id] && (
          <ResumePage 
            role={selectedRole} 
            skills={cachedSkillsMap[selectedRole.id]} 
            context={userContext}
            personalInfo={userExperienceInput}
            cachedResume={cachedResumeMap[selectedRole.id]}
            onResumeFetched={(r) => handleResumeFetched(selectedRole.id, r)}
            onBack={() => setCurrentPage('resume-form')}
          />
        )}

        {currentPage === 'exit' && exitType && (
          <ExitPage type={exitType} onReset={handleReset} />
        )}
      </main>
      
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
