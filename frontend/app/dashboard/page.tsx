'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import {
  getPurchaseHistory,
  getSubscriptionStatus,
  createPortalSession
} from '../../lib/stripe';

interface Purchase {
  _id: string;
  articleId: string;
  title: string;
  price: number;
  purchaseDate: string;
}

interface SubscriptionStatus {
  active: boolean;
  plan?: string;
  currentPeriodEnd?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const [purchaseData, subscriptionData] = await Promise.all([
          getPurchaseHistory(),
          getSubscriptionStatus()
        ]);
        setPurchases(purchaseData);
        setSubscription(subscriptionData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleManageSubscription = async () => {
    try {
      const portalUrl = await createPortalSession();
      window.location.href = portalUrl;
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <p className="text-center">ログインが必要です</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">マイページ</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* プロフィール情報 */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">プロフィール情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">メールアドレス</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">表示名</p>
                  <p>{user.displayName || 'Not set'}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/profile"
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  プロフィールを編集 →
                </Link>
              </div>
            </div>

            {/* サブスクリプション情報 */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">サブスクリプション</h2>
              {loading ? (
                <p>読み込み中...</p>
              ) : (
                <div>
                  {subscription?.active ? (
                    <div>
                      <p className="text-green-600 font-medium mb-2">有効なプラン: {subscription.plan}</p>
                      {subscription.currentPeriodEnd && (
                        <p className="text-sm text-gray-600 mb-4">
                          次回更新日: {new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 mb-4">現在アクティブなサブスクリプションはありません</p>
                  )}
                  <button
                    onClick={handleManageSubscription}
                    className="btn-primary text-sm"
                  >
                    サブスクリプションを管理
                  </button>
                </div>
              )}
            </div>

            {/* 購入履歴 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">購入履歴</h2>
              {loading ? (
                <p>読み込み中...</p>
              ) : purchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          記事タイトル
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          購入日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          価格
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchases.map((purchase) => (
                        <tr key={purchase._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/articles/${purchase.articleId}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              {purchase.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(purchase.purchaseDate).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ¥{purchase.price.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">購入履歴がありません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}