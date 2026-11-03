'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { cn } from 'cn';

const DropdownMenu = MenuPrimitive.Root;

function DropdownMenuTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn('cursor-pointer outline-none', className)}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  positionerClassName,
  side = 'bottom',
  align = 'start',
  sideOffset = 0,
  alignOffset = 0,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, 'side' | 'align' | 'sideOffset' | 'alignOffset'> & {
    positionerClassName?: string;
  }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn('isolate z-3', positionerClassName)}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'bg-primary-hover border-muted w-full overflow-hidden rounded-lg border outline-none',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        'text-foreground flex w-full cursor-pointer items-center gap-4 px-4 py-2 text-sm transition-colors outline-none select-none',
        'data-highlighted:bg-muted',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-muted h-px w-full', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
