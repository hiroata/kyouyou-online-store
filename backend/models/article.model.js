const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'タイトルは必須です'],
    trim: true,
    maxlength: [100, 'タイトルは100文字以内にしてください'],
  },
  content: {
    type: String,
    required: [true, '本文は必須です'],
  },
  summary: {
    type: String,
    required: [true, '要約は必須です'],
    trim: true,
    maxlength: [300, '要約は300文字以内にしてください'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    required: [true, '価格は必須です'],
    min: [100, '価格は100円以上にしてください'],
    max: [100000, '価格は10万円以下にしてください'],
  },
  imageUrl: {
    type: String,
    required: [true, 'サムネイル画像は必須です'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    required: [true, 'カテゴリーは必須です'],
    enum: ['ビジネス', 'テクノロジー', 'マーケティング', '自己啓発', 'その他'],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  purchaseCount: {
    type: Number,
    default: 0,
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  claps: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    count: {
      type: Number,
      default: 1,
    },
  }],
  purchasedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// インデックス
articleSchema.index({ title: 'text', summary: 'text' }); // 全文検索用
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ createdAt: -1 });

// 仮想フィールド
articleSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

articleSchema.virtual('totalClaps').get(function() {
  return this.claps.reduce((acc, curr) => acc + curr.count, 0);
});

articleSchema.virtual('ratingCount').get(function() {
  return this.ratings.length;
});

// 記事が公開可能か確認するメソッド
articleSchema.methods.canPublish = function() {
  return this.title &&
    this.content &&
    this.summary &&
    this.price &&
    this.imageUrl &&
    this.category;
};

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
