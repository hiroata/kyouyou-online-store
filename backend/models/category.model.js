const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    // カテゴリー名
    name: {
      type: String,
      required: [true, 'カテゴリー名は必須です'],
      trim: true,
      unique: true,
      maxlength: [50, 'カテゴリー名は50文字以下にしてください'],
    },
    // URLスラッグ
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    // カテゴリー説明
    description: {
      type: String,
      trim: true,
      maxlength: [500, '説明は500文字以下にしてください'],
    },
    // 親カテゴリー（階層構造用）
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    // カテゴリー画像
    image: {
      type: String,
      default: '',
    },
    // 表示順序
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    // created_at, updated_atフィールドを自動生成
    timestamps: true,
  }
);

// インデックス作成
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });

// 保存前に自動的にスラッグを生成
categorySchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

// 仮想フィールド：サブカテゴリー
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

// モデル作成
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
