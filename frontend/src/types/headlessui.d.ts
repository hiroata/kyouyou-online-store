declare module '@headlessui/react' {
  import { ComponentType, ElementType, ReactNode } from 'react';

  interface CommonProps {
    as?: ElementType;
    children?: ReactNode;
    className?: string;
    href?: string;
    onClick?: () => void;
  }

  interface RenderProps {
    open: boolean;
    disabled?: boolean;
  }

  export interface DisclosureProps extends CommonProps {
    defaultOpen?: boolean;
  }

  export interface DisclosureButtonProps extends CommonProps {}

  export interface DisclosurePanelProps extends CommonProps {
    static?: boolean;
    unmount?: boolean;
  }

  export interface MenuProps extends CommonProps {}

  export interface MenuButtonProps extends CommonProps {}

  export interface MenuItemsProps extends CommonProps {}

  export interface MenuItemProps extends CommonProps {
    disabled?: boolean;
  }

  export interface MenuRenderPropArg extends RenderProps {
    active: boolean;
  }

  export interface TransitionProps extends CommonProps {
    show?: boolean;
    appear?: boolean;
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

  export interface TransitionChildProps extends TransitionProps {}

  // コンポーネントの定義
  export const Disclosure: ComponentType<DisclosureProps> & {
    Button: ComponentType<DisclosureButtonProps>;
    Panel: ComponentType<DisclosurePanelProps>;
  };

  export const Menu: ComponentType<MenuProps> & {
    Button: ComponentType<MenuButtonProps>;
    Items: ComponentType<MenuItemsProps>;
    Item: ComponentType<MenuItemProps & {
      children: (props: { active: boolean }) => ReactNode;
    }>;
  };

  export const Transition: ComponentType<TransitionProps> & {
    Child: ComponentType<TransitionChildProps>;
  };
}

// HeroIconsの型定義
declare module '@heroicons/react/24/outline' {
  import { FC, SVGProps } from 'react';
  export const Bars3Icon: FC<SVGProps<SVGSVGElement>>;
  export const XMarkIcon: FC<SVGProps<SVGSVGElement>>;
  export const UserCircleIcon: FC<SVGProps<SVGSVGElement>>;
}

declare module '@heroicons/react/24/solid' {
  import { FC, SVGProps } from 'react';
  export const Bars3Icon: FC<SVGProps<SVGSVGElement>>;
  export const XMarkIcon: FC<SVGProps<SVGSVGElement>>;
  export const UserCircleIcon: FC<SVGProps<SVGSVGElement>>;
}
