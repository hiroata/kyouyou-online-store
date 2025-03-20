const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  profileImage: {
    type: String,
    default: '', // デフォルトのプロフィール画像URL
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  stripeCustomerId: {
    type: String,
    sparse: true, // nullを許容するユニークインデックス
  },
  purchasedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  }],
  publishedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  }],
  earnings: {
    total: {
      type: Number,
      default: 0,
    },
    pending: {
      type: Number,
      default: 0,
    },
    lastPayout: {
      amount: Number,
      date: Date,
    },
  },
  emailSettings: {
    marketing: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true, // createdAt, updatedAtを自動生成
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.stripeCustomerId; // クライアントに送信しない
      return ret;
    }
  }
});

// インデックス
userSchema.index({ firebaseUid: 1 });
userSchema.index({ email: 1 });
userSchema.index({ stripeCustomerId: 1 });

// 仮想フィールド
userSchema.virtual('articlesCount').get(function() {
  return this.publishedArticles.length;
});

userSchema.virtual('purchasesCount').get(function() {
  return this.purchasedArticles.length;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
