'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

export default function VerifyEmailPage() {
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const { user, sendVerificationEmail } = useAuth();

  const handleResendEmail = async () => {
    if (!user) return;

    setResendStatus('sending');
    setError('');

    try {
      await sendVerificationEmail();
      setResendStatus('sent');
    } catch (err: any) {
      setError(err.message);
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            メール認証
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {user?.email} 宛に確認メールを送信しました
          </p>
        </div>

        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                認証手順
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal pl-4 space-y-2">
                  <li>メールボックスを確認してください</li>
                  <li>認証用リンクをクリックしてメールアドレスを確認してください</li>
                  <li>確認後、ログインページからログインしてください</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {resendStatus === 'sent' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">確認メールを再送信しました</span>
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={resendStatus === 'sending'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {resendStatus === 'sending' ? '送信中...' : '確認メールを再送信'}
          </button>

          <Link 
            href="/auth/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            ログインページへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}