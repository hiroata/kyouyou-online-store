'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // ハイドレーションの問題を防ぐためのマウント確認
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ロゴ & メインナビゲーション */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/logo.png"
                    alt="教養オンラインストア"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
                  教養オンラインストア
                </span>
              </Link>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link 
                href="/articles" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-b-2 hover:border-primary-600 transition-all"
              >
                記事一覧
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-b-2 hover:border-primary-600 transition-all"
                >
                  ダッシュボード
                </Link>
              )}
            </nav>
          </div>

          {/* 認証関連ボタン（デスクトップ） */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">メニューを開く</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden shadow-lg`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/articles"
            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            記事一覧
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ダッシュボード
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="space-y-1">
              <span className="block px-4 py-2 text-base font-medium text-gray-600">
                {user.email}
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/auth/login"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ログイン
              </Link>
              <Link
                href="/auth/register"
                className="block px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                新規登録
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
