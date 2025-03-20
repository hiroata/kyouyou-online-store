const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @route   POST /api/payments/create-intent
 * @desc    決済インテント作成
 * @access  Private
 */
router.post(
  '/create-intent',
  authenticate,
  [
    body('articleId')
      .notEmpty()
      .withMessage('記事IDは必須です'),
  ],
  paymentController.createPaymentIntent
);

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe Webhook処理
 * @access  Public
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

/**
 * @route   GET /api/payments/purchases
 * @desc    ユーザーの購入履歴取得
 * @access  Private
 */
router.get(
  '/purchases',
  authenticate,
  paymentController.getUserPurchases
);

/**
 * @route   GET /api/payments/earnings
 * @desc    著者の販売履歴・収益取得
 * @access  Private (作家のみ)
 */
router.get(
  '/earnings',
  authenticate,
  authorize('author'),
  paymentController.getAuthorEarnings
);

/**
 * @route   GET /api/payments/check/:articleId
 * @desc    記事購入チェック
 * @access  Private
 */
router.get(
  '/check/:articleId',
  authenticate,
  paymentController.checkPurchase
);

module.exports = router;
