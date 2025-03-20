'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { SearchFilters } from '../../lib/search';

interface Category {
  _id: string;
  name: string;
}

interface Tag {
  _id: string;
  name: string;
}

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
}

export default function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // カテゴリーとタグの取得
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags')
        ]);

        if (categoriesRes.ok && tagsRes.ok) {
          const [categoriesData, tagsData] = await Promise.all([
            categoriesRes.json(),
            tagsRes.json()
          ]);

          setCategories(categoriesData);
          setTags(tagsData);
        }
      } catch (error) {
        console.error('フィルターの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // URLパラメータからフィルターを復元
  useEffect(() => {
    const params = searchParams;
    if (!params) return;

    const categoryIds = params.getAll('category');
    const tagIds = params.getAll('tag');
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    const paidParam = params.get('isPaid');

    setSelectedCategories(categoryIds);
    setSelectedTags(tagIds);
    setPriceRange({
      min: minPrice ? parseInt(minPrice) : 0,
      max: maxPrice ? parseInt(maxPrice) : 10000
    });
    setIsPaid(paidParam ? paidParam === 'true' : undefined);
  }, [searchParams]);

  // フィルター変更時の処理
  useEffect(() => {
    const filters: SearchFilters = {
      category: selectedCategories,
      tags: selectedTags,
      price: priceRange,
      isPaid
    };

    onFiltersChange(filters);

    // URLパラメータの更新
    const params = new URLSearchParams(searchParams?.toString());
    
    // カテゴリー
    params.delete('category');
    selectedCategories.forEach(cat => params.append('category', cat));
    
    // タグ
    params.delete('tag');
    selectedTags.forEach(tag => params.append('tag', tag));
    
    // 価格範囲
    params.set('minPrice', priceRange.min.toString());
    params.set('maxPrice', priceRange.max.toString());
    
    // 有料/無料
    if (isPaid !== undefined) {
      params.set('isPaid', isPaid.toString());
    } else {
      params.delete('isPaid');
    }

    router.push(`/articles?${params.toString()}`);
  }, [selectedCategories, selectedTags, priceRange, isPaid]);

  if (loading) {
    return <div className="animate-pulse">フィルターを読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* カテゴリーフィルター */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">カテゴリー</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category._id} className="flex items-center">
              <input
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
              <span className="ml-2 text-gray-600">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* タグフィルター */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">タグ</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag._id}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag._id)
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => {
                if (selectedTags.includes(tag._id)) {
                  setSelectedTags(selectedTags.filter(id => id !== tag._id));
                } else {
                  setSelectedTags([...selectedTags, tag._id]);
                }
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* 価格範囲フィルター */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">価格帯</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="0"
              max={priceRange.max}
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
              className="block w-24 px-3 py-2 sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <span>〜</span>
            <input
              type="number"
              min={priceRange.min}
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
              className="block w-24 px-3 py-2 sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <span>円</span>
          </div>
        </div>
      </div>

      {/* 有料/無料フィルター */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">記事タイプ</h3>
        <div className="space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              isPaid === undefined
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setIsPaid(undefined)}
          >
            すべて
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              isPaid === true
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setIsPaid(true)}
          >
            有料記事
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              isPaid === false
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setIsPaid(false)}
          >
            無料記事
          </button>
        </div>
      </div>
    </div>
  );
}