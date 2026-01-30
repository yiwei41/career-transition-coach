
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulate Google OAuth transition
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] relative overflow-hidden px-4">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60"></div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 text-center relative z-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-8 shadow-indigo-200 shadow-xl">
          <i className="fas fa-route"></i>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Coach.ai</h1>
        <p className="text-gray-500 mb-10 text-lg">Your co-analyst for the next chapter of your career.</p>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:shadow-lg hover:border-gray-300 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin text-indigo-500"></i>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                <path fill="#FBBC05" d="M3.964 10.711c-.18-.54-.282-1.117-.282-1.711s.102-1.171.282-1.711V4.957H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.043l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.043.957 4.957L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" />
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
          
          <p className="text-[11px] text-gray-400 px-4">
            By continuing, you agree to Coach.ai's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div className="text-left">
            <span className="text-indigo-600 text-lg font-bold">12k+</span>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Pivoters Joined</p>
          </div>
          <div className="text-left">
            <span className="text-indigo-600 text-lg font-bold">94%</span>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Confidence Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};
