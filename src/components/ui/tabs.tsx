'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';

export interface TabItem {
  label: string;
  href?: string;
  value?: string;
}

interface TabsProps {
  items: TabItem[];
  activeValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  tabClassName?: string;
  inactiveClassName?: string;
}

export function Tabs({
  items,
  activeValue,
  onChange,
  className,
  tabClassName,
  inactiveClassName = 'text-foreground',
}: TabsProps) {
  const pathname = usePathname();

  return (
    <div className={cn('flex text-sm font-medium', className)}>
      {items.map(({ label, href, value }) => {
        const isActive = href ? pathname === href : value === activeValue;

        const classes = cn(
          'flex w-37.5 justify-center pb-3 transition-colors cursor-pointer',
          isActive
            ? 'border-b-2 border-primary text-primary font-semibold'
            : cn('hover:text-primary', inactiveClassName),
          tabClassName
        );

        return href ? (
          <Link key={href} href={href} className={classes}>
            {label}
          </Link>
        ) : (
          <button
            key={value ?? label}
            type="button"
            className={classes}
            onClick={() => value && onChange?.(value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
