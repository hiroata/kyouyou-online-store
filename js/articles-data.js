// 記事の詳細データ
const articlesData = {
    'article-1': {
        id: 'article-1',
        title: '【革命】Threads完全攻略マニュアル',
        category: 'ビジネス',
        categorySlug: 'business',
        image: 'https://placehold.jp/800x400.png',
        rating: 5,
        reviewCount: 142,
        tags: ['Twitter', '副業'],
        price: 4980,
        claps: 1134,
        author: {
            name: '寝稼ぎさん',
            avatar: 'https://placehold.jp/60x60.png',
            publishDate: '2024/10/19 20:44',
            bio: 'SNSマーケティングのプロフェッショナル。10年以上のマーケティング経験を持ち、多くの企業のSNS戦略をサポート。'
        },
        preview: `
            <h2>はじめに</h2>
            <p>Threadsは、Instagramから派生した新しいテキストベースのソーシャルメディアプラットフォームです。このマニュアルでは、Threadsを使いこなすための完全なガイドを提供します。</p>
            
            <h2>Threadsとは？</h2>
            <p>Threadsは、Metaが開発した新しいSNSで、Twitterの強力な競合として注目されています。テキストベースのコミュニケーションに特化し、Instagramのアカウントと連携して使用できます。</p>
            
            <div class="article-preview-message">
                <h3>ここまでがプレビューです</h3>
                <p>続きを読むには記事を購入してください。</p>
                <div class="article-price">¥4,980</div>
                <div class="article-point">1%獲得 (49円相当)</div>
                <a href="#" class="purchase-btn">購入する</a>
                <p class="purchase-note">※購入後、すぐに全文をお読みいただけます</p>
            </div>
        `,
        fullContent: `
            <!-- 実際のコンテンツはここに入ります（購入後に表示） -->
        `,
        reviews: [
            {
                name: 'Tさん',
                avatar: 'https://placehold.jp/30x30.png',
                date: '2024/10/25',
                rating: 5,
                content: '非常に詳細で実践的なガイドです。早速実践したところ、フォロワーが増え始めました！'
            },
            {
                name: 'SNS初心者',
                avatar: 'https://placehold.jp/30x30.png',
                date: '2024/10/20',
                rating: 5,
                content: 'SNS初心者の私でも分かりやすい内容でした。ステップバイステップで解説されているので、実践しやすいです。'
            }
        ]
    },
    'article-2': {
        id: 'article-2',
        title: '【1300部突破】-Thunder Fashion Book- マネするだけでオシャレになれる禁断のファッションハック',
        category: '美容・健康',
        categorySlug: 'beauty',
        image: 'https://placehold.jp/800x400.png',
        tags: ['ファッション', 'オシャレ'],
        price: 6480,
        claps: 2808,
        author: {
            name: 'T',
            avatar: 'https://placehold.jp/60x60.png',
            publishDate: '2024/10/01 19:45',
            bio: 'ファッションスタイリスト。多くの有名人のスタイリングを手がける。独自の視点でのファッション提案が評判。'
        },
        preview: `
            <h2>はじめに：ファッションの力</h2>
            <p>ファッションは単なる見た目の問題ではなく、自己表現と自信の源です。本書では、あなたの魅力を最大限に引き出す禁断のファッションハックをご紹介します。</p>
            
            <h2>ファッションの基本原則</h2>
            <p>オシャレに見えるための基本は、「バランス」「カラーコーディネート」「サイズ感」の3つです。これらを理解するだけで、あなたのファッションセンスは格段にアップします。</p>
            
            <div class="article-preview-message">
                <h3>ここまでがプレビューです</h3>
                <p>続きを読むには記事を購入してください。</p>
                <div class="article-price">¥6,480</div>
                <div class="article-point">1%獲得 (64円相当)</div>
                <a href="#" class="purchase-btn">購入する</a>
                <p class="purchase-note">※購入後、すぐに全文をお読みいただけます</p>
            </div>
        `,
        fullContent: `
            <!-- 実際のコンテンツはここに入ります（購入後に表示） -->
        `,
        reviews: [
            {
                name: 'ファッション好き',
                avatar: 'https://placehold.jp/30x30.png',
                date: '2024/10/15',
                rating: 5,
                content: '具体的なコーディネート例が豊富で、実践しやすかったです。特に色の組み合わせについての解説が参考になりました。'
            }
        ]
    },
    'article-4': {
        id: 'article-4',
        title: '【The. 𝕏 】"複数アカウント&最短1ヶ月で"月収100万円を達成した、なまいきくん流𝕏運用術',
        category: 'ビジネス',
        categorySlug: 'business',
        image: 'https://placehold.jp/800x400.png',
        rating: 4.8,
        reviewCount: 39,
        tags: ['Twitter', '副業'],
        price: 49800,
        claps: 12791,
        author: {
            name: 'なまいきくん',
            avatar: 'https://placehold.jp/60x60.png',
            publishDate: '2023/09/01 19:00',
            bio: 'SNSマーケティングのスペシャリスト。複数のアカウントで合計100万フォロワーを抱える。独自の戦略で多くの人の収益化をサポート。'
        },
        preview: `
            <h2>はじめに：𝕏（旧Twitter）の可能性</h2>
            <p>𝕏（旧Twitter）は単なるSNSではなく、適切な戦略で運用すれば大きな収益源になります。私は最短1ヶ月で月収100万円を達成しました。この方法を惜しみなく公開します。</p>
            
            <h2>なぜ複数アカウントが必要なのか</h2>
            <p>一つのアカウントだけでは、リーチに限界があります。複数のアカウントを戦略的に運用することで、相乗効果が生まれ、収益化のチャンスが大幅に広がります。</p>
            
            <div class="article-preview-message">
                <h3>ここまでがプレビューです</h3>
                <p>続きを読むには記事を購入してください。</p>
                <div class="article-price">¥49,800</div>
                <div class="article-point">1%獲得 (498円相当)</div>
                <a href="#" class="purchase-btn">購入する</a>
                <p class="purchase-note">※購入後、すぐに全文をお読みいただけます</p>
            </div>
        `,
        fullContent: `
            <!-- 実際のコンテンツはここに入ります（購入後に表示） -->
        `,
        reviews: [
            {
                name: '副業挑戦者',
                avatar: 'https://placehold.jp/30x30.png',
                date: '2023/10/01',
                rating: 5,
                content: '高額な記事ですが、その価値は十分にあります。実践して2ヶ月目で月20万円の収益が出ました。'
            },
            {
                name: 'マーケター',
                avatar: 'https://placehold.jp/30x30.png',
                date: '2023/09/15',
                rating: 4,
                content: '具体的な戦略が詳細に書かれているので非常に参考になります。ただ、実践には時間がかかるので、即効性を求める人には向かないかも。'
            }
        ]
    }
};
