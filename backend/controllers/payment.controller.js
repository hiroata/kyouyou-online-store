const Article = require('../models/article.model');
const User = require('../models/user.model');
const Purchase = require('../models/purchase.model');
const Payment = require('../models/payment.model');
const { stripe, calculateFees } = require('../config/stripe');
const { AppError } = require('../middleware/error.middleware');

/**
 * 決済インテント作成
 * 記事購入のためのStripe Payment Intent作成
 */
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { articleId } = req.body;
    
    if (!articleId) {
      return next(new AppError('記事IDは必須です', 400));
    }
    
    // 記事情報を取得
    const article = await Article.findById(articleId).populate({
      path: 'authorId',
      select: 'username displayName email stripeConnectId',
    });
    
    if (!article) {
      return next(new AppError('記事が見つかりません', 404));
    }
    
    // 公開済みの記事かチェック
    if (article.status !== 'published') {
      return next(new AppError('この記事は現在購入できません', 400));
    }
    
    // 既に購入済みかチェック
    const existingPurchase = await Purchase.findOne({
      userId: req.user._id,
      articleId: article._id,
    });
    
    if (existingPurchase) {
      return next(new AppError('この記事は既に購入済みです', 400));
    }
    
    // 自分の記事は購入不可
    if (article.authorId._id.toString() === req.user._id.toString()) {
      return next(new AppError('自分の記事は購入できません', 400));
    }
    
    // 手数料計算
    const { total, platformFee, authorAmount } = calculateFees(article.price);
    
    // Stripe Payment Intent作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'jpy',
      customer: req.user.stripeCustomerId,
      metadata: {
        userId: req.user._id.toString(),
        articleId: article._id.toString(),
        authorId: article.authorId._id.toString(),
        platformFee,
        authorAmount,
      },
      // 将来的にはConnect使用時に有効化
      // transfer_data: {
      //   destination: article.authorId.stripeConnectId,
      //   amount: authorAmount,
      // },
    });
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: total,
        article: {
          id: article._id,
          title: article.title,
          price: article.price,
          authorName: article.authorId.displayName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 購入完了処理
 * Stripe Webhookでも呼び出せるようにする
 */
exports.handlePurchaseComplete = async (paymentIntentId) => {
  try {
    // Stripe Payment Intent取得
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // 既に処理済みかチェック
    const existingPurchase = await Purchase.findOne({
      stripePaymentId: paymentIntentId,
    });
    
    if (existingPurchase) {
      return { status: 'already_processed' };
    }
    
    // メタデータから情報取得
    const {
      userId,
      articleId,
      authorId,
      platformFee,
      authorAmount,
    } = paymentIntent.metadata;
    
    // 記事情報取得
    const article = await Article.findById(articleId);
    
    if (!article) {
      throw new Error('記事が見つかりません');
    }
    
    // 購入レコード作成
    const purchase = await Purchase.create({
      userId,
      articleId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      stripePaymentId: paymentIntent.id,
      status: 'completed',
      platformFee,
      authorAmount,
    });
    
    // 記事の購入数をインクリメント
    await Article.findByIdAndUpdate(
      articleId,
      { $inc: { purchaseCount: 1 } }
    );
    
    return {
      status: 'success',
      purchase,
    };
  } catch (error) {
    console.error('購入完了処理エラー:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

/**
 * Stripe Webhook処理
 */
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    // Webhookシグネチャ検証
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // イベントタイプに応じた処理
    switch (event.type) {
      case 'payment_intent.succeeded':
        // 支払い成功時の処理
        const paymentIntent = event.data.object;
        await exports.handlePurchaseComplete(paymentIntent.id);
        break;
        
      case 'payment_intent.payment_failed':
        // 支払い失敗時の処理
        console.log('支払い失敗:', event.data.object);
        break;
    }
    
    // 正常応答
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * ユーザーの購入履歴取得
 */
exports.getUserPurchases = async (req, res, next) => {
  try {
    // ページネーション
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // 購入履歴取得
    const purchases = await Purchase.find({ userId: req.user._id })
      .populate({
        path: 'articleId',
        select: 'title slug featuredImage authorId',
        populate: {
          path: 'authorId',
          select: 'username displayName',
        },
      })
      .sort('-purchasedAt')
      .skip(skip)
      .limit(limit);
    
    // 総数取得
    const totalCount = await Purchase.countDocuments({ userId: req.user._id });
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      results: purchases.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        purchases,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 著者の販売履歴・収益取得
 */
exports.getAuthorEarnings = async (req, res, next) => {
  try {
    // 期間フィルタリング
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(new Date().setMonth(new Date().getMonth() - 1)); // デフォルトは1ヶ月前から
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : new Date(); // デフォルトは現在
      
    // 集計クエリ
    const salesStats = await Purchase.aggregate([
      {
        $match: {
          status: 'completed',
          purchasedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article',
        },
      },
      {
        $unwind: '$article',
      },
      {
        $match: {
          'article.authorId': req.user._id,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          totalEarnings: { $sum: '$authorAmount' },
          totalFees: { $sum: '$platformFee' },
        },
      },
    ]);
    
    // 最近の販売履歴
    const recentSales = await Purchase.find({
      status: 'completed',
      purchasedAt: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: 'articleId',
        match: { authorId: req.user._id },
        select: 'title slug',
      })
      .populate({
        path: 'userId',
        select: 'username displayName',
      })
      .sort('-purchasedAt')
      .limit(10);
    
    // 有効な販売のみをフィルタリング
    const validSales = recentSales.filter(sale => sale.articleId);
    
    // 記事別売上
    const articleSales = await Purchase.aggregate([
      {
        $match: {
          status: 'completed',
          purchasedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article',
        },
      },
      {
        $unwind: '$article',
      },
      {
        $match: {
          'article.authorId': req.user._id,
        },
      },
      {
        $group: {
          _id: '$articleId',
          title: { $first: '$article.title' },
          slug: { $first: '$article.slug' },
          salesCount: { $sum: 1 },
          totalEarnings: { $sum: '$authorAmount' },
        },
      },
      {
        $sort: { salesCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        stats: salesStats.length > 0 ? salesStats[0] : {
          totalSales: 0,
          totalRevenue: 0,
          totalEarnings: 0,
          totalFees: 0,
        },
        recentSales: validSales,
        topArticles: articleSales,
        period: {
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 記事購入チェック
 */
exports.checkPurchase = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    
    // 記事存在チェック
    const article = await Article.findById(articleId);
    
    if (!article) {
      return next(new AppError('記事が見つかりません', 404));
    }
    
    // 無料記事は誰でもアクセス可能
    if (article.price === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          hasPurchased: true,
          isFree: true,
        },
      });
    }
    
    // 自分の記事または管理者は常にアクセス可能
    if (article.authorId.toString() === req.user._id.toString() || 
        req.user.role.includes('admin')) {
      return res.status(200).json({
        status: 'success',
        data: {
          hasPurchased: true,
          isOwner: article.authorId.toString() === req.user._id.toString(),
        },
      });
    }
    
    // 購入履歴確認
    const purchase = await Purchase.findOne({
      userId: req.user._id,
      articleId: article._id,
      status: 'completed',
    });
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        hasPurchased: !!purchase,
        purchaseDate: purchase ? purchase.purchasedAt : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
