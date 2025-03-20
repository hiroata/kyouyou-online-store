/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    NEXT_PUBLIC_MAX_FILE_SIZE: string;
  }
}

// HeadlessUI コンポーネントの型定義
declare module '@headlessui/react' {
  export interface DialogProps {
    as?: React.ElementType;
    static?: boolean;
    open?: boolean;
    onClose?: (value: boolean) => void;
    initialFocus?: React.MutableRefObject<HTMLElement | null>;
  }

  export interface TransitionProps {
    as?: React.ElementType;
    show?: boolean;
    appear?: boolean;
    unmount?: boolean;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    beforeEnter?: () => void;
    afterEnter?: () => void;
    beforeLeave?: () => void;
    afterLeave?: () => void;
  }

  export interface MenuProps {
    as?: React.ElementType;
  }

  export interface MenuItemProps {
    as?: React.ElementType;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  }

  export interface DisclosureProps {
    as?: React.ElementType;
    defaultOpen?: boolean;
  }

  export interface DisclosurePanelProps {
    as?: React.ElementType;
    static?: boolean;
    unmount?: boolean;
  }

  export interface DisclosureButtonProps {
    as?: React.ElementType;
  }
}

// HeroIcons の型定義
declare module '@heroicons/react/*' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
