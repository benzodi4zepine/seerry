import type { ForwardedRef } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonType =
  | 'default'
  | 'primary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'ghost';

// Helper type to override types (overrides onClick)
type MergeElementProps<
  T extends React.ElementType,
  P extends Record<string, unknown>
> = Omit<React.ComponentProps<T>, keyof P> & P;

type ElementTypes = 'button' | 'a';

type Element<P extends ElementTypes = 'button'> = P extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

type BaseProps<P> = {
  buttonType?: ButtonType;
  buttonSize?: 'default' | 'lg' | 'md' | 'sm';
  // Had to do declare this manually as typescript would assume e was of type any otherwise
  onClick?: (
    e: React.MouseEvent<P extends 'a' ? HTMLAnchorElement : HTMLButtonElement>
  ) => void;
};

type ButtonProps<P extends React.ElementType> = {
  as?: P;
} & MergeElementProps<P, BaseProps<P>>;

function Button<P extends ElementTypes = 'button'>(
  {
    buttonType = 'default',
    buttonSize = 'default',
    as,
    children,
    className,
    ...props
  }: ButtonProps<P>,
  ref?: React.Ref<Element<P>>
): JSX.Element {
  const buttonStyle = [
    'inline-flex items-center justify-center border leading-5 font-medium rounded-md focus:outline-none transition ease-in-out duration-150 cursor-pointer disabled:opacity-50 whitespace-nowrap',
  ];
  switch (buttonType) {
    case 'primary':
      buttonStyle.push(
        'text-[#050505] border-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:from-emerald-300 hover:to-cyan-400 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0'
      );
      break;
    case 'danger':
      buttonStyle.push(
        'text-white border border-red-600 bg-red-600/80 hover:bg-red-600 focus:border-red-700 focus:ring-2 focus:ring-red-500 active:bg-red-700'
      );
      break;
    case 'warning':
      buttonStyle.push(
        'text-white border border-amber-500 bg-amber-500/90 hover:bg-amber-400 focus:ring-2 focus:ring-amber-500'
      );
      break;
    case 'success':
      buttonStyle.push(
        'text-white border border-emerald-500 bg-emerald-500/90 hover:bg-emerald-400 focus:ring-2 focus:ring-emerald-400'
      );
      break;
    case 'ghost':
      buttonStyle.push(
        'text-slate-200 bg-transparent border-transparent hover:border-[#1f1f2a] hover:text-white focus:border-[#1f1f2a]'
      );
      break;
    default:
      buttonStyle.push(
        'text-slate-100 bg-[#0f0f14] border border-[#1a1a1f] hover:border-[#23c584] hover:text-white hover:bg-[#12121a] group-hover:text-white group-hover:border-[#23c584] focus:border-[#23c584]'
      );
  }

  switch (buttonSize) {
    case 'sm':
      buttonStyle.push('px-2.5 py-1.5 text-xs button-sm');
      break;
    case 'lg':
      buttonStyle.push('px-6 py-3 text-base button-lg');
      break;
    case 'md':
    default:
      buttonStyle.push('px-4 py-2 text-sm button-md');
  }

  buttonStyle.push(className ?? '');

  if (as === 'a') {
    return (
      <a
        className={twMerge(buttonStyle)}
        {...(props as React.ComponentProps<'a'>)}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
      >
        <span className="flex items-center">{children}</span>
      </a>
    );
  } else {
    return (
      <button
        className={twMerge(buttonStyle)}
        {...(props as React.ComponentProps<'button'>)}
        ref={ref as ForwardedRef<HTMLButtonElement>}
      >
        <span className="flex items-center">{children}</span>
      </button>
    );
  }
}

export default React.forwardRef(Button) as typeof Button;
