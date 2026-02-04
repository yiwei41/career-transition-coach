import React, { useState, useEffect, useRef } from 'react';
import { getHistoryRecords } from '../historyService';
import { useLanguage } from '../LanguageContext';

interface UserMenuProps {
  onHistoryClick: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ 
  onHistoryClick, 
  onSettingsClick,
  onLogout 
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user info
    const googleUser = localStorage.getItem('ctc_google_user');
    const authMethod = localStorage.getItem('ctc_auth_method');
    
    if (googleUser && authMethod === 'google') {
      try {
        const user = JSON.parse(googleUser);
        setUserInfo({
          name: user.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: user.picture,
        });
      } catch {
        setUserInfo({ name: 'User', email: '' });
      }
    } else {
      setUserInfo({ name: 'Guest', email: '' });
    }

    // Load history count
    const history = getHistoryRecords();
    setHistoryCount(history.length);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleHistoryClick = () => {
    setIsOpen(false);
    onHistoryClick();
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      // Default logout: clear auth and redirect to auth page
      localStorage.removeItem('ctc_auth_method');
      localStorage.removeItem('ctc_google_id_token');
      localStorage.removeItem('ctc_google_user');
      window.location.href = '/auth';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar/Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="User menu"
      >
        {userInfo?.avatar ? (
          <img
            src={userInfo.avatar}
            alt={userInfo.name}
            className="w-8 h-8 rounded-full border-2 border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
            {userInfo?.name?.[0]?.toUpperCase() || 'G'}
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold text-gray-900">{userInfo?.name || t.app.guest}</div>
          {userInfo?.email && (
            <div className="text-xs text-gray-500">{userInfo.email}</div>
          )}
        </div>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 text-xs`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              {userInfo?.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                  {userInfo?.name?.[0]?.toUpperCase() || 'G'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {userInfo?.name || t.app.guest}
                </div>
                {userInfo?.email && (
                  <div className="text-xs text-gray-500 truncate">{userInfo.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleHistoryClick}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <i className="fas fa-history"></i>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">History</div>
                <div className="text-xs text-gray-500">
                  {historyCount} {historyCount === 1 ? 'session' : 'sessions'}
                </div>
              </div>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
            </button>

            {onSettingsClick && (
              <button
                onClick={handleSettingsClick}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <i className="fas fa-cog"></i>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{t.app.settings}</div>
                  <div className="text-xs text-gray-500">{t.app.preferencesAndAccount}</div>
                </div>
                <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
              </button>
            )}

            <div className="border-t border-gray-100 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 transition-colors group text-red-600"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{t.app.signOut}</div>
                <div className="text-xs text-red-400">{t.app.signOutDesc}</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
