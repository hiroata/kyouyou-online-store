import { loadStripe } from '@stripe/stripe-js';

// Stripe public key from environment variable
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface CreateCheckoutSessionResponse {
  sessionId: string;
}

export interface CreateCheckoutSessionParams {
  articleId: string;
  priceId?: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  try {
    const response = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('支払い処理の開始に失敗しました');
    }

    const data: CreateCheckoutSessionResponse = await response.json();
    
    // Stripeのチェックアウトページにリダイレクト
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripeの初期化に失敗しました');
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

export interface CreatePortalSessionResponse {
  url: string;
}

// カスタマーポータルセッションの作成
export async function createPortalSession() {
  try {
    const response = await fetch('/api/customer-portal', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('カスタマーポータルの作成に失敗しました');
    }

    const data: CreatePortalSessionResponse = await response.json();
    return data.url;
  } catch (error) {
    console.error('Portal session error:', error);
    throw error;
  }
}

// サブスクリプション価格の取得
export async function getSubscriptionPrices() {
  try {
    const response = await fetch('/api/subscription/prices');
    if (!response.ok) {
      throw new Error('価格情報の取得に失敗しました');
    }
    return response.json();
  } catch (error) {
    console.error('Get prices error:', error);
    throw error;
  }
}

// 購入履歴の取得
export async function getPurchaseHistory() {
  try {
    const response = await fetch('/api/purchases');
    if (!response.ok) {
      throw new Error('購入履歴の取得に失敗しました');
    }
    return response.json();
  } catch (error) {
    console.error('Get purchase history error:', error);
    throw error;
  }
}

// サブスクリプション状態の取得
export async function getSubscriptionStatus() {
  try {
    const response = await fetch('/api/subscription/status');
    if (!response.ok) {
      throw new Error('サブスクリプション状態の取得に失敗しました');
    }
    return response.json();
  } catch (error) {
    console.error('Get subscription status error:', error);
    throw error;
  }
}