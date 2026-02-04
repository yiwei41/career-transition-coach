
import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Decode JWT token to get user info
const decodeJwt = (token: string): { name: string; email: string; picture: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const decoded = decodeJwt(credentialResponse.credential);
      if (decoded) {
        onLogin({
          name: decoded.name,
          email: decoded.email,
          avatar: decoded.picture
        });
      }
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
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
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
              width="320"
            />
          </div>
          
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
