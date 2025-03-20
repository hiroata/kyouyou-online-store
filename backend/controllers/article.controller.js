const Article = require('../models/article.model');
const User = require('../models/user.model');
const Purchase = require('../models/purchase.model');
const Category = require('../models/category.model');
const { AppError } = require('../middleware/error.middleware');

/**
 * 記事一覧の取得
 * フィルタリング、ページネーション、ソートに対応
 */
exports.getAllArticles = async (req, res, next) => {
  try {
    // クエリオブジェクトのコピーを作成
    const queryObj = { ...req.query };
    
    // 除外するフィールド
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // 公開済み記事のみを表示（管理者以外）
    if (!req.user || !req.user.role.includes('admin')) {
      queryObj.status = 'published';
    }
    
    // 検索機能
    if (req.query.search) {
      queryObj.$text = { $search: req.query.search };
    }
    
    // カテゴリーフィルター
    if (req.query.category) {
      queryObj.categories = req.query.category;
    }
    
    // タグフィルター
    if (req.query.tag) {
      queryObj.tags = req.query.tag;
    }
    
    // 価格範囲フィルター
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = parseInt(req.query.maxPrice);
    }
    
    // クエリ作成
    let query = Article.find(queryObj);
    
    // 著者情報を結合
    query = query.populate({
      path: 'authorId',
      select: 'username displayName profileImage',
    });
    
    // カテゴリー情報を結合
    query = query.populate({
      path: 'categories',
      select: 'name slug',
    });
    
    // ソート
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // デフォルトは公開日時の降順
      query = query.sort('-publishedAt');
    }
    
    // フィールド選択
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      // デフォルトでは__vを除外
      query = query.select('-__v');
    }
    
    // ページネーション
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    
    // 記事総数を取得
    const totalCount = await Article.countDocuments(queryObj);
    
    // クエリ実行
    const articles = await query;
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      results: articles.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        articles,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 記事の詳細取得
 * 認証済みユーザーと購入済みチェック付き
 */
exports.getArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // slugまたはIDで記事を検索
    const article = await Article.findOne({
      $or: [
        { slug },
        { _id: mongoose.isValidObjectId(slug) ? slug : null }
      ]
    })
    .populate({
      path: 'authorId',
      select: 'username displayName profileImage bio',
    })
    .populate({
      path: 'categories',
      select: 'name slug',
    });
    
    if (!article) {
      return next(new AppError('記事が見つかりません', 404));
    }
    
    // 非公開記事へのアクセス権確認
    if (article.status !== 'published') {
      // 未認証または管理者でも著者でもない場合はアクセス不可
      if (!req.user || 
          (req.user._id.toString() !== article.authorId._id.toString() && 
           !req.user.role.includes('admin'))) {
        return next(new AppError('この記事にアクセスする権限がありません', 403));
      }
    }
    
    // 購入済みかどうかのフラグ
    let hasPurchased = false;
    
    // 認証済みユーザーの場合は購入履歴を確認
    if (req.user) {
      // 著者または管理者は常にアクセス可能
      if (req.user._id.toString() === article.authorId._id.toString() || 
          req.user.role.includes('admin')) {
        hasPurchased = true;
      } else {
        // 購入履歴を確認
        const purchase = await Purchase.findOne({
          userId: req.user._id,
          articleId: article._id,
          status: 'completed',
        });
        
        hasPurchased = !!purchase;
      }
    }
    
    // 無料記事は購入不要
    if (article.price === 0) {
      hasPurchased = true;
    }
    
    // 閲覧数インクリメント（重複カウント防止のため簡易実装）
    await Article.findByIdAndUpdate(
      article._id,
      { $inc: { viewCount: 1 } }
    );
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        article,
        hasPurchased,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 記事の作成
 * 作家ロールが必要
 */
exports.createArticle = async (req, res, next) => {
  try {
    // リクエストボディから必要なフィールドを取得
    const {
      title,
      content,
      excerpt,
      price,
      categories,
      tags,
      status,
      featuredImage,
    } = req.body;
    
    // 必須フィールドのチェック
    if (!title || !content) {
      return next(new AppError('タイトルと本文は必須です', 400));
    }
    
    // 作家かどうかチェック
    if (!req.user.role.includes('author') && !req.user.role.includes('admin')) {
      return next(new AppError('記事を作成するには作家権限が必要です', 403));
    }
    
    // カテゴリーの存在確認（指定されている場合）
    if (categories && categories.length > 0) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: categories },
      });
      
      if (categoryCount !== categories.length) {
        return next(new AppError('指定されたカテゴリーの一部が存在しません', 400));
      }
    }
    
    // デフォルト抜粋の作成（指定がない場合）
    let finalExcerpt = excerpt;
    if (!excerpt) {
      // 本文から最初の100文字を抽出
      finalExcerpt = content.substring(0, 100).replace(/[\r\n]+/g, ' ') + '...';
    }
    
    // 記事の作成
    const article = await Article.create({
      title,
      content,
      excerpt: finalExcerpt,
      price: price || 0, // デフォルトは無料
      authorId: req.user._id,
      categories: categories || [],
      tags: tags || [],
      status: status || 'draft', // デフォルトは下書き
      featuredImage: featuredImage || '',
    });
    
    // 関連情報を取得
    await article.populate([
      {
        path: 'authorId',
        select: 'username displayName profileImage',
      },
      {
        path: 'categories',
        select: 'name slug',
      },
    ]);
    
    // レスポンス
    res.status(201).json({
      status: 'success',
      data: {
        article,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 記事の更新
 * 著者または管理者のみ可能
 */
exports.updateArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // slugまたはIDで記事を検索
    const article = await Article.findOne({
      $or: [
        { slug },
        { _id: mongoose.isValidObjectId(slug) ? slug : null }
      ]
    });
    
    if (!article) {
      return next(new AppError('記事が見つかりません', 404));
    }
    
    // 著者または管理者のみ更新可能
    if (article.authorId.toString() !== req.user._id.toString() && 
        !req.user.role.includes('admin')) {
      return next(new AppError('この記事を更新する権限がありません', 403));
    }
    
    // 更新可能なフィールド
    const allowedUpdates = [
      'title', 
      'content', 
      'excerpt', 
      'price', 
      'categories', 
      'tags', 
      'status',
      'featuredImage',
    ];
    
    // 更新するフィールドをフィルタリング
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // 公開ステータスが変更された場合の処理
    if (updates.status === 'published' && article.status !== 'published') {
      updates.publishedAt = new Date();
    }
    
    // 記事の更新
    const updatedArticle = await Article.findByIdAndUpdate(
      article._id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );
    
    // 関連情報を取得
    await updatedArticle.populate([
      {
        path: 'authorId',
        select: 'username displayName profileImage',
      },
      {
        path: 'categories',
        select: 'name slug',
      },
    ]);
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        article: updatedArticle,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 記事の削除
 * 著者または管理者のみ可能
 */
exports.deleteArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // slugまたはIDで記事を検索
    const article = await Article.findOne({
      $or: [
        { slug },
        { _id: mongoose.isValidObjectId(slug) ? slug : null }
      ]
    });
    
    if (!article) {
      return next(new AppError('記事が見つかりません', 404));
    }
    
    // 著者または管理者のみ削除可能
    if (article.authorId.toString() !== req.user._id.toString() && 
        !req.user.role.includes('admin')) {
      return next(new AppError('この記事を削除する権限がありません', 403));
    }
    
    // 販売済み記事の場合は物理削除せず、アーカイブに変更
    if (article.purchaseCount > 0) {
      article.status = 'archived';
      await article.save();
      
      return res.status(200).json({
        status: 'success',
        message: '記事はアーカイブされました',
      });
    }
    
    // 未販売の記事は完全に削除
    await Article.findByIdAndDelete(article._id);
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      message: '記事は完全に削除されました',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 著者の記事一覧を取得
 */
exports.getAuthorArticles = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    // ユーザー名からユーザーを検索
    const author = await User.findOne({ username });
    
    if (!author) {
      return next(new AppError('ユーザーが見つかりません', 404));
    }
    
    // クエリオブジェクト作成
    const queryObj = { authorId: author._id };
    
    // 管理者または自分自身でない場合は公開記事のみ表示
    if (!req.user || 
        (req.user._id.toString() !== author._id.toString() && 
         !req.user.role.includes('admin'))) {
      queryObj.status = 'published';
    }
    
    // ページネーション
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // クエリ実行
    const articles = await Article.find(queryObj)
      .populate({
        path: 'categories',
        select: 'name slug',
      })
      .sort('-publishedAt')
      .skip(skip)
      .limit(limit);
    
    // 記事総数を取得
    const totalCount = await Article.countDocuments(queryObj);
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        author: author.getPublicProfile(),
        articles,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * アイキャッチ画像のアップロード（実装例）
 */
exports.uploadFeaturedImage = async (req, res, next) => {
  try {
    // ファイルアップロードの処理
    // multerミドルウェアで処理されたファイル情報を使用
    if (!req.file) {
      return next(new AppError('画像ファイルをアップロードしてください', 400));
    }
    
    // 実際にはS3などにアップロードし、URLを取得
    const imageUrl = `https://example.com/uploads/${req.file.filename}`;
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
