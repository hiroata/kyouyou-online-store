// APIレスポンスの共通型
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// ページネーション型
export interface PaginatedResponse<T> {
  results: number;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  data: T;
}

// ユーザープロフィール型
export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  username: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
  role: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 記事型
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: UserProfile;
  price: number;
  categories: Category[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  purchaseCount: number;
  rating: number;
  ratingCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// カテゴリー型
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string;
  image?: string;
  order: number;
}

// 購入履歴型
export interface Purchase {
  id: string;
  article: Article;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchasedAt: string;
}

// レビュー型
export interface Review {
  id: string;
  user: UserProfile;
  article: Article;
  rating: number;
  content: string;
  createdAt: string;
}

// 収益情報型
export interface EarningsStats {
  totalSales: number;
  totalRevenue: number;
  totalEarnings: number;
  totalFees: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// 作家情報型
export interface AuthorStats {
  articleCount: number;
  averageRating: number;
  totalSales: number;
  totalEarnings: number;
}

// APIリクエストパラメータ型
export interface ArticleFilters {
  category?: string;
  tag?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt?: string;
  price: number;
  categories?: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  featuredImage?: string;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {}

export interface PaymentIntentData {
  articleId: string;
}

export interface ReviewData {
  rating: number;
  content: string;
}
