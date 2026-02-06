import React, { useState, useEffect } from 'react';
import { clearHistoryRecords, getHistoryRecords } from '../historyService';
import { languageNames, Language } from '../locales';
import { useLanguage } from '../LanguageContext';

interface SettingsPageProps {
  onBack?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { t, language: currentLang, setLanguage: setLang } = useLanguage();
  const [historyCount, setHistoryCount] = useState(0);
  const [authMethod, setAuthMethod] = useState<string>('guest');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Load current settings
    const history = getHistoryRecords();
    setHistoryCount(history.length);
    
    const method = localStorage.getItem('ctc_auth_method') || 'guest';
    setAuthMethod(method);
    
    if (method === 'google') {
      const googleUser = localStorage.getItem('ctc_google_user');
      if (googleUser) {
        try {
          const user = JSON.parse(googleUser);
          setUserEmail(user.email || '');
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLang(lang);
  };

  const handleClearHistory = () => {
    if (window.confirm(t.settings.clearHistoryConfirm)) {
      clearHistoryRecords();
      setHistoryCount(0);
    }
  };

  const handleExportData = () => {
    const history = getHistoryRecords();
    if (history.length === 0) {
      alert(t.settings.noDataToExport);
      return;
    }
    
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `career-transition-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
        {/* Language Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <i className="fas fa-language text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.settings.language}</h2>
              <p className="text-sm text-gray-500">{t.settings.languageSubtitle}</p>
            </div>
          </div>

          <div className="space-y-3">
            {(Object.keys(languageNames) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  currentLang === lang
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentLang === lang
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <i className={`fas ${currentLang === lang ? 'fa-check' : 'fa-circle'}`}></i>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{languageNames[lang]}</div>
                    <div className="text-xs text-gray-500">
                      {lang === 'en' && 'English'}
                      {lang === 'zh-CN' && 'Simplified Chinese'}
                      {lang === 'zh-TW' && 'Traditional Chinese'}
                    </div>
                  </div>
                </div>
                {currentLang === lang && (
                  <i className="fas fa-check-circle text-primary-500"></i>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <i className="fas fa-user text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.settings.account}</h2>
              <p className="text-sm text-gray-500">{t.settings.accountSubtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm font-semibold text-gray-900">{t.settings.loginMethod}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {authMethod === 'google' ? t.settings.googleAccount : t.settings.guestMode}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                authMethod === 'google' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {authMethod === 'google' ? t.settings.connected : t.settings.guest}
              </div>
            </div>

            {userEmail && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.settings.email}</div>
                  <div className="text-xs text-gray-500 mt-1">{userEmail}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{t.settings.historyRecords}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {historyCount} {historyCount === 1 ? t.history.session : t.history.sessions} {t.settings.saved}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center">
              <i className="fas fa-database text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.settings.dataManagement}</h2>
              <p className="text-sm text-gray-500">{t.settings.dataManagementSubtitle}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={historyCount === 0}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <i className="fas fa-download"></i>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{t.settings.exportData}</div>
                  <div className="text-xs text-gray-500">{t.settings.exportDataDesc}</div>
                </div>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </button>

            <button
              onClick={handleClearHistory}
              disabled={historyCount === 0}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <i className="fas fa-trash"></i>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{t.settings.clearHistory}</div>
                  <div className="text-xs text-gray-500">{t.settings.clearHistoryDesc}</div>
                </div>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </button>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <i className="fas fa-shield-halved text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t.settings.privacy}</h2>
              <p className="text-sm text-gray-500">{t.settings.privacySubtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="font-semibold">{t.settings.dataStorage}:</strong> {t.settings.dataStorageDesc}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="font-semibold">{t.settings.googleLogin}:</strong> {t.settings.googleLoginDesc}
              </p>
            </div>
          </div>
        </div>

      </div>
  );
};
