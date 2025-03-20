/**
 * エラーレスポンスの標準形式
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404エラーハンドラー
 * リクエストされたリソースが見つからない場合に使用
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `リクエストされたパス ${req.originalUrl} が見つかりません`);
  next(error);
};

/**
 * グローバルエラーハンドラー
 * アプリケーション全体でのエラー処理を統一
 */
const errorHandler = (err, req, res, next) => {
  console.error('エラー:', err);

  // MongooseのValidationError処理
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    return res.status(400).json({
      status: 'fail',
      message: 'バリデーションエラー',
      details
    });
  }

  // MongooseのCastError処理（無効なID等）
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: '無効なパラメータ',
      details: {
        field: err.path,
        value: err.value,
        message: 'パラメータの型が正しくありません'
      }
    });
  }

  // JWT認証エラー処理
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: '無効なトークン'
    });
  }

  // カスタムApiErrorの処理
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && { details: err.details })
    });
  }

  // その他の予期しないエラーの処理
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'サーバーエラーが発生しました'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  ApiError,
  notFound,
  errorHandler
};
