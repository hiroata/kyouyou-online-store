import { FC, ReactNode, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // サーバーサイドレンダリングとクライアントサイドレンダリングの差異を防ぐ
  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {mounted ? children : <div className="min-h-[500px]"></div>}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
