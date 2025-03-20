const Stripe = require('stripe');

/**
 * Stripeインスタンスを初期化
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // 最新のAPI version
});

/**
 * 支払いインテント作成
 * @param {number} amount 支払い金額（日本円）
 * @param {string} customerId Stripeカスタマーid
 * @returns {Promise<Stripe.PaymentIntent>} 支払いインテント
 */
const createPaymentIntent = async (amount, customerId) => {
  try {
    return await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      customer: customerId,
      payment_method_types: ['card'],
      capture_method: 'automatic',
    });
  } catch (error) {
    throw new Error(`支払いインテント作成エラー: ${error.message}`);
  }
};

/**
 * カスタマー作成/取得
 * @param {string} email ユーザーメールアドレス
 * @param {string} name ユーザー名
 * @returns {Promise<Stripe.Customer>} Stripeカスタマー
 */
const createOrGetCustomer = async (email, name) => {
  try {
    // 既存のカスタマーを検索
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // 新規カスタマーを作成
    return await stripe.customers.create({
      email,
      name,
    });
  } catch (error) {
    throw new Error(`カスタマー作成/取得エラー: ${error.message}`);
  }
};

/**
 * Webhookイベント検証
 * @param {string} payload リクエストボディ
 * @param {string} signature Stripeシグネチャ
 * @returns {Stripe.Event} 検証済みイベント
 */
const constructEvent = (payload, signature) => {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    throw new Error(`Webhookイベント検証エラー: ${error.message}`);
  }
};

module.exports = {
  stripe,
  createPaymentIntent,
  createOrGetCustomer,
  constructEvent,
};
