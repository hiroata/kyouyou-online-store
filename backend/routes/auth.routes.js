const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    ユーザー登録
 * @access  Public
 */
router.post(
  '/register',
  [
    body('firebaseUid').notEmpty().withMessage('FirebaseユーザーIDは必須です'),
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('ユーザー名は3〜30文字である必要があります')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('ユーザー名は英数字、アンダースコア、ハイフンのみ使用可能です'),
    body('displayName')
      .isLength({ min: 2, max: 50 })
      .withMessage('表示名は2〜50文字である必要があります'),
  ],
  authController.register
);

/**
 * @route   GET /api/auth/me
 * @desc    現在のユーザー情報を取得
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/me
 * @desc    ユーザープロフィールの更新
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  [
    body('displayName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('表示名は2〜50文字である必要があります'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('プロフィールは500文字以下である必要があります'),
  ],
  authController.updateProfile
);

/**
 * @route   POST /api/auth/become-author
 * @desc    作家として登録
 * @access  Private
 */
router.post('/become-author', authenticate, authController.becomeAuthor);

/**
 * @route   POST /api/auth/upload-profile-image
 * @desc    プロフィール画像アップロード
 * @access  Private
 */
router.post('/upload-profile-image', authenticate, authController.uploadProfileImage);

module.exports = router;
