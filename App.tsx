
import React, { useState } from 'react';
import { Page, UserContext, AIPreview, RoleCard, SkillMapping } from './types';
import { BuilderPage } from './components/BuilderPage';
import { ExplorationPage } from './components/ExplorationPage';
import { ValidationPage } from './components/ValidationPage';
import { DecisionPage } from './components/DecisionPage';
import { ExitPage } from './components/ExitPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('builder');
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [aiPreview, setAiPreview] = useState<AIPreview | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleCard | null>(null);
  const [validatedSkills, setValidatedSkills] = useState<SkillMapping[]>([]);
  const [exitType, setExitType] = useState<'not_for_me' | 'unsure' | null>(null);

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

  const handleExit = (type: 'not_for_me' | 'unsure') => {
    setExitType(type);
    setCurrentPage('exit');
  };

  const handleReset = () => {
    setUserContext(null);
    setAiPreview(null);
    setSelectedRole(null);
    setValidatedSkills([]);
    setExitType(null);
    setCurrentPage('builder');
  };

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
            <span className={currentPage === 'decision' ? 'text-indigo-600 border-b-2 border-indigo-600 py-1' : ''}>4. Decision</span>
          </div>

          <div className="text-sm font-medium text-gray-500">
            US Market Analyst
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
            onSelectRole={handleRoleSelect} 
            onExit={handleExit} 
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
