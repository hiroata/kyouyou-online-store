const express = require('express');
const { body } = require('express-validator');
const articleController = require('../controllers/article.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @route   GET /api/articles
 * @desc    記事一覧の取得
 * @access  Public
 */
router.get('/', articleController.getAllArticles);

/**
 * @route   GET /api/articles/:slug
 * @desc    記事の詳細取得
 * @access  Public (一部コンテンツは認証必要)
 */
router.get('/:slug', articleController.getArticle);

/**
 * @route   POST /api/articles
 * @desc    記事の作成
 * @access  Private (作家のみ)
 */
router.post(
  '/',
  authenticate,
  authorize('author'),
  [
    body('title')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('タイトルは5〜100文字である必要があります'),
    body('content')
      .trim()
      .isLength({ min: 100 })
      .withMessage('本文は100文字以上である必要があります'),
    body('price')
      .isInt({ min: 0, max: 100000 })
      .withMessage('価格は0〜100,000円の範囲で設定してください'),
    body('categories')
      .optional()
      .isArray()
      .withMessage('カテゴリーは配列で指定してください'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('タグは配列で指定してください'),
  ],
  articleController.createArticle
);

/**
 * @route   PUT /api/articles/:slug
 * @desc    記事の更新
 * @access  Private (著者または管理者)
 */
router.put(
  '/:slug',
  authenticate,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('タイトルは5〜100文字である必要があります'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 100 })
      .withMessage('本文は100文字以上である必要があります'),
    body('price')
      .optional()
      .isInt({ min: 0, max: 100000 })
      .withMessage('価格は0〜100,000円の範囲で設定してください'),
  ],
  articleController.updateArticle
);

/**
 * @route   DELETE /api/articles/:slug
 * @desc    記事の削除
 * @access  Private (著者または管理者)
 */
router.delete('/:slug', authenticate, articleController.deleteArticle);

/**
 * @route   GET /api/articles/author/:username
 * @desc    著者の記事一覧を取得
 * @access  Public
 */
router.get('/author/:username', articleController.getAuthorArticles);

/**
 * @route   POST /api/articles/upload-image
 * @desc    記事用画像のアップロード
 * @access  Private (作家のみ)
 */
router.post(
  '/upload-image',
  authenticate,
  authorize('author'),
  articleController.uploadFeaturedImage
);

module.exports = router;
