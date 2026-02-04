import React from 'react';
import { StepLayout } from './StepLayout';
import { useLanguage } from '../LanguageContext';

interface IntroPageProps {
  onNext: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ onNext }) => {
  const { t } = useLanguage();

  return (
    <StepLayout title={t.intro.title} subtitle={t.intro.subtitle}>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          {t.intro.description}
        </p>
        <button
          onClick={onNext}
          className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-md inline-flex items-center gap-2"
        >
          {t.intro.getStarted}
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </StepLayout>
  );
};
