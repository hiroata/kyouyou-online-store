const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    ユーザー一覧取得 (管理者用)
 * @access  Private (管理者)
 */
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

/**
 * @route   GET /api/users/profile/:username
 * @desc    ユーザープロファイル取得
 * @access  Public
 */
router.get('/profile/:username', userController.getUserProfile);

/**
 * @route   GET /api/users/authors
 * @desc    作家一覧取得
 * @access  Public
 */
router.get('/authors', userController.getAuthors);

/**
 * @route   PUT /api/users/:id
 * @desc    ユーザー更新 (管理者用)
 * @access  Private (管理者)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    ユーザー削除 (管理者用)
 * @access  Private (管理者)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  userController.deleteUser
);

/**
 * @route   PUT /api/users/status/:id
 * @desc    ユーザーステータス変更 (管理者用)
 * @access  Private (管理者)
 */
router.put(
  '/status/:id',
  authenticate,
  authorize(['admin']),
  userController.updateUserStatus
);

module.exports = router;
