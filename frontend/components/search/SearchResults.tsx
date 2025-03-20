'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Article } from '../../types/article';
import { searchArticles, SearchResponse, SearchParams, highlightSearchTerm } from '../../lib/search';

interface SearchResultsProps {
  initialData?: SearchResponse<Article>;
}

export default function SearchResults({ initialData }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState('');
  const [searchResponse, setSearchResponse] = useState<SearchResponse<Article> | null>(
    initialData || null
  );

  const currentPage = parseInt(searchParams?.get('page') || '1');
  const searchQuery = searchParams?.get('q') || '';

  useEffect(() => {
    if (!searchParams) return;

    const fetchResults = async () => {
      setLoading(true);
      setError('');

      try {
        const params: SearchParams = {
          query: searchQuery,
          page: currentPage,
          limit: 12,
          sort: {
            field: (searchParams.get('sortField') as any) || 'createdAt',
            direction: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc'
          },
          filters: {
            category: searchParams.getAll('category'),
            tags: searchParams.getAll('tag'),
            isPaid: searchParams.get('isPaid') === 'true',
            price: {
              min: parseInt(searchParams.get('minPrice') || '0'),
              max: parseInt(searchParams.get('maxPrice') || '10000')
            }
          }
        };

        const response = await searchArticles(params);
        setSearchResponse(response);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('page', page.toString());
    router.push(`/articles?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!searchResponse || searchResponse.items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">検索結果が見つかりませんでした</p>
        <Link href="/articles" className="text-primary-600 hover:text-primary-800">
          すべての記事を表示
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResponse.items.map((article) => (
          <div key={article._id} className="bg-white overflow-hidden shadow rounded-lg">
            {article.coverImage && (
              <div className="w-full h-48 bg-gray-200">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                <Link
                  href={`/articles/${article.slug}`}
                  className="text-primary-600 hover:text-primary-800"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(article.title, searchQuery)
                  }}
                />
              </h2>
              <p
                className="text-gray-600 mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerm(article.excerpt, searchQuery)
                }}
              />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">
                  {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                </span>
                <span className="font-bold text-primary-700">
                  {article.isPaid ? `¥${article.price.toLocaleString()}` : '無料'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {searchResponse.totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            前へ
          </button>
          
          {[...Array(searchResponse.totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === searchResponse.totalPages}
            className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}