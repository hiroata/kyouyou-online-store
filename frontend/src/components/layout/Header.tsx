import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';

const navigation = [
  { name: 'ホーム', href: '/' },
  { name: '記事一覧', href: '/articles' },
  { name: '作家一覧', href: '/authors' },
] as const;

interface NavigationItem {
  name: string;
  href: string;
}

interface MenuItemProps {
  active: boolean;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const MenuItem: FC<MenuItemProps> = ({ active, href, onClick, children }) => {
  const className = `${
    active ? 'bg-secondary-100' : ''
  } block px-4 py-2 text-sm text-secondary-700`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${className} w-full text-left`}>
      {children}
    </button>
  );
};

const Header: FC = () => {
  const router = useRouter();
  const { currentUser, userProfile, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <Disclosure
      as="nav"
      className={`bg-white ${
        isScrolled ? 'shadow-md' : ''
      } sticky top-0 z-10 transition-shadow duration-300`}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-xl font-bold text-primary-600">
                    {process.env.NEXT_PUBLIC_APP_NAME || '教養オンラインストア'}
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        router.pathname === item.href
                          ? 'border-b-2 border-primary-500 text-secondary-900'
                          : 'border-b-2 border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {currentUser ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                      <span className="sr-only">ユーザーメニューを開く</span>
                      {userProfile?.profileImage ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={userProfile.profileImage}
                          alt={userProfile.displayName}
                        />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-secondary-400" />
                      )}
                    </Menu.Button>

                    <Transition
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 text-sm text-secondary-700 border-b border-secondary-100">
                          <p className="font-medium">{userProfile?.displayName}</p>
                          <p className="text-xs text-secondary-500">@{userProfile?.username}</p>
                        </div>

                        <Menu.Item>
                          {({ active }) => (
                            <MenuItem active={active} href="/dashboard">
                              マイページ
                            </MenuItem>
                          )}
                        </Menu.Item>

                        {userProfile?.role?.includes('author') && (
                          <>
                            <Menu.Item>
                              {({ active }) => (
                                <MenuItem active={active} href="/dashboard/articles">
                                  記事管理
                                </MenuItem>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <MenuItem active={active} href="/dashboard/earnings">
                                  売上管理
                                </MenuItem>
                              )}
                            </Menu.Item>
                          </>
                        )}

                        <Menu.Item>
                          {({ active }) => (
                            <MenuItem active={active} href="/dashboard/purchases">
                              購入履歴
                            </MenuItem>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <MenuItem active={active} href="/dashboard/profile">
                              プロフィール設定
                            </MenuItem>
                          )}
                        </Menu.Item>

                        {userProfile?.role?.includes('admin') && (
                          <Menu.Item>
                            {({ active }) => (
                              <MenuItem active={active} href="/admin">
                                管理画面
                              </MenuItem>
                            )}
                          </Menu.Item>
                        )}

                        <Menu.Item>
                          {({ active }) => (
                            <MenuItem active={active} onClick={handleLogout}>
                              ログアウト
                            </MenuItem>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-primary-600 hover:bg-secondary-50"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      新規登録
                    </Link>
                  </div>
                )}
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">メニューを開く</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                    router.pathname === item.href
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700'
                  }`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>

            {currentUser && (
              <div className="border-t border-secondary-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {userProfile?.profileImage ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={userProfile.profileImage}
                        alt={userProfile.displayName}
                      />
                    ) : (
                      <UserCircleIcon className="h-10 w-10 text-secondary-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-secondary-800">
                      {userProfile?.displayName}
                    </div>
                    <div className="text-sm font-medium text-secondary-500">
                      @{userProfile?.username}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as="a"
                    href="/dashboard"
                    className="block px-4 py-2 text-base font-medium text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800"
                  >
                    マイページ
                  </Disclosure.Button>

                  {userProfile?.role?.includes('author') && (
                    <>
                      <Disclosure.Button
                        as="a"
                        href="/dashboard/articles"
                        className="block px-4 py-2 text-base font-medium text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800"
                      >
                        記事管理
                      </Disclosure.Button>
                      <Disclosure.Button
                        as="a"
                        href="/dashboard/earnings"
                        className="block px-4 py-2 text-base font-medium text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800"
                      >
                        売上管理
                      </Disclosure.Button>
                    </>
                  )}

                  <Disclosure.Button
                    as="a"
                    href="/dashboard/purchases"
                    className="block px-4 py-2 text-base font-medium text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800"
                  >
                    購入履歴
                  </Disclosure.Button>

                  <Disclosure.Button
                    as="a"
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-base font-medium text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800"
                  >
                    プロフィール設定
                  </Disclosure.Button>

                  {userProfile?.role?.includes('admin') && (
                    <Disclosure.Button
                      as="a"
                      href="/admin"
                      className="block px-4 py-2 text-base font-medium text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800"
                    >
                      管理画面
                    </Disclosure.Button>
                  )}

                  <Disclosure.Button
                    as="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800"
                  >
                    ログアウト
                  </Disclosure.Button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
