
import React from 'react';

interface StepLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const StepLayout: React.FC<StepLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
};
