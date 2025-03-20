import { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

type NextPageWithLayout = AppProps['Component'] & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

interface CustomAppProps extends AppProps {
  Component: NextPageWithLayout;
}

function MyApp({ Component, pageProps }: CustomAppProps) {
  // コンポーネント独自のレイアウトがある場合はそれを使用
  const getLayout = Component.getLayout || ((page) => <MainLayout>{page}</MainLayout>);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      
      <AuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default MyApp;
