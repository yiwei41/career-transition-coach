import React, { useState, useEffect } from 'react';
import { HistoryRecord } from '../types';
import { getHistoryRecords, deleteHistoryRecord, clearHistoryRecords } from '../historyService';
import { StepLayout } from './StepLayout';
import { useLanguage } from '../LanguageContext';

interface HistoryPageProps {
  onSelectRecord?: (record: HistoryRecord) => void;
  onBack?: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectRecord, onBack }) => {
  const { t } = useLanguage();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const records = getHistoryRecords();
    setHistory(records);
    setLoading(false);
  }, []);

  const handleDelete = (recordId: string) => {
    if (window.confirm(t.history.deleteConfirm)) {
      deleteHistoryRecord(recordId);
      setHistory(getHistoryRecords());
    }
  };

  const handleClearAll = () => {
    if (window.confirm(t.history.clearAllConfirm)) {
      clearHistoryRecords();
      setHistory([]);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.history.justNow;
    if (diffMins < 60) return `${diffMins} ${t.history.minutesAgo}`;
    if (diffHours < 24) return `${diffHours} ${t.history.hoursAgo}`;
    if (diffDays < 7) return `${diffDays} ${t.history.daysAgo}`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <StepLayout title="History" subtitle="Loading your past sessions...">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </StepLayout>
    );
  }

  if (history.length === 0) {
    return (
      <StepLayout title={t.history.title} subtitle={t.history.subtitle}>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-history text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t.history.noHistory}</h3>
          <p className="text-sm text-gray-500 mb-6">
            {t.history.noHistoryDesc}
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t.history.startExploring}
            </button>
          )}
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout title={t.history.title} subtitle={`${history.length} ${history.length === 1 ? t.history.session : t.history.sessions}`}>
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">
            {history.length} {history.length === 1 ? t.history.recordFound : t.history.recordsFound}
          </div>
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
          >
            <i className="fas fa-trash"></i>
            {t.history.clearAll}
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-briefcase text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{record.role.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-sign-out-alt"></i>
                          {record.context.origin}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-clock"></i>
                          {formatDate(record.timestamp)}
                        </span>
                        {record.completed && (
                          <span className="flex items-center gap-1 text-green-600">
                            <i className="fas fa-check-circle"></i>
                            {t.history.completed}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-xs font-semibold text-green-700">
                        {record.skills.filter(s => s.confidence === 'high').length} strong skills
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-xs font-semibold text-amber-700">
                        {record.skills.filter(s => s.confidence === 'unsure').length} uncertain
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-xs font-semibold text-red-700">
                        {record.skills.filter(s => s.confidence === 'gap').length} gaps
                      </span>
                    </div>
                    {record.decision && (
                      <div className={`px-3 py-1.5 rounded-lg border ${
                        record.decision.confidenceLevel === 'High' ? 'bg-green-50 border-green-100' :
                        record.decision.confidenceLevel === 'Medium' ? 'bg-amber-50 border-amber-100' :
                        'bg-red-50 border-red-100'
                      }`}>
                        <span className={`text-xs font-semibold ${
                          record.decision.confidenceLevel === 'High' ? 'text-green-700' :
                          record.decision.confidenceLevel === 'Medium' ? 'text-amber-700' :
                          'text-red-700'
                        }`}>
                          {record.decision.confidenceLevel} confidence
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Decision Summary */}
                  {record.decision && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-700 break-words">
                        <span className="font-semibold">Key question:</span> {record.decision.mainUncertainty}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {onSelectRecord && (
                    <button
                      onClick={() => onSelectRecord(record)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-eye"></i>
                      {t.history.view}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-trash"></i>
                    {t.history.delete}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StepLayout>
  );
};
