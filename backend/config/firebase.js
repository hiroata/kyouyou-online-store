const admin = require('firebase-admin');

/**
 * Firebase Admin SDK初期化
 * 注: 環境変数FIREBASE_ADMIN_CREDENTIALSには、Firebase Consoleからダウンロードした
 * サービスアカウントの秘密鍵（JSON）をBase64エンコードした文字列を設定する
 */
const initializeFirebaseAdmin = () => {
  try {
    if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
      throw new Error('Firebase Admin認証情報が設定されていません');
    }

    // Base64デコードして元のJSONに戻す
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS, 'base64').toString()
    );

    // Firebase Admin初期化
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin初期化成功');
  } catch (error) {
    console.error(`Firebase Admin初期化エラー: ${error.message}`);
    process.exit(1);
  }
};

/**
 * トークン検証
 * @param {string} idToken Firebaseから取得したIDトークン
 * @returns {Promise<admin.auth.DecodedIdToken>} デコードされたトークン情報
 */
const verifyIdToken = async (idToken) => {
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw new Error(`トークン検証エラー: ${error.message}`);
  }
};

/**
 * ユーザー情報取得
 * @param {string} uid ユーザーID
 * @returns {Promise<admin.auth.UserRecord>} ユーザー情報
 */
const getUser = async (uid) => {
  try {
    return await admin.auth().getUser(uid);
  } catch (error) {
    throw new Error(`ユーザー情報取得エラー: ${error.message}`);
  }
};

module.exports = {
  initializeFirebaseAdmin,
  verifyIdToken,
  getUser,
};
