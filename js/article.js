// 記事詳細ページのスクリプト
document.addEventListener('DOMContentLoaded', function() {
    // URLからarticle IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    // 記事詳細コンテナ
    const articleDetailContainer = document.getElementById('article-detail');
    
    // パンくずリスト要素
    const categoryBreadcrumb = document.getElementById('category-breadcrumb');
    const categoryLink = document.getElementById('category-link');
    const articleTitleBreadcrumb = document.getElementById('article-title-breadcrumb');
    
    // おすすめ記事グリッド
    const recommendedGrid = document.getElementById('recommended-grid');
    
    // 記事が存在するか確認
    if (articleId && articlesData[articleId]) {
        const article = articlesData[articleId];
        
        // タイトルを設定
        document.title = article.title + ' - Tips Clone';
        
        // パンくずリストを更新
        categoryLink.textContent = article.category;
        categoryLink.href = `category.html?slug=${article.categorySlug}`;
        articleTitleBreadcrumb.textContent = article.title;
        
        // 記事詳細を生成
        articleDetailContainer.innerHTML = createArticleDetailHtml(article);
        
        // 購入ボタンのイベントハンドラー
        const purchaseBtn = articleDetailContainer.querySelector('.purchase-btn');
        if (purchaseBtn) {
            purchaseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // 実際のシステムでは決済プロセスに進むが、
                // このデモでは購入確認のアラートを表示
                if (confirm(`「${article.title}」を¥${article.price.toLocaleString()}で購入しますか？`)) {
                    alert('※これはデモサイトです。実際の決済は行われません。');
                }
            });
        }
        
        // おすすめ記事を表示（現在の記事以外の記事から3つ）
        const recommendArticles = Object.values(articlesData)
            .filter(a => a.id !== article.id)
            .slice(0, 3);
        
        renderRecommendedArticles(recommendArticles);
    } else {
        // 記事が見つからない場合
        articleDetailContainer.innerHTML = `
            <div class="article-not-found">
                <h2>記事が見つかりませんでした</h2>
                <p>お探しの記事は存在しないか、削除された可能性があります。</p>
                <a href="index.html" class="btn btn-primary">トップページに戻る</a>
            </div>
        `;
    }
    
    // 記事詳細HTML生成関数
    function createArticleDetailHtml(article) {
        let tagsHtml = '';
        if (article.tags && article.tags.length > 0) {
            tagsHtml = `
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            `;
        }
        
        let ratingHtml = '';
        if (article.rating) {
            ratingHtml = `
                <div class="article-header-rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-value">${article.rating}</span>
                    <span class="review-count">(${article.reviewCount}件)</span>
                </div>
            `;
        }
        
        let reviewsHtml = '';
        if (article.reviews && article.reviews.length > 0) {
            const reviewItems = article.reviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <div class="review-author">
                            <div class="review-author-avatar">
                                <img src="${review.avatar}" alt="${review.name}">
                            </div>
                            <div class="review-author-name">${review.name}</div>
                        </div>
                        <div class="review-date">${review.date}</div>
                    </div>
                    <div class="review-rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                    <div class="review-content">
                        <p>${review.content}</p>
                    </div>
                </div>
            `).join('');
            
            reviewsHtml = `
                <div class="review-section">
                    <h2>レビュー (${article.reviews.length}件)</h2>
                    <div class="review-list">
                        ${reviewItems}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="article-header">
                <div class="article-header-category">
                    <a href="category.html?slug=${article.categorySlug}">${article.category}</a>
                </div>
                <h1 class="article-header-title">${article.title}</h1>
                <div class="article-header-meta">
                    ${ratingHtml}
                    <div class="article-header-social">
                        <span class="clap">
                            <span class="clap-icon">👏</span>
                            <span class="clap-count">${article.claps.toLocaleString()}</span>
                        </span>
                        <a href="#" class="favorite">♡</a>
                    </div>
                </div>
                ${tagsHtml}
            </div>
            
            <div class="article-thumbnail">
                <img src="${article.image}" alt="${article.title}">
            </div>
            
            <div class="article-content">
                ${article.preview}
            </div>
            
            <div class="article-author-box">
                <div class="author-avatar-large">
                    <img src="${article.author.avatar}" alt="${article.author.name}">
                </div>
                <div class="author-info-large">
                    <div class="author-name-large">${article.author.name}</div>
                    <div class="author-bio">${article.author.bio}</div>
                </div>
            </div>
            
            <div class="article-share">
                <div class="article-share-title">この記事をシェアする</div>
                <div class="article-share-buttons">
                    <a href="#" title="Twitterでシェア"><i class="fab fa-twitter"></i></a>
                    <a href="#" title="Facebookでシェア"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" title="LINEでシェア"><i class="fab fa-line"></i></a>
                </div>
            </div>
            
            ${reviewsHtml}
        `;
    }
    
    // おすすめ記事表示関数
    function renderRecommendedArticles(articles) {
        recommendedGrid.innerHTML = '';
        
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'article-card';
            
            let ratingHTML = '';
            if (article.rating) {
                ratingHTML = `
                    <div class="article-rating">
                        <span class="stars">★★★★★</span>
                        <span class="rating-value">${article.rating}</span>
                        <span class="review-count">(${article.reviewCount}件)</span>
                    </div>
                `;
            }
            
            let tagsHTML = '';
            if (article.tags && article.tags.length > 0) {
                tagsHTML = `
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                `;
            }
            
            card.innerHTML = `
                <div class="article-image">
                    <a href="article.html?id=${article.id}">
                        <img src="https://placehold.jp/300x200.png" alt="${article.title}">
                    </a>
                </div>
                <div class="article-content">
                    <a href="category.html?slug=${article.categorySlug}" class="article-category">${article.category}</a>
                    <h3 class="article-title">
                        <a href="article.html?id=${article.id}">${article.title}</a>
                    </h3>
                    ${ratingHTML}
                    ${tagsHTML}
                    <div class="article-meta">
                        <div class="clap">
                            <span class="clap-icon">👏</span>
                            <span class="clap-count">${article.claps.toLocaleString()}</span>
                        </div>
                        <div class="price">
                            <div class="price-value">¥${article.price.toLocaleString()}</div>
                            <div class="price-point">1%獲得 (${Math.floor(article.price / 100)}円相当)</div>
                        </div>
                    </div>
                </div>
            `;
            
            recommendedGrid.appendChild(card);
        });
    }
});
