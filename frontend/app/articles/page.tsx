'use client';

import { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import SearchBar from '../../components/search/SearchBar';
import SearchFilters from '../../components/search/SearchFilters';
import SearchResults from '../../components/search/SearchResults';
import type { SearchFilters as SearchFiltersType } from '../../lib/search';

export default function ArticlesPage() {
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const handleFiltersChange = (filters: SearchFiltersType) => {
    // フィルターの変更はSearchFiltersコンポーネント内で
    // URLパラメータを更新するため、ここでは特に処理は必要ありません
    console.log('Filters updated:', filters);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">記事一覧</h1>

            {/* 検索バーとフィルターボタン */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
              <div className="w-full">
                <SearchBar
                  placeholder="記事のタイトルや内容を検索..."
                  className="w-full"
                />
              </div>
              <button
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto w-full justify-center"
              >
                <svg
                  className="h-5 w-5 mr-2 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                絞り込み
              </button>
            </div>

            {/* 検索フィルター（モバイルではドロワー、デスクトップではサイドバー） */}
            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
              {/* フィルターパネル（モバイル） */}
              <div
                className={`fixed inset-0 z-40 lg:hidden ${
                  isFiltersVisible ? 'block' : 'hidden'
                }`}
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsFiltersVisible(false)} />
                <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                  <div className="relative w-screen max-w-md">
                    <div className="h-full flex flex-col py-6 bg-white shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <h2 className="text-lg font-medium text-gray-900">
                            絞り込み条件
                          </h2>
                          <button
                            onClick={() => setIsFiltersVisible(false)}
                            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <span className="sr-only">閉じる</span>
                            <svg
                              className="h-6 w-6"
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
                          </button>
                        </div>
                      </div>
                      <div className="mt-6 relative flex-1 px-4 sm:px-6 overflow-y-auto">
                        <SearchFilters onFiltersChange={handleFiltersChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* フィルターパネル（デスクトップ） */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-6">
                  <SearchFilters onFiltersChange={handleFiltersChange} />
                </div>
              </div>

              {/* 検索結果 */}
              <div className="lg:col-span-3">
                <SearchResults />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}