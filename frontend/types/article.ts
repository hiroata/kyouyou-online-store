export interface Article {
  _id: string;
  title: string;
  content: string;
  price: number;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  categories: {
    _id: string;
    name: string;
  }[];
  isPaid: boolean;
  slug: string;
  coverImage?: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleFormData {
  title: string;
  content: string;
  price: number;
  categories: string[];
  isPaid: boolean;
  coverImage?: string;
  excerpt: string;
}