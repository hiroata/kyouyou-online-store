const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // 著者ID
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // 支払い金額
    amount: {
      type: Number,
      required: true,
      min: [0, '支払い金額は0以上である必要があります'],
    },
    // 通貨
    currency: {
      type: String,
      required: true,
      default: 'JPY',
      enum: ['JPY'],
    },
    // 支払いステータス
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    // Stripe振込ID
    stripeTransferId: {
      type: String,
      default: '',
    },
    // 対象期間
    period: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    // 販売記事数
    salesCount: {
      type: Number,
      required: true,
    },
    // 対象購入ID（複数）
    purchases: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
    }],
    // 振込完了日時
    paidAt: {
      type: Date,
      default: null,
    },
    // メモ（管理者用）
    note: {
      type: String,
      default: '',
    },
  },
  {
    // created_at, updated_atフィールドを自動生成
    timestamps: true,
  }
);

// インデックス作成
paymentSchema.index({ authorId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'period.start': 1, 'period.end': 1 });
paymentSchema.index({ paidAt: 1 });

// モデル作成
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
