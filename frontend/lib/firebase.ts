import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase設定
// 注意: 実際のAPIキーは.env.localで管理し、Gitで管理しないこと
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// 認証サービスの取得
export const auth = getAuth(app);
export default app;
