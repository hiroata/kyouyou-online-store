import { GetServerSideProps } from 'next';
import { Article } from '@/types/article';
import ArticleDetail from '@/components/article/ArticleDetail';
import { useRouter } from 'next/router';

interface ArticlePageProps {
  article: Article;
}

export default function ArticlePage({ article }: ArticlePageProps) {
  const router = useRouter();

  // 記事データのフェッチ中の表示
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="breadcrumb py-4">
        <nav className="flex text-sm text-gray-600">
          <a href="/" className="hover:text-gray-900">ホーム</a>
          <span className="mx-2">/</span>
          <span>{article.title}</span>
        </nav>
      </div>
      
      <ArticleDetail article={article} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    // 本番環境では実際のAPIエンドポイントからデータを取得
    const demoArticle: Article = {
      id: '1',
      title: '〖革命〗Threads完全攻略マニュアル',
      content: `
        <h2>はじめに</h2>
        <p>この記事はデモ用のサンプルコンテンツです。実際の「Threads完全攻略マニュアル」の内容ではありません。</p>
        <h2>Threadsとは</h2>
        <p>Threadsは、Instagramから派生したテキストベースのSNSで、Twitterの代替として急速に成長しています。</p>
      `,
      author: {
        id: '1',
        name: '寝稼ぎさん',
        avatarUrl: 'https://static.tips.jp/2024/08/31/BtfPCKhyU5W6LA90HfVgadfFxFKBZqeR.png'
      },
      publishedAt: '2024-10-19T11:44:00.000Z',
      price: 4980,
      rating: {
        average: 5,
        count: 142
      },
      tags: ['Twitter', '副業', 'SNSマーケティング'],
      imageUrl: 'https://static.tips.jp/2024/10/19/e1hQomaywKHxZLHvnSJlki474ixp6e4c.png',
      summary: 'Threadsでフォロワーを増やし、収益化する方法を解説',
      claps: 1146
    };

    return {
      props: {
        article: demoArticle
      }
    };
  } catch (error) {
    return {
      notFound: true
    };
  }
};
