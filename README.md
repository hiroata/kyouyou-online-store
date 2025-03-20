# 教養オンラインストア

## プロジェクト概要
教養に関する記事を販売・購入できるオンラインプラットフォームです。

## 技術スタック
- フロントエンド
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS

- バックエンド
  - Node.js
  - Express
  - MongoDB (Mongoose)
  - Firebase Authentication
  - Stripe (決済)

## 機能
- ユーザー認証（サインアップ/ログイン）
- 記事の投稿・編集
- 記事の購入
- ダッシュボード（購入/販売履歴）
- 管理者機能

## セットアップ
### フロントエンド（frontend/）
```bash
cd frontend
npm install
npm run dev
```

### バックエンド（backend/）
```bash
cd backend
npm install
npm run dev
```

## 環境変数
### フロントエンド（.env.local）
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### バックエンド（.env）
```
MONGODB_URI=
FIREBASE_ADMIN_CREDENTIALS=
STRIPE_SECRET_KEY=
