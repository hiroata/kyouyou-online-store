const { auth } = require('../config/firebase');
const User = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');
const { stripe } = require('../config/stripe');

/**
 * ユーザー登録
 * Firebaseで認証後、MongoDBにユーザー情報を保存
 */
exports.register = async (req, res, next) => {
  try {
    const { firebaseUid, email, username, displayName } = req.body;

    // 必要なフィールドの確認
    if (!firebaseUid || !email || !username || !displayName) {
      return next(new AppError('すべての必須フィールドを入力してください', 400));
    }

    // Firebaseでユーザーを確認
    try {
      await auth.getUser(firebaseUid);
    } catch (error) {
      return next(new AppError('無効なFirebaseユーザーIDです', 400));
    }

    // ユーザー名とメールの重複チェック
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(new AppError('このメールアドレスは既に使用されています', 400));
      }
      if (existingUser.username === username) {
        return next(new AppError('このユーザー名は既に使用されています', 400));
      }
    }

    // Stripe顧客作成（購入用）
    const customer = await stripe.customers.create({
      email,
      metadata: {
        firebaseUid,
      },
    });

    // ユーザー作成
    const user = await User.create({
      firebaseUid,
      email,
      username,
      displayName,
      stripeCustomerId: customer.id,
    });

    // 成功レスポンス
    res.status(201).json({
      status: 'success',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 現在のユーザー情報を取得
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // 認証ミドルウェアでセットされたユーザー情報を返す
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ユーザープロフィールの更新
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio } = req.body;
    
    // 更新できるフィールドを制限
    const allowedUpdates = {
      displayName,
      bio,
    };
    
    // undefinedのフィールドを除外
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });
    
    // ユーザー更新
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!updatedUser) {
      return next(new AppError('ユーザーが見つかりません', 404));
    }
    
    // 成功レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser.getPublicProfile(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 作家登録
 */
exports.becomeAuthor = async (req, res, next) => {
  try {
    const user = req.user;
    
    // 既に作家の場合
    if (user.role.includes('author')) {
      return next(new AppError('既に作家として登録されています', 400));
    }
    
    // 作家ロールを追加
    user.role.push('author');
    await user.save();
    
    // Stripe Connectアカウント作成（オプション - 決済連携時に実装）
    // const account = await stripe.accounts.create({
    //   type: 'express',
    //   country: 'JP',
    //   email: user.email,
    //   capabilities: {
    //     transfers: { requested: true },
    //   },
    //   metadata: {
    //     userId: user._id.toString(),
    //   },
    // });
    // 
    // user.stripeConnectId = account.id;
    // await user.save();
    
    // 成功レスポンス
    res.status(200).json({
      status: 'success',
      message: '作家として登録されました',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * プロフィール画像のアップロード（実装例）
 * 実際にはAWS S3やCloudinaryなどを使用して実装
 */
exports.uploadProfileImage = async (req, res, next) => {
  try {
    // ファイルアップロードの処理
    // multerミドルウェアで処理されたファイル情報を使用
    if (!req.file) {
      return next(new AppError('画像ファイルをアップロードしてください', 400));
    }
    
    // 実際にはS3などにアップロードし、URLを取得
    const imageUrl = `https://example.com/uploads/${req.file.filename}`;
    
    // ユーザープロフィールを更新
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    );
    
    // 成功レスポンス
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser.getPublicProfile(),
        imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
