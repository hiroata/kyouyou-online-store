const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  commission: {
    type: Number,
    required: true,
  },
  sellerAmount: {
    type: Number,
    required: true,
  },
  paymentIntent: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  refund: {
    status: {
      type: String,
      enum: ['none', 'requested', 'processing', 'completed', 'failed'],
      default: 'none',
    },
    reason: String,
    requestedAt: Date,
    processedAt: Date,
    refundId: String,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      // 支払い関連の機密情報を削除
      delete ret.paymentIntent;
      delete ret.metadata;
      return ret;
    }
  }
});

// インデックス
purchaseSchema.index({ article: 1, buyer: 1 }, { unique: true }); // 同じ記事の重複購入を防ぐ
purchaseSchema.index({ seller: 1, status: 1 });
purchaseSchema.index({ createdAt: -1 });
purchaseSchema.index({ paymentIntent: 1 });

// 購入合計金額を計算する静的メソッド
purchaseSchema.statics.calculateTotalAmount = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        buyer: mongoose.Types.ObjectId(userId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

// 売上合計金額を計算する静的メソッド
purchaseSchema.statics.calculateTotalEarnings = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        seller: mongoose.Types.ObjectId(userId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$sellerAmount' }
      }
    }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

// 購入完了時のフック
purchaseSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    // 記事の購入数を更新
    await mongoose.model('Article').findByIdAndUpdate(doc.article, {
      $inc: { purchaseCount: 1 },
      $addToSet: { purchasedBy: doc.buyer }
    });

    // ユーザーの購入済み記事リストを更新
    await mongoose.model('User').findByIdAndUpdate(doc.buyer, {
      $addToSet: { purchasedArticles: doc.article }
    });

    // 売り手の収益を更新
    await mongoose.model('User').findByIdAndUpdate(doc.seller, {
      $inc: {
        'earnings.total': doc.sellerAmount,
        'earnings.pending': doc.sellerAmount
      }
    });
  }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
