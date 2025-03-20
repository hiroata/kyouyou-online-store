import { Article } from '@/types/article';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHandsClapping } from '@fortawesome/free-solid-svg-icons';

interface ArticleDetailProps {
  article: Article;
}

const ArticleDetail = ({ article }: ArticleDetailProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price);
  };

  return (
    <div className="content-layout">
      <div className="main-content">
        <article className="article-detail">
          <div className="article-header">
            <h1 className="article-title text-3xl font-bold mb-6">{article.title}</h1>
            <div className="article-meta mb-4">
              <div className="article-author flex items-center">
                <div className="author-avatar w-10 h-10 rounded-full overflow-hidden mr-4">
                  <Image
                    src={article.author.avatarUrl}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="author-info">
                  <div className="author-name font-medium">{article.author.name}</div>
                  <div className="article-date text-gray-600 text-sm">
                    {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
              <div className="article-rating">
                <div className="star-rating">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={i < article.rating.average ? 'text-primary' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="rating-value ml-2">{article.rating.average}</span>
                <span className="rating-count text-gray-600">({article.rating.count}件)</span>
              </div>
            </div>
            <div className="article-tags mb-6">
              {article.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <Image
            src={article.imageUrl}
            alt={article.title}
            width={800}
            height={400}
            className="article-featured-image rounded-lg mb-8"
          />

          <div className="article-content prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>

      <div className="sidebar">
        <div className="article-sidebar sticky top-4">
          <div className="article-price-card">
            <div className="price-label text-gray-600 text-sm">価格</div>
            <div className="price-value text-3xl font-bold">{formatPrice(article.price)}</div>
            <div className="price-tax text-gray-600 text-xs">(税込)</div>
            <button className="btn-purchase">購入する</button>
            <div className="reward-info text-sm text-gray-600">
              購入で1%獲得 ({formatPrice(article.price * 0.01)}相当)
            </div>
            <div className="article-claps mt-4 text-center">
              <FontAwesomeIcon icon={faHandsClapping} className="text-primary text-xl" />
              <span className="clap-count ml-2 text-gray-600">
                {article.claps.toLocaleString()}人が応援
              </span>
            </div>
          </div>

          <div className="article-toc">
            <h3 className="text-lg font-medium mb-2">目次</h3>
            <nav className="toc-nav">
              {/* 目次の内容は記事のコンテンツから動的に生成する必要があります */}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
