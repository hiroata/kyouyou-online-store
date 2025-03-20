export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: Author;
  publishedAt: string;
  price: number;
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  imageUrl: string;
  summary: string;
  claps: number;
}

export interface ArticleMetadata {
  id: string;
  title: string;
  author: Author;
  publishedAt: string;
  price: number;
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  imageUrl: string;
  summary: string;
  claps: number;
}
