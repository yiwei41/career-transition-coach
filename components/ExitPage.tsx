
import React from 'react';
import { StepLayout } from './StepLayout';

interface ExitPageProps {
  type: 'not_for_me' | 'unsure';
  onReset: () => void;
}

export const ExitPage: React.FC<ExitPageProps> = ({ type, onReset }) => {
  return (
    <StepLayout 
      title={type === 'not_for_me' ? "Verified: Not a current priority" : "Signal Check: Still Uncertain"}
      subtitle={type === 'not_for_me' ? "Deciding what NOT to pursue is as valuable as deciding what to do." : "Not being sure is a valid outcome. It means we need more information."}
    >
      <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl text-center max-w-2xl mx-auto">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 ${type === 'not_for_me' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
          <i className={`fas ${type === 'not_for_me' ? 'fa-ban' : 'fa-hourglass-half'} text-4xl`}></i>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {type === 'not_for_me' ? "You're ruling this path out for now." : "We've paused this exploration."}
        </h3>
        
        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
          {type === 'not_for_me' 
            ? "This isn't a failure—it's clarity. By identifying where your skills or interests don't align with this specific role, you've clarified what you truly value in your next career move."
            : "Sometimes the assumptions just don't have enough evidence yet. Pausing here prevents a premature 'yes' and saves you from a mismatch later."}
        </p>

        <div className="space-y-4">
          <button 
            onClick={onReset}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg"
          >
            Explore another direction
          </button>
          <button 
            onClick={onReset}
            className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all"
          >
            Pause and come back later
          </button>
        </div>
        
        <p className="mt-8 text-sm text-gray-400 italic">
          Your progress has been cached. You can revisit your checked assumptions anytime.
        </p>
      </div>
    </StepLayout>
  );
};
