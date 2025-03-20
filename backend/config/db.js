const mongoose = require('mongoose');

/**
 * MongoDB接続を確立する関数
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB接続成功: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB接続エラー: ${error.message}`);
    process.exit(1);
  }
};

/**
 * MongoDB接続を閉じる関数（テスト用）
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB接続を閉じました');
  } catch (error) {
    console.error(`MongoDB切断エラー: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };
