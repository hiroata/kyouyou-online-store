import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from './firebase';
import type {
  ApiResponse,
  PaginatedResponse,
  UserProfile,
  Article,
  CreateArticleData,
  UpdateArticleData,
  PaymentIntentData,
  ArticleFilters,
  EarningsStats,
  Purchase,
} from '../types/api';

// カスタムエラー型
interface CustomError extends Error {
  response?: {
    data: { message: string };
    status: number;
  };
  request?: any;
  statusCode?: number;
  displayMessage?: string;
}

// APIレスポンス型
type ApiResponseType<T> = {
  status: 'success' | 'error';
  data: T;
  message?: string;
};

// APIクライアントのインスタンス
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: CustomError) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponseType<any>>) => {
    return response.data;
  },
  (error: CustomError) => {
    let message = '予期せぬエラーが発生しました';
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          message = data.message || 'リクエストに誤りがあります';
          break;
        case 401:
          message = 'ログインが必要です';
          break;
        case 403:
          message = 'アクセス権限がありません';
          break;
        case 404:
          message = 'リソースが見つかりません';
          break;
        case 500:
          message = 'サーバーエラーが発生しました';
          break;
        default:
          message = data.message || `エラーが発生しました(${status})`;
      }
      
      error.statusCode = status;
      error.message = message;
    } else if (error.request) {
      message = 'サーバーに接続できません';
    }
    
    error.displayMessage = message;
    return Promise.reject(error);
  }
);

// APIレスポンスの型安全なラッパー関数
const wrapResponse = <T>(promise: Promise<ApiResponseType<T>>): Promise<T> => {
  return promise.then(response => response.data);
};

// ユーザー関連API
export const userApi = {
  register: (userData: { firebaseUid: string; email: string; username: string; displayName: string }) =>
    wrapResponse(api.post<ApiResponseType<UserProfile>>('/auth/register', userData)),
  getProfile: () =>
    wrapResponse(api.get<ApiResponseType<UserProfile>>('/auth/me')),
  updateProfile: (data: Partial<UserProfile>) =>
    wrapResponse(api.put<ApiResponseType<UserProfile>>('/auth/me', data)),
  becomeAuthor: () =>
    wrapResponse(api.post<ApiResponseType<UserProfile>>('/auth/become-author')),
  getUserProfile: (username: string) =>
    wrapResponse(api.get<ApiResponseType<UserProfile>>(`/users/profile/${username}`)),
  getAuthors: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<UserProfile[]>>(`/users/authors?page=${page}&limit=${limit}`),
};

// 記事関連API
export const articleApi = {
  getArticles: (params?: ArticleFilters) =>
    api.get<PaginatedResponse<Article[]>>('/articles', { params }),
  getArticle: (slug: string) =>
    wrapResponse(api.get<ApiResponseType<Article>>(`/articles/${slug}`)),
  createArticle: (data: CreateArticleData) =>
    wrapResponse(api.post<ApiResponseType<Article>>('/articles', data)),
  updateArticle: (slug: string, data: UpdateArticleData) =>
    wrapResponse(api.put<ApiResponseType<Article>>(`/articles/${slug}`, data)),
  deleteArticle: (slug: string) =>
    wrapResponse(api.delete<ApiResponseType<void>>(`/articles/${slug}`)),
  getAuthorArticles: (username: string, page = 1, limit = 10) =>
    api.get<PaginatedResponse<Article[]>>(`/articles/author/${username}?page=${page}&limit=${limit}`),
  uploadImage: (formData: FormData) =>
    wrapResponse(api.post<ApiResponseType<{ imageUrl: string }>>('/articles/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })),
};

// 決済関連API
export const paymentApi = {
  createPaymentIntent: (data: PaymentIntentData) =>
    wrapResponse(api.post<ApiResponseType<{ clientSecret: string }>>('/payments/create-intent', data)),
  getPurchases: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Purchase[]>>(`/payments/purchases?page=${page}&limit=${limit}`),
  getEarnings: (startDate?: Date, endDate?: Date) =>
    wrapResponse(api.get<ApiResponseType<EarningsStats>>('/payments/earnings', {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    })),
  checkPurchase: (articleId: string) =>
    wrapResponse(api.get<ApiResponseType<{ hasPurchased: boolean }>>(`/payments/check/${articleId}`)),
};

export default api;
