export type Language = 'en' | 'zh-CN' | 'zh-TW';

export interface Translations {
  // App / Nav
  app: {
    intro: string;
    context: string;
    explore: string;
    validate: string;
    action: string;
    resume: string;
    guest: string;
    settings: string;
    history: string;
    logout: string;
    principles: string;
    makeUncertaintyVisible: string;
    testAssumptions: string;
    allowExit: string;
    transparencyOverAuthority: string;
    loading: string;
    errorTitle: string;
    refresh: string;
    preferencesAndAccount: string;
    signOut: string;
    signOutDesc: string;
  };
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
    welcome: string;
    googleSignIn: string;
    privacyNote: string;
    guestContinue: string;
    useEmail: string;
    hideEmail: string;
    newHere: string;
    createAccount: string;
    alreadyHaveAccount: string;
    logIn: string;
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
    clearHistoryConfirm: string;
    noDataToExport: string;
    googleAccount: string;
    guestMode: string;
    connected: string;
    saved: string;
  };
  // Intro
  intro: {
    title: string;
    subtitle: string;
    description: string;
    getStarted: string;
  };
  // Builder
  builder: {
    retry: string;
    yourBackground: string;
    pickOne: string;
    content: string;
    marketing: string;
    operations: string;
    data: string;
    business: string;
    mixedOther: string;
    next: string;
  };
  // History
  history: {
    title: string;
    subtitle: string;
    noHistory: string;
    noHistoryDesc: string;
    recordsFound: string;
    recordFound: string;
    clearAll: string;
    view: string;
    delete: string;
    completed: string;
    sessions: string;
    session: string;
    deleteConfirm: string;
    clearAllConfirm: string;
    startExploring: string;
    loadingSessions: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
}

export const translations: Record<Language, Translations> = {
  'en': {
    app: {
      intro: 'Intro',
      context: 'Context',
      explore: 'Explore',
      validate: 'Validate',
      action: 'Action',
      resume: 'Resume',
      guest: 'Guest',
      settings: 'Settings',
      history: 'History',
      logout: 'Log out',
      principles: 'Principles',
      makeUncertaintyVisible: 'Make uncertainty visible',
      testAssumptions: 'Test assumptions, not people',
      allowExit: 'Allow exit without penalty',
      transparencyOverAuthority: 'Transparency over Authority',
      loading: 'Loading…',
      errorTitle: 'Something went wrong',
      refresh: 'Refresh',
      preferencesAndAccount: 'Preferences & account',
      signOut: 'Sign out',
      signOutDesc: 'Log out of your account',
    },
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
      welcome: 'Ready when you are',
      googleSignIn: 'Continue with Google',
      privacyNote: 'We use it only to save your progress.',
      guestContinue: 'Explore first—sign in when you\'re ready',
      useEmail: 'Prefer email?',
      hideEmail: 'Hide email',
      newHere: 'New here?',
      createAccount: 'Create an account',
      alreadyHaveAccount: 'Already have an account?',
      logIn: 'Log in',
    },
    intro: {
      title: 'Coach.Ai',
      subtitle: 'Your career transition companion',
      description: 'Coach.Ai helps career transition job seekers make career decisions and generate their first resume.',
      getStarted: 'Get Started',
    },
    builder: {
      retry: 'Retry',
      yourBackground: 'Your background',
      pickOne: 'Pick one. Keep it simple.',
      content: 'Content',
      marketing: 'Marketing',
      operations: 'Operations',
      data: 'Data',
      business: 'Business',
      mixedOther: 'Mixed / Other',
      next: 'Next',
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
      clearHistoryConfirm: 'Are you sure you want to clear all history? This cannot be undone.',
      noDataToExport: 'No data to export.',
      googleAccount: 'Google Account',
      guestMode: 'Guest Mode',
      connected: 'Connected',
      guest: 'Guest',
      saved: 'saved',
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
      deleteConfirm: 'Are you sure you want to delete this record?',
      clearAllConfirm: 'Are you sure you want to clear all history? This cannot be undone.',
      startExploring: 'Start exploring',
      loadingSessions: 'Loading your past sessions...',
      justNow: 'Just now',
      minutesAgo: 'minute(s) ago',
      hoursAgo: 'hour(s) ago',
      daysAgo: 'day(s) ago',
    },
  },
  'zh-CN': {
    app: {
      intro: '介绍',
      context: '背景',
      explore: '探索',
      validate: '验证',
      action: '行动',
      resume: '简历',
      guest: '访客',
      settings: '设置',
      history: '历史',
      logout: '退出登录',
      principles: '原则',
      makeUncertaintyVisible: '让不确定性可见',
      testAssumptions: '验证假设，而非人',
      allowExit: '允许无惩罚退出',
      transparencyOverAuthority: '透明优于权威',
      loading: '加载中…',
      errorTitle: '加载出错',
      refresh: '刷新',
      preferencesAndAccount: '偏好与账户',
      signOut: '退出登录',
      signOutDesc: '退出您的账户',
    },
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
      welcome: '准备好了就开始',
      googleSignIn: '使用 Google 账号登录',
      privacyNote: '我们仅用它保存您的进度，不会访问邮件或其他数据。',
      guestContinue: '先探索，稍后再登录',
      useEmail: '使用邮箱？',
      hideEmail: '收起邮箱',
      newHere: '新用户？',
      createAccount: '创建账号',
      alreadyHaveAccount: '已有账号？',
      logIn: '登录',
    },
    intro: {
      title: 'Coach.Ai',
      subtitle: '您的职业转型伙伴',
      description: 'Coach.Ai 帮助转型求职者做职业判断，生成第一份简历。',
      getStarted: '开始',
    },
    builder: {
      retry: '重试',
      yourBackground: '您的背景',
      pickOne: '选一个，简单即可。',
      content: '内容',
      marketing: '营销',
      operations: '运营',
      data: '数据',
      business: '商业',
      mixedOther: '混合 / 其他',
      next: '下一步',
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
      clearHistoryConfirm: '确定要清空所有历史吗？此操作无法撤销。',
      noDataToExport: '暂无数据可导出。',
      googleAccount: 'Google 账号',
      guestMode: '访客模式',
      connected: '已连接',
      guest: '访客',
      saved: '已保存',
    },
    history: {
      title: '历史记录',
      subtitle: '您过去的职业探索会话',
      noHistory: '暂无历史记录',
      noHistoryDesc: '您完成的职业探索会话将显示在这里。',
      recordsFound: '条记录',
      recordFound: '条记录',
      clearAll: '清空全部',
      view: '查看',
      delete: '删除',
      completed: '已完成',
      sessions: '个会话',
      session: '个会话',
    },
  },
  'zh-TW': {
    app: {
      intro: '介紹',
      context: '背景',
      explore: '探索',
      validate: '驗證',
      action: '行動',
      resume: '履歷',
      guest: '訪客',
      settings: '設定',
      history: '歷史',
      logout: '登出',
      principles: '原則',
      makeUncertaintyVisible: '讓不確定性可見',
      testAssumptions: '驗證假設，而非人',
      allowExit: '允許無懲罰退出',
      transparencyOverAuthority: '透明優於權威',
      loading: '載入中…',
      errorTitle: '載入出錯',
      refresh: '重新整理',
      preferencesAndAccount: '偏好與帳戶',
      signOut: '登出',
      signOutDesc: '登出您的帳戶',
    },
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
      welcome: '準備好了就開始',
      googleSignIn: '使用 Google 帳號登入',
      privacyNote: '我們僅用它儲存您的進度。',
      guestContinue: '先探索——準備好再登入',
      useEmail: '使用信箱？',
      hideEmail: '收起信箱',
      newHere: '新用戶？',
      createAccount: '建立帳號',
      alreadyHaveAccount: '已有帳號？',
      logIn: '登入',
    },
    intro: {
      title: 'Coach.Ai',
      subtitle: '您的職業轉型夥伴',
      description: 'Coach.Ai 幫助轉型求職者做職業判斷，生成第一份履歷。',
      getStarted: '開始',
    },
    builder: {
      retry: '重試',
      yourBackground: '您的背景',
      pickOne: '選一個，簡單即可。',
      content: '內容',
      marketing: '行銷',
      operations: '營運',
      data: '資料',
      business: '商業',
      mixedOther: '混合 / 其他',
      next: '下一步',
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
      clearHistoryConfirm: '確定要清除所有歷史嗎？此操作無法復原。',
      noDataToExport: '尚無資料可匯出。',
      googleAccount: 'Google 帳號',
      guestMode: '訪客模式',
      connected: '已連線',
      guest: '訪客',
      saved: '已儲存',
    },
    history: {
      title: '歷史記錄',
      subtitle: '您過去的職業探索會話',
      noHistory: '尚無歷史記錄',
      noHistoryDesc: '您完成的職業探索會話將顯示在這裡。',
      recordsFound: '筆記錄',
      recordFound: '筆記錄',
      clearAll: '清除全部',
      view: '查看',
      delete: '刪除',
      completed: '已完成',
      sessions: '個會話',
      session: '個會話',
      deleteConfirm: '確定要刪除這筆記錄嗎？',
      clearAllConfirm: '確定要清除所有歷史嗎？此操作無法復原。',
      startExploring: '開始探索',
      loadingSessions: '正在載入您的歷史會話...',
      justNow: '剛剛',
      minutesAgo: '分鐘前',
      hoursAgo: '小時前',
      daysAgo: '天前',
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
