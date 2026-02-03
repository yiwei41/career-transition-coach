import React, { useState, useEffect } from 'react';

export interface AnalysisStep {
  id: string;
  label: string;
  progress: number;
}

export interface ConsoleLog {
  prefix?: string;
  text: string;
  highlight?: boolean;
}

interface AnalysisProgressDisplayProps {
  title: string;
  subtitle: string;
  steps: AnalysisStep[];
  currentStepIndex: number;
  activeStepProgress?: number; // 0-100 for current step's bar fill
  consoleTitle?: string;
  consoleLogs: ConsoleLog[];
  activeStatus?: 'ACTIVE' | 'PROCESSING' | 'CALCULATING';
}

export const AnalysisProgressDisplay: React.FC<AnalysisProgressDisplayProps> = ({
  title,
  subtitle,
  steps,
  currentStepIndex,
  activeStepProgress = 75,
  consoleTitle = 'NEURAL NETWORK REASONING LAYER',
  consoleLogs,
  activeStatus = 'ACTIVE',
}) => {
  const [displayedLogIndex, setDisplayedLogIndex] = useState(0);

  // Animate console logs appearing one by one
  useEffect(() => {
    if (displayedLogIndex >= consoleLogs.length) return;
    const timer = setTimeout(() => {
      setDisplayedLogIndex((prev) => prev + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [displayedLogIndex, consoleLogs.length]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-gray-500 italic">{subtitle}</p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <div key={step.id} className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-indigo-500 text-white'
                    : isActive
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <i className="fas fa-check text-sm"></i>
                ) : isActive ? (
                  <span className="text-sm font-bold">{index + 1}</span>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>

              {/* Label + Progress Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      isActive ? 'text-gray-900' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                      {activeStatus}
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: isCompleted ? '100%' : isActive ? `${activeStepProgress}%` : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Code Generation Style Console */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            {consoleTitle}
          </span>
          <div className="ml-auto">
            <i className="fas fa-microchip text-slate-600 text-sm"></i>
          </div>
        </div>
        <div className="p-4 font-mono text-sm space-y-2 min-h-[120px]">
          {consoleLogs.slice(0, displayedLogIndex + 1).map((log, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${
                log.highlight ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <span className="text-slate-500 flex-shrink-0">
                {log.prefix ?? '>'}
              </span>
              <span className={log.highlight ? 'text-indigo-400' : ''}>{log.text}</span>
            </div>
          ))}
          {displayedLogIndex < consoleLogs.length && (
            <span className="inline-block w-2 h-4 bg-slate-500 animate-pulse ml-1"></span>
          )}
        </div>
      </div>
    </div>
  );
};
