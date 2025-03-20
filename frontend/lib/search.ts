export interface SearchFilters {
  category?: string[];
  price?: {
    min: number;
    max: number;
  };
  isPaid?: boolean;
  tags?: string[];
  author?: string;
}

export interface SortOption {
  field: 'createdAt' | 'price' | 'title' | 'popularity';
  direction: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: SearchFilters;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface SearchResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export async function searchArticles(params: SearchParams): Promise<SearchResponse<any>> {
  try {
    // クエリパラメータの構築
    const queryParams = new URLSearchParams();
    
    if (params.query) {
      queryParams.append('q', params.query);
    }
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params.sort) {
      queryParams.append('sortField', params.sort.field);
      queryParams.append('sortDirection', params.sort.direction);
    }
    
    // フィルターの追加
    if (params.filters) {
      if (params.filters.category) {
        params.filters.category.forEach(cat => 
          queryParams.append('category', cat)
        );
      }
      
      if (params.filters.price) {
        queryParams.append('minPrice', params.filters.price.min.toString());
        queryParams.append('maxPrice', params.filters.price.max.toString());
      }
      
      if (params.filters.isPaid !== undefined) {
        queryParams.append('isPaid', params.filters.isPaid.toString());
      }
      
      if (params.filters.tags) {
        params.filters.tags.forEach(tag => 
          queryParams.append('tag', tag)
        );
      }
      
      if (params.filters.author) {
        queryParams.append('author', params.filters.author);
      }
    }

    const response = await fetch(`/api/articles/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('検索に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 検索クエリのバリデーション
export function validateSearchQuery(query: string): boolean {
  // 最小文字数チェック
  if (query.length < 2) {
    return false;
  }

  // 特殊文字のエスケープ
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // 有効な検索クエリかチェック
  const validQueryRegex = /^[\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/;
  return validQueryRegex.test(escapedQuery);
}

// 検索結果のハイライト
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  return text.replace(regex, '<mark>$1</mark>');
}