'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Article } from '../../../types/article';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import MainLayout from '../../../components/layout/MainLayout';

interface ArticleDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = params;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.get(`/articles/${slug}`);
        setArticle(response.data);
        
        // 購入済みかチェック
        if (user && response.data.isPaid) {
          const purchaseResponse = await api.get(`/purchases/check/${response.data._id}`);
          setHasPurchased(purchaseResponse.data.purchased);
        }
      } catch (err: any) {
        setError('記事の取得に失敗しました: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, user]);

  const handlePurchase = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (!article) return;
    
    setPurchasing(true);
    
    try {
      const response = await api.post('/payments/create-checkout-session', {
        articleId: article._id
      });
      
      // Stripeチェックアウトページへリダイレクト
      window.location.href = response.data.url;
    } catch (err: any) {
      setError('購入処理に失敗しました: ' + err.message);
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">読み込み中...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error || '記事が見つかりません'}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {article.coverImage && (
          <div className="w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <img 
              src={article.coverImage} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex items-center text-gray-500 mb-8">
          <div>
            <span>著者: {article.author.name}</span>
            <span className="mx-2">•</span>
            <span>{new Date(article.createdAt).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
        
        {article.isPaid && !hasPurchased ? (
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-2">この記事は有料コンテンツです</h2>
            <p className="mb-4">{article.excerpt}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-700">¥{article.price.toLocaleString()}</span>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="btn-primary"
              >
                {purchasing ? '処理中...' : '購入して読む'}
              </button>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </MainLayout>
  );
}