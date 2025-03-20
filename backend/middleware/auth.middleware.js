const { verifyIdToken } = require('../config/firebase');

/**
 * 認証ミドルウェア
 * Firebaseトークンを検証し、ユーザー情報をリクエストオブジェクトに追加
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '認証トークンが必要です' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    
    // ユーザー情報をリクエストオブジェクトに追加
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
    };

    next();
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(401).json({ message: '認証に失敗しました' });
  }
};

/**
 * 管理者権限チェックミドルウェア
 * ユーザーが管理者ロールを持っているか確認
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // カスタムクレームから管理者権限を確認
    const decodedToken = await verifyIdToken(req.headers.authorization.split('Bearer ')[1]);
    if (!decodedToken.admin) {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    next();
  } catch (error) {
    console.error('管理者権限チェックエラー:', error);
    res.status(403).json({ message: 'アクセスが拒否されました' });
  }
};

module.exports = {
  authenticate,
  isAdmin,
};
