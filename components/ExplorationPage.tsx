
import React, { useEffect, useState } from 'react';
import { UserContext, RoleCard } from '../types';
import { generateRolePossibilities } from '../geminiService';
import { StepLayout } from './StepLayout';

interface ExplorationPageProps {
  context: UserContext;
  onSelectRole: (role: RoleCard) => void;
  onExit: (type: 'not_for_me' | 'unsure') => void;
}

export const ExplorationPage: React.FC<ExplorationPageProps> = ({ context, onSelectRole, onExit }) => {
  const [roles, setRoles] = useState<RoleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await generateRolePossibilities(context);
        setRoles(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [context]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-indigo-500 mb-4"></i>
          <p className="text-gray-600 font-medium">Synthesizing role hypotheses based on your background...</p>
        </div>
      </div>
    );
  }

  return (
    <StepLayout 
      title="Let’s explore what this transition could look like."
      subtitle="These are not recommendations — just possibilities worth examining."
    >
      <div className="mb-10 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Based on what we know so far</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="bg-gray-100 px-3 py-1 rounded-full"><i className="fas fa-sign-out-alt mr-2"></i> {context.origin}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full"><i className="fas fa-compass mr-2"></i> Considering {context.considering.join(", ")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full">
            <div className="p-6 flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{role.name}</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Why this might make sense</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.why.map((w, i) => <li key={i} className="flex items-start"><i className="fas fa-check text-indigo-400 mt-1 mr-2 text-[10px]"></i>{w}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">This path assumes that...</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.assumptions.map((a, i) => <li key={i} className="flex items-start"><i className="fas fa-circle text-indigo-400 mt-1.5 mr-2 text-[6px]"></i>{a}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">What we don't know yet</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {role.uncertainties.map((u, i) => <li key={i} className="flex items-start"><i className="fas fa-question text-orange-400 mt-1 mr-2 text-[10px]"></i>{u}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-3 gap-2">
              <button 
                onClick={() => onSelectRole(role)}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-green-50 border border-transparent hover:border-green-200 transition-all text-gray-600 hover:text-green-700"
              >
                <i className="fas fa-thumbs-up text-lg mb-1"></i>
                <span className="text-[10px] font-bold uppercase">Worth exploring</span>
              </button>
              <button 
                onClick={() => onExit('unsure')}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all text-gray-600 hover:text-blue-700"
              >
                <i className="fas fa-meh text-lg mb-1"></i>
                <span className="text-[10px] font-bold uppercase">Not sure yet</span>
              </button>
              <button 
                onClick={() => onExit('not_for_me')}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-all text-gray-600 hover:text-red-700"
              >
                <i className="fas fa-thumbs-down text-lg mb-1"></i>
                <span className="text-[10px] font-bold uppercase">Probably not</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400 italic">
        These possibilities are based on limited information. We’ll validate assumptions before making any decisions.
      </div>
    </StepLayout>
  );
};
