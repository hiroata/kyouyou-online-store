'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import MainLayout from '../../../components/layout/MainLayout';

export default function CreateArticlePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [price, setPrice] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // カテゴリー一覧を取得
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err: any) {
        console.error('カテゴリーの取得に失敗しました:', err);
      }
    };

    fetchCategories();
  }, []);

  // 認証確認
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !excerpt) {
      setError('タイトル、内容、要約は必須項目です');
      return;
    }
    
    if (isPaid && (price <= 0)) {
      setError('有料記事の場合、価格を設定してください');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/articles', {
        title,
        content,
        excerpt,
        price,
        isPaid,
        categories: selectedCategories
      });
      
      router.push(`/articles/${response.data.slug}`);
    } catch (err: any) {
      setError('記事の作成に失敗しました: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">新しい記事を作成</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              className="input-field mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              要約 (100〜200文字程度)
            </label>
            <textarea
              id="excerpt"
              rows={3}
              className="input-field mt-1"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              内容 (Markdown形式)
            </label>
            <textarea
              id="content"
              rows={15}
              className="input-field mt-1 font-mono"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                id="is-paid"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
              />
              <label htmlFor="is-paid" className="ml-2 block text-sm text-gray-900">
                有料記事として公開
              </label>
            </div>
          </div>
          
          {isPaid && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                価格 (円)
              </label>
              <input
                type="number"
                id="price"
                min="100"
                step="100"
                className="input-field mt-1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required={isPaid}
              />
            </div>
          )}
          
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー (複数選択可)
              </label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center">
                    <input
                      id={`category-${category._id}`}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={selectedCategories.includes(category._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category._id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category._id));
                        }
                      }}
                    />
                    <label htmlFor={`category-${category._id}`} className="ml-2 block text-sm text-gray-900">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary mr-3"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '送信中...' : '公開する'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}