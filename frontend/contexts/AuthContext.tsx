'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';

type User = FirebaseUser | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthError extends Error {
  code?: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // メール認証が完了していない場合の処理
        if (!currentUser.emailVerified) {
          console.warn('メールアドレスが未認証です');
        }
        
        try {
          // バックエンドにユーザー情報を同期
          await api.post('/users/sync', {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          });
        } catch (error) {
          console.error('ユーザー情報の同期に失敗しました:', error);
        }
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ログイン処理
  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      // Firebase persistence modeの設定
      if (remember) {
        await setPersistence(auth, browserLocalPersistence);
      } else {
        await setPersistence(auth, browserSessionPersistence);
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        throw new Error('メールアドレスが未認証です。確認メールをご確認ください。');
      }
    } catch (error) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/user-not-found':
          throw new Error('アカウントが見つかりません');
        case 'auth/wrong-password':
          throw new Error('パスワードが間違っています');
        case 'auth/too-many-requests':
          throw new Error('ログイン試行回数が多すぎます。しばらく時間をおいてお試しください');
        default:
          throw new Error('ログインに失敗しました: ' + authError.message);
      }
    }
  };

  // 新規登録処理
  const register = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);
      
      // バックエンドにユーザー情報を保存
      await api.post('/users', {
        uid: userCredential.user.uid,
        email,
        name
      });
    } catch (error) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/email-already-in-use':
          throw new Error('このメールアドレスは既に使用されています');
        case 'auth/invalid-email':
          throw new Error('無効なメールアドレスです');
        case 'auth/operation-not-allowed':
          throw new Error('この操作は許可されていません');
        case 'auth/weak-password':
          throw new Error('パスワードが弱すぎます');
        default:
          throw new Error('アカウント作成に失敗しました: ' + authError.message);
      }
    }
  };

  // ログアウト処理
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('ログアウトに失敗しました');
    }
  };

  // パスワードリセット処理
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/user-not-found':
          throw new Error('このメールアドレスのアカウントが見つかりません');
        case 'auth/invalid-email':
          throw new Error('無効なメールアドレスです');
        default:
          throw new Error('パスワードリセットメールの送信に失敗しました');
      }
    }
  };

  // プロフィール更新処理
  const updateUserProfile = async (displayName: string) => {
    if (!user) throw new Error('ユーザーがログインしていません');
    
    try {
      await updateProfile(user, { displayName });
      await api.put(`/users/${user.uid}`, { name: displayName });
    } catch (error) {
      throw new Error('プロフィールの更新に失敗しました');
    }
  };

  // メール認証メール再送信
  const sendVerificationEmail = async () => {
    if (!user) throw new Error('ユーザーがログインしていません');
    
    try {
      await sendEmailVerification(user);
    } catch (error) {
      throw new Error('確認メールの送信に失敗しました');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    sendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
