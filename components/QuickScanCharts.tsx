import React from 'react';
import { AIPreview } from '../types';

interface QuickScanChartsProps {
  preview: AIPreview;
}

export const QuickScanCharts: React.FC<QuickScanChartsProps> = ({ preview }) => {
  const clearCount = preview.clear.length;
  const assumptionsCount = preview.assumptions.length;
  const unclearCount = preview.unclear.length;
  const total = clearCount + assumptionsCount + unclearCount;

  // Calculate percentages for pie chart
  const clearPercent = total > 0 ? (clearCount / total) * 100 : 0;
  const assumptionsPercent = total > 0 ? (assumptionsCount / total) * 100 : 0;
  const unclearPercent = total > 0 ? (unclearCount / total) * 100 : 0;

  // Calculate clarity score (higher is better: more clear, less unclear)
  const clarityScore = total > 0 
    ? Math.round(((clearCount * 1.0 + assumptionsCount * 0.5 - unclearCount * 0.3) / total) * 100)
    : 0;

  // Pie chart SVG path calculation
  const radius = 60;
  const centerX = 70;
  const centerY = 70;
  
  const getPieSlice = (startPercent: number, endPercent: number, color: string) => {
    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = (endPercent / 100) * 360 - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = endPercent - startPercent > 50 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const clearStart = 0;
  const clearEnd = clearPercent;
  const assumptionsStart = clearEnd;
  const assumptionsEnd = clearEnd + assumptionsPercent;
  const unclearStart = assumptionsEnd;
  const unclearEnd = 100;

  return (
    <div className="space-y-8">
      {/* Pie Chart */}
      <div className="rounded-2xl border border-warm-200 bg-white p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
          <i className="fas fa-chart-pie"></i> Distribution
        </h3>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              {clearPercent > 0 && (
                <path
                  d={getPieSlice(clearStart, clearEnd)}
                  fill="#0d9488"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
              {assumptionsPercent > 0 && (
                <path
                  d={getPieSlice(assumptionsStart, assumptionsEnd)}
                  fill="#4f46e5"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
              {unclearPercent > 0 && (
                <path
                  d={getPieSlice(unclearStart, unclearEnd)}
                  fill="#f59e0b"
                  stroke="white"
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-primary-600"></div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Clear</div>
                <div className="text-xs text-gray-500">{clearCount} items ({clearPercent.toFixed(0)}%)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-violet-500"></div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Strengths</div>
                <div className="text-xs text-gray-500">{assumptionsCount} items ({assumptionsPercent.toFixed(0)}%)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Unknowns</div>
                <div className="text-xs text-gray-500">{unclearCount} items ({unclearPercent.toFixed(0)}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights & Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Focus Areas */}
        <div className="rounded-2xl border border-warm-200 bg-gradient-to-br from-primary-50 to-white p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-4 flex items-center gap-2">
            <i className="fas fa-compass"></i> Areas to Explore
          </h3>
          <div className="space-y-3">
            {unclearCount > 0 ? (
              <>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-blue-600">{unclearCount}</span> area{unclearCount > 1 ? 's' : ''} to explore.
                </p>
                {preview.unclear.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-primary-100">
                    <p className="text-xs font-medium text-primary-700 mb-2">Explore:</p>
                    <p className="text-sm text-gray-800">{preview.unclear[0]}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">No unknowns.</p>
            )}
          </div>
        </div>

        {/* Strengths Summary */}
        <div className="rounded-2xl border border-warm-200 bg-gradient-to-br from-accent-50 to-white p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-accent-700 mb-4 flex items-center gap-2">
            <i className="fas fa-lightbulb"></i> Your Strengths
          </h3>
          <div className="space-y-3">
            {assumptionsCount > 0 ? (
              <>
                <p className="text-sm text-gray-700 font-medium">
                  <span className="font-bold text-accent-700">{assumptionsCount}</span> strength{assumptionsCount > 1 ? 's' : ''}.
                </p>
                {preview.assumptions.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-accent-100">
                    <ul className="space-y-2">
                      {preview.assumptions.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                          <span className="font-semibold text-accent-700 flex-shrink-0">{i + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">Keep exploring.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Lists (collapsible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <details className="rounded-2xl border border-warm-200 bg-gray-50 p-5 hover:bg-gray-100 transition-colors">
          <summary className="text-xs font-bold uppercase tracking-widest text-primary-700 flex items-center gap-2 mb-3 cursor-pointer list-none">
            <i className="fas fa-check-circle"></i> Clear ({clearCount})
            <i className="fas fa-chevron-down ml-auto text-xs"></i>
          </summary>
          <ul className="text-sm text-gray-800 space-y-2 mt-3">
            {preview.clear.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-600 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </details>

        <details className="rounded-2xl border border-warm-200 bg-gray-50 p-5 hover:bg-gray-100 transition-colors">
          <summary className="text-xs font-bold uppercase tracking-widest text-accent-700 flex items-center gap-2 mb-3 cursor-pointer list-none">
            <i className="fas fa-lightbulb"></i> Strengths ({assumptionsCount})
            <i className="fas fa-chevron-down ml-auto text-xs"></i>
          </summary>
          <ul className="text-sm text-gray-800 space-y-2 mt-3">
            {preview.assumptions.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-violet-600 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </details>

        <details className="rounded-2xl border border-warm-200 bg-gray-50 p-5 hover:bg-gray-100 transition-colors">
          <summary className="text-xs font-bold uppercase tracking-widest text-amber-700 flex items-center gap-2 mb-3 cursor-pointer list-none">
            <i className="fas fa-question-circle"></i> Unknowns ({unclearCount})
            <i className="fas fa-chevron-down ml-auto text-xs"></i>
          </summary>
          <ul className="text-sm text-gray-800 space-y-2 mt-3">
            {preview.unclear.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
};
