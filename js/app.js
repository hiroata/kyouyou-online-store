// サンプル記事データ
const articles = [
    {
        id: 'article-1',
        title: '【革命】Threads完全攻略マニュアル',
        category: 'ビジネス',
        categorySlug: 'business',
        image: 'https://placehold.jp/300x200.png',
        rating: 5,
        reviewCount: 142,
        tags: ['Twitter', '副業'],
        price: 4980,
        claps: 1134,
        author: {
            name: '寝稼ぎさん',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2024/10/19 20:44'
        },
        isFavorite: false
    },
    {
        id: 'article-2',
        title: '【1300部突破】-Thunder Fashion Book- マネするだけでオシャレになれる禁断のファッションハック',
        category: '美容・健康',
        categorySlug: 'beauty',
        image: 'https://placehold.jp/300x200.png',
        tags: ['ファッション', 'オシャレ'],
        price: 6480,
        claps: 2808,
        author: {
            name: 'T',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2024/10/01 19:45'
        },
        isFavorite: false
    },
    {
        id: 'article-3',
        title: '法人を作ったけど銀行口座が開設できない！　そんなあなたのための解決策（元銀行員監修）',
        category: 'ビジネス',
        categorySlug: 'business',
        image: 'https://placehold.jp/300x200.png',
        tags: ['口座開設', '法人口座'],
        price: 2880,
        claps: 0,
        author: {
            name: 'どらねこ',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2025/02/06 00:31'
        },
        isFavorite: false
    },
    {
        id: 'article-4',
        title: '【The. 𝕏 】"複数アカウント&最短1ヶ月で"月収100万円を達成した、なまいきくん流𝕏運用術',
        category: 'ビジネス',
        categorySlug: 'business',
        image: 'https://placehold.jp/300x200.png',
        rating: 4.8,
        reviewCount: 39,
        tags: ['Twitter', '副業'],
        price: 49800,
        claps: 12791,
        author: {
            name: 'なまいきくん',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2023/09/01 19:00'
        },
        isFavorite: false
    },
    {
        id: 'article-5',
        title: 'コンテンツ評価総合1位【累計5000部突破】副業初心者向けフリーランス養成講座【お得な副業フルセット】※全7万字',
        category: 'ビジネス',
        categorySlug: 'business',
        image: 'https://placehold.jp/300x200.png',
        rating: 5,
        reviewCount: 11,
        tags: ['副業', 'ネット副業'],
        price: 18900,
        claps: 471,
        author: {
            name: '副業オタクにゃふ～@楽過ぎる副業',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2023/12/31 22:23'
        },
        isFavorite: false
    },
    {
        id: 'article-6',
        title: '【130部完売✨】AI×物販×コピペで月10万を生み出す在宅ワークマニュアル【スキル不要！】',
        category: 'ビジネス',
        categorySlug: 'business',
        image: 'https://placehold.jp/300x200.png',
        price: 29800,
        claps: 418,
        author: {
            name: 'みゆき',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2025/02/21 19:09'
        },
        isFavorite: false
    },
    {
        id: 'article-7',
        title: 'ローソク足の哲学～How to Beat Binary Options～',
        category: 'マネー',
        categorySlug: 'money',
        image: 'https://placehold.jp/300x200.png',
        tags: ['FX', 'バイナリーオプション'],
        price: 30000,
        claps: 5693,
        author: {
            name: 'Profilingk',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2023/03/04 18:00'
        },
        isFavorite: false
    },
    {
        id: 'article-8',
        title: '【最速1日で女ウケコーデGET】究極モテファッションアイテム大全 ◆モテアイテム130越え&コーデ集175越え◆',
        category: '恋愛',
        categorySlug: 'love',
        image: 'https://placehold.jp/300x200.png',
        rating: 5,
        reviewCount: 4,
        tags: ['マッチングアプリ', 'ファッション'],
        price: 14980,
        claps: 1163,
        author: {
            name: 'ラテス@外見改善コンサルReMake',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2025/02/08 19:05'
        },
        isFavorite: false
    },
    {
        id: 'article-9',
        title: '〜三刀流〜月100〜300万を安定して売る「低単価×中単価×高単価」マーケティング',
        category: 'ビジネス',
        categorySlug: 'business',
        image: 'https://placehold.jp/300x200.png',
        tags: ['ネット副業', 'マーケティング'],
        price: 49800,
        claps: 240,
        author: {
            name: 'かけち',
            avatar: 'https://placehold.jp/30x30.png',
            publishDate: '2024/10/18 18:00'
        },
        isFavorite: false
    }
];

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    const articleGrid = document.getElementById('article-grid');
    
    // 記事カードを生成して表示
    renderArticles(articles);
    
    // 記事カード生成関数
    function renderArticles(articlesData) {
        articleGrid.innerHTML = '';
        
        articlesData.forEach(article => {
            const articleCard = createArticleCard(article);
            articleGrid.appendChild(articleCard);
        });
    }
    
    // 記事カードHTML生成関数
    function createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.dataset.id = article.id;
        
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
                    <img src="${article.image}" alt="${article.title}">
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
                <div class="article-author">
                    <div class="author-avatar">
                        <img src="${article.author.avatar}" alt="${article.author.name}">
                    </div>
                    <div class="author-info">
                        <div class="author-name">${article.author.name}</div>
                        <div class="publish-date">${article.author.publishDate}</div>
                    </div>
                    <div class="favorite ${article.isFavorite ? 'active' : ''}">♡</div>
                </div>
            </div>
        `;
        
        // お気に入りボタンのイベントハンドラー
        const favoriteBtn = card.querySelector('.favorite');
        favoriteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.toggle('active');
            // 実際のシステムではここでAPIリクエストを送るなどの処理を行う
        });
        
        return card;
    }
    
    // 検索機能
    const searchForms = document.querySelectorAll('form');
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const keyword = this.querySelector('input').value.trim().toLowerCase();
            if (!keyword) return;
            
            const filteredArticles = articles.filter(article => 
                article.title.toLowerCase().includes(keyword) || 
                article.category.toLowerCase().includes(keyword) ||
                (article.tags && article.tags.some(tag => tag.toLowerCase().includes(keyword)))
            );
            
            renderArticles(filteredArticles);
        });
    });
    
    // タブ切り替え
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            // アクティブなタブを切り替える
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            // 実際のシステムではここでタブに応じたコンテンツをフィルタリングする
        });
    });
    
    // フィルターボタン
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // アクティブなフィルターを切り替える
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.textContent.trim();
            let filteredArticles = [...articles];
            
            if (filter === '有料') {
                filteredArticles = articles.filter(article => article.price > 0);
            } else if (filter === '無料') {
                filteredArticles = articles.filter(article => article.price === 0);
            }
            
            renderArticles(filteredArticles);
        });
    });
    
    // ソートドロップダウンのトグル（サンプル実装）
    const sortToggle = document.querySelector('.sort-toggle');
    if (sortToggle) {
        sortToggle.addEventListener('click', function(e) {
            e.preventDefault();
            // 実際のシステムではここでドロップダウンメニューを表示する
            alert('ソートオプション: 新着順 / 人気順 (1ヶ月) / 人気順 (全期間)');
        });
    }
    
    // ページネーションリンク（サンプル実装）
    const paginationLinks = document.querySelectorAll('.pagination a');
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.parentElement.classList.contains('disabled')) return;
            e.preventDefault();
            // アクティブなページを切り替える
            document.querySelectorAll('.pagination li').forEach(li => li.classList.remove('active'));
            this.parentElement.classList.add('active');
            // 実際のシステムではここでページングAPIを呼び出す
        });
    });
});
