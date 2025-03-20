const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // レビュー投稿者ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 記事ID
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    // 評価（1-5）
    rating: {
      type: Number,
      required: [true, '評価は必須です'],
      min: [1, '評価は1以上である必要があります'],
      max: [5, '評価は5以下である必要があります'],
    },
    // レビュー本文
    content: {
      type: String,
      required: [true, 'レビュー本文は必須です'],
      trim: true,
      minlength: [10, 'レビュー本文は10文字以上必要です'],
      maxlength: [1000, 'レビュー本文は1000文字以下にしてください'],
    },
  },
  {
    // created_at, updated_atフィールドを自動生成
    timestamps: true,
  }
);

// インデックス作成
reviewSchema.index({ articleId: 1 });
reviewSchema.index({ userId: 1 });

// ユニークインデックス（一人のユーザーが一つの記事に一つのレビューのみ）
reviewSchema.index({ userId: 1, articleId: 1 }, { unique: true });

// レビュー投稿後に記事の平均評価を更新するスタティックメソッド
reviewSchema.statics.calculateAverageRating = async function(articleId) {
  // 記事に対する全レビューの平均評価を計算
  const result = await this.aggregate([
    {
      $match: { articleId: mongoose.Types.ObjectId(articleId) }
    },
    {
      $group: {
        _id: '$articleId',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  // 平均評価を記事に反映
  try {
    if (result.length > 0) {
      await mongoose.model('Article').findByIdAndUpdate(articleId, {
        rating: Math.round(result[0].averageRating * 10) / 10 // 小数点第一位まで
      });
    } else {
      // レビューが削除されて0件になった場合は0にリセット
      await mongoose.model('Article').findByIdAndUpdate(articleId, {
        rating: 0
      });
    }
  } catch (err) {
    console.error('記事の評価更新エラー:', err);
  }
};

// レビュー保存後のフック
reviewSchema.post('save', function() {
  // 記事の平均評価を更新
  this.constructor.calculateAverageRating(this.articleId);
});

// レビュー削除後のフック
reviewSchema.post('remove', function() {
  // 記事の平均評価を更新
  this.constructor.calculateAverageRating(this.articleId);
});

// モデル作成
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
