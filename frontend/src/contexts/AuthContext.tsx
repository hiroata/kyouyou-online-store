import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  UserCredential,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { userApi } from '../lib/api';

interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  username: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
  role: string[];
  isActive: boolean;
}

interface AuthError {
  code: string;
  message: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: AuthError | null;
  signup: (email: string, password: string, username: string, displayName?: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  // エラーハンドラー
  const handleError = (error: any): string => {
    console.error('認証エラー:', error);
    
    let message: string;
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'このメールアドレスは既に使用されています';
        break;
      case 'auth/invalid-email':
        message = 'メールアドレスの形式が正しくありません';
        break;
      case 'auth/user-disabled':
        message = 'このアカウントは無効化されています';
        break;
      case 'auth/user-not-found':
        message = 'ユーザーが見つかりません';
        break;
      case 'auth/wrong-password':
        message = 'パスワードが正しくありません';
        break;
      case 'auth/weak-password':
        message = 'パスワードが弱すぎます。6文字以上にしてください';
        break;
      case 'auth/popup-closed-by-user':
        message = 'ログインがキャンセルされました';
        break;
      default:
        message = error.message || '認証エラーが発生しました';
    }
    
    setAuthError({ code: error.code, message });
    return message;
  };

  // ユーザープロファイルの取得
  const fetchUserProfile = async () => {
    try {
      if (auth.currentUser) {
        const response = await userApi.getProfile();
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error('プロファイル取得エラー:', error);
      setUserProfile(null);
    }
  };

  // メール/パスワードでサインアップ
  const signup = async (email: string, password: string, username: string, displayName?: string): Promise<User> => {
    try {
      setAuthError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateFirebaseProfile(userCredential.user, {
        displayName: displayName || username,
      });
      
      await userApi.register({
        firebaseUid: userCredential.user.uid,
        email,
        username,
        displayName: displayName || username,
      });
      
      await fetchUserProfile();
      
      return userCredential.user;
    } catch (error: any) {
      const message = handleError(error);
      throw new Error(message);
    }
  };

  // メール/パスワードでログイン
  const login = async (email: string, password: string): Promise<User> => {
    try {
      setAuthError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile();
      return userCredential.user;
    } catch (error: any) {
      const message = handleError(error);
      throw new Error(message);
    }
  };

  // Googleでログイン
  const loginWithGoogle = async (): Promise<User> => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      try {
        await fetchUserProfile();
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          const user = userCredential.user;
          const emailLocalPart = user.email!.split('@')[0];
          const randomStr = Math.random().toString(36).substring(2, 6);
          const username = `${emailLocalPart}_${randomStr}`;
          
          await userApi.register({
            firebaseUid: user.uid,
            email: user.email!,
            username,
            displayName: user.displayName || username,
          });
          
          await fetchUserProfile();
        }
      }
      
      return userCredential.user;
    } catch (error: any) {
      const message = handleError(error);
      throw new Error(message);
    }
  };

  // ログアウト
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      const message = handleError(error);
      throw new Error(message);
    }
  };

  // パスワードリセットメール送信
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setAuthError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const message = handleError(error);
      throw new Error(message);
    }
  };

  // プロファイル更新
  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await userApi.updateProfile(data);
      setUserProfile(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('プロファイル更新エラー:', error);
      throw error;
    }
  };

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          await fetchUserProfile();
        } catch (error) {
          console.error('プロファイル取得エラー:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    authError,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
