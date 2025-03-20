'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* サイト情報 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">教養オンラインストア</h2>
            <p className="text-gray-400 text-sm">
              教養・ノウハウに関する記事を販売できるプラットフォーム。
              あなたの知識や経験を共有し、収益化することができます。
            </p>
          </div>

          {/* クイックリンク */}
          <div>
            <h2 className="text-lg font-semibold mb-4">クイックリンク</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/articles" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  記事一覧
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  サービスについて
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* 法的情報 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">法的情報</h2>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ご利用規約
                </Link>
              </li>
              <li>
                <Link 
                  href="/commercial" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  特定商取引法に基づく表記
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400 text-sm">
            &copy; {currentYear} 教養オンラインストア. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
