'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center">
          教養オンラインストアへようこそ
        </h1>
        <p className="text-xl mb-8 text-center">
          教養やノウハウに関する記事を購入・販売できるプラットフォームです
        </p>
        
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/articles" className="btn-primary">
            記事を探す
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            ログイン
          </Link>
        </div>
      </div>
    </main>
  );
}
