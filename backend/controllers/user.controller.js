const User = require('../models/user.model');
const Article = require('../models/article.model');
const { AppError } = require('../middleware/error.middleware');

/**
 * 管理者用ユーザー一覧取得
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    // クエリパラメータ
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // 検索フィルター
    const filter = {};
    
    if (req.query.role) {
      filter.role = { $in: [req.query.role] };
    }
    
    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { displayName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    
    // ユーザー取得
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // 総数取得
    const totalCount = await User.countDocuments(filter);
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      results: users.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ユーザープロファイル取得
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    // ユーザー検索
    const user = await User.findOne({ username });
    
    if (!user) {
      return next(new AppError('ユーザーが見つかりません', 404));
    }
    
    // 作家の場合は記事数も取得
    let articleStats = null;
    if (user.role.includes('author')) {
      articleStats = await Article.aggregate([
        {
          $match: {
            authorId: user._id,
            status: 'published',
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ]);
    }
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        user: user.getPublicProfile(),
        articleStats: articleStats && articleStats.length > 0 
          ? {
              count: articleStats[0].count,
              averageRating: Math.round(articleStats[0].averageRating * 10) / 10 || 0,
            }
          : {
              count: 0,
              averageRating: 0,
            },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 作家一覧取得
 */
exports.getAuthors = async (req, res, next) => {
  try {
    // クエリパラメータ
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // 作家検索
    const authors = await User.find({
      role: { $in: ['author'] },
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('username displayName bio profileImage');
    
    // 記事数と平均評価を付加
    const authorsWithStats = await Promise.all(
      authors.map(async (author) => {
        const stats = await Article.aggregate([
          {
            $match: {
              authorId: author._id,
              status: 'published',
            },
          },
          {
            $group: {
              _id: null,
              articleCount: { $sum: 1 },
              averageRating: { $avg: '$rating' },
            },
          },
        ]);
        
        return {
          ...author.toObject(),
          stats: stats.length > 0
            ? {
                articleCount: stats[0].articleCount,
                averageRating: Math.round(stats[0].averageRating * 10) / 10 || 0,
              }
            : {
                articleCount: 0,
                averageRating: 0,
              },
        };
      })
    );
    
    // 総数取得
    const totalCount = await User.countDocuments({
      role: { $in: ['author'] },
      isActive: true,
    });
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      results: authors.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        authors: authorsWithStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 管理者用ユーザー更新
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 更新できるフィールド
    const allowedUpdates = {
      displayName: req.body.displayName,
      role: req.body.role,
      isActive: req.body.isActive,
    };
    
    // undefinedのフィールドを除外
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });
    
    // ユーザー更新
    const updatedUser = await User.findByIdAndUpdate(
      id,
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!updatedUser) {
      return next(new AppError('ユーザーが見つかりません', 404));
    }
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 管理者用ユーザー削除
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // ユーザー検索
    const user = await User.findById(id);
    
    if (!user) {
      return next(new AppError('ユーザーが見つかりません', 404));
    }
    
    // 記事の確認
    const articles = await Article.find({ authorId: id });
    
    // 記事がある場合は削除ではなく無効化
    if (articles.length > 0) {
      user.isActive = false;
      await user.save();
      
      return res.status(200).json({
        status: 'success',
        message: 'ユーザーには記事があるため、アカウントは無効化されました',
      });
    }
    
    // 記事がない場合は削除
    await User.findByIdAndDelete(id);
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      message: 'ユーザーが削除されました',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 管理者用ユーザーステータス変更
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return next(new AppError('isActive フィールドは必須です', 400));
    }
    
    // ユーザー更新
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!updatedUser) {
      return next(new AppError('ユーザーが見つかりません', 404));
    }
    
    // レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};
