export type Language = 'en' | 'zh-CN' | 'zh-TW';

export interface Translations {
  // Common
  common: {
    back: string;
    next: string;
    continue: string;
    cancel: string;
    save: string;
    delete: string;
    confirm: string;
    loading: string;
  };
  // Auth
  auth: {
    title: string;
    googleSignIn: string;
    guestContinue: string;
    privacyNote: string;
  };
  // Settings
  settings: {
    title: string;
    subtitle: string;
    account: string;
    accountSubtitle: string;
    loginMethod: string;
    email: string;
    historyRecords: string;
    dataManagement: string;
    dataManagementSubtitle: string;
    exportData: string;
    exportDataDesc: string;
    clearHistory: string;
    clearHistoryDesc: string;
    privacy: string;
    privacySubtitle: string;
    language: string;
    languageSubtitle: string;
    selectLanguage: string;
    dataStorage: string;
    dataStorageDesc: string;
    googleLogin: string;
    googleLoginDesc: string;
  };
  // History
  history: {
    title: string;
    subtitle: string;
    noHistory: string;
    noHistoryDesc: string;
    recordsFound: string;
    clearAll: string;
    view: string;
    delete: string;
    completed: string;
    sessions: string;
    session: string;
  };
}

export const translations: Record<Language, Translations> = {
  'en': {
    common: {
      back: 'Back',
      next: 'Next',
      continue: 'Continue',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      confirm: 'Confirm',
      loading: 'Loading...',
    },
    auth: {
      title: 'Coach Auth',
      googleSignIn: 'Continue with Google',
      guestContinue: 'Continue without an account',
      privacyNote: 'We only use your Google account to save your progress.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your account and preferences',
      account: 'Account',
      accountSubtitle: 'Your account information',
      loginMethod: 'Login Method',
      email: 'Email',
      historyRecords: 'History Records',
      dataManagement: 'Data Management',
      dataManagementSubtitle: 'Export or clear your data',
      exportData: 'Export Data',
      exportDataDesc: 'Download your history as JSON',
      clearHistory: 'Clear All History',
      clearHistoryDesc: 'Permanently delete all saved sessions',
      privacy: 'Privacy & Security',
      privacySubtitle: 'How we handle your data',
      language: 'Language',
      languageSubtitle: 'Choose your preferred language',
      selectLanguage: 'Select Language',
      dataStorage: 'Data Storage',
      dataStorageDesc: 'All your data is stored locally in your browser. We don\'t send your personal information to any external servers except for AI analysis (which is processed anonymously).',
      googleLogin: 'Google Login',
      googleLoginDesc: 'We only use your Google account to identify you and save your progress. We don\'t access your emails, contacts, or any other Google data.',
    },
    history: {
      title: 'History',
      subtitle: 'Your past career exploration sessions',
      noHistory: 'No history yet',
      noHistoryDesc: 'Your completed career exploration sessions will appear here.',
      recordsFound: 'records found',
      clearAll: 'Clear all',
      view: 'View',
      delete: 'Delete',
      completed: 'Completed',
      sessions: 'sessions',
      session: 'session',
    },
  },
  'zh-CN': {
    common: {
      back: '返回',
      next: '下一步',
      continue: '继续',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      confirm: '确认',
      loading: '加载中...',
    },
    auth: {
      title: 'Coach 认证',
      googleSignIn: '使用 Google 账号登录',
      guestContinue: '不使用账号继续',
      privacyNote: '我们仅使用您的 Google 账号来保存您的进度。',
    },
    settings: {
      title: '设置',
      subtitle: '管理您的账户和偏好设置',
      account: '账户',
      accountSubtitle: '您的账户信息',
      loginMethod: '登录方式',
      email: '邮箱',
      historyRecords: '历史记录',
      dataManagement: '数据管理',
      dataManagementSubtitle: '导出或清空您的数据',
      exportData: '导出数据',
      exportDataDesc: '将历史记录下载为 JSON 文件',
      clearHistory: '清空所有历史',
      clearHistoryDesc: '永久删除所有已保存的会话',
      privacy: '隐私与安全',
      privacySubtitle: '我们如何处理您的数据',
      language: '语言',
      languageSubtitle: '选择您的首选语言',
      selectLanguage: '选择语言',
      dataStorage: '数据存储',
      dataStorageDesc: '您的所有数据都存储在本地浏览器中。除了 AI 分析（匿名处理）外，我们不会将您的个人信息发送到任何外部服务器。',
      googleLogin: 'Google 登录',
      googleLoginDesc: '我们仅使用您的 Google 账号来识别您并保存您的进度。我们不会访问您的电子邮件、联系人或任何其他 Google 数据。',
    },
    history: {
      title: '历史记录',
      subtitle: '您过去的职业探索会话',
      noHistory: '暂无历史记录',
      noHistoryDesc: '您完成的职业探索会话将显示在这里。',
      recordsFound: '条记录',
      clearAll: '清空全部',
      view: '查看',
      delete: '删除',
      completed: '已完成',
      sessions: '个会话',
      session: '个会话',
    },
  },
  'zh-TW': {
    common: {
      back: '返回',
      next: '下一步',
      continue: '繼續',
      cancel: '取消',
      save: '儲存',
      delete: '刪除',
      confirm: '確認',
      loading: '載入中...',
    },
    auth: {
      title: 'Coach 認證',
      googleSignIn: '使用 Google 帳號登入',
      guestContinue: '不使用帳號繼續',
      privacyNote: '我們僅使用您的 Google 帳號來儲存您的進度。',
    },
    settings: {
      title: '設定',
      subtitle: '管理您的帳戶和偏好設定',
      account: '帳戶',
      accountSubtitle: '您的帳戶資訊',
      loginMethod: '登入方式',
      email: '電子郵件',
      historyRecords: '歷史記錄',
      dataManagement: '資料管理',
      dataManagementSubtitle: '匯出或清除您的資料',
      exportData: '匯出資料',
      exportDataDesc: '將歷史記錄下載為 JSON 檔案',
      clearHistory: '清除所有歷史',
      clearHistoryDesc: '永久刪除所有已儲存的會話',
      privacy: '隱私與安全',
      privacySubtitle: '我們如何處理您的資料',
      language: '語言',
      languageSubtitle: '選擇您的首選語言',
      selectLanguage: '選擇語言',
      dataStorage: '資料儲存',
      dataStorageDesc: '您的所有資料都儲存在本地瀏覽器中。除了 AI 分析（匿名處理）外，我們不會將您的個人資訊傳送到任何外部伺服器。',
      googleLogin: 'Google 登入',
      googleLoginDesc: '我們僅使用您的 Google 帳號來識別您並儲存您的進度。我們不會存取您的電子郵件、聯絡人或任何其他 Google 資料。',
    },
    history: {
      title: '歷史記錄',
      subtitle: '您過去的職業探索會話',
      noHistory: '尚無歷史記錄',
      noHistoryDesc: '您完成的職業探索會話將顯示在這裡。',
      recordsFound: '筆記錄',
      clearAll: '清除全部',
      view: '查看',
      delete: '刪除',
      completed: '已完成',
      sessions: '個會話',
      session: '個會話',
    },
  },
};

// Language storage key
const LANGUAGE_STORAGE_KEY = 'ctc_language';

// Get current language from localStorage or browser
export const getCurrentLanguage = (): Language => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && (stored === 'en' || stored === 'zh-CN' || stored === 'zh-TW')) {
    return stored as Language;
  }
  
  // Detect from browser
  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang.startsWith('zh')) {
    return browserLang.includes('TW') || browserLang.includes('HK') ? 'zh-TW' : 'zh-CN';
  }
  
  return 'en';
};

// Set language
export const setLanguage = (lang: Language): void => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  // Trigger a custom event to notify components
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
};

// Get translations for current language
export const getTranslations = (): Translations => {
  return translations[getCurrentLanguage()];
};

// Language display names
export const languageNames: Record<Language, string> = {
  'en': 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};
