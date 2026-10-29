'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cn } from 'cn';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex flex-1 truncate text-left', className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  invalid,
  helperText,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: 'sm' | 'default';
  invalid?: boolean;
  helperText?: string;
}) {
  const isInvalid =
    Boolean(invalid) || props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <div className="relative w-full">
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        data-size={size}
        {...props}
        aria-invalid={isInvalid || undefined}
        className={cn(
          'group flex w-full items-center justify-between gap-1.5 border bg-transparent p-3 text-sm transition-colors outline-none select-none',
          isInvalid
            ? 'border-primary text-primary'
            : 'border-muted text-select-text hover:border-border focus-visible:border-border data-popup-open:border-border data-popup-open:bg-select-trigger-open',
          'data-disabled:border-muted data-disabled:bg-input-disabled-background data-disabled:text-select-disabled-text data-disabled:hover:border-muted data-disabled:cursor-not-allowed',
          'data-[size=sm]:px-2.5 data-[size=sm]:py-2',
          className
        )}
      >
        <div className="flex flex-1 items-center gap-1.5 truncate *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5">
          {children}
        </div>
        <SelectPrimitive.Icon
          render={
            <ChevronDownIcon
              className={cn(
                'pointer-events-none transition-transform duration-200 group-data-popup-open:rotate-180',
                isInvalid ? 'text-primary' : 'text-select-text'
              )}
            />
          }
        />
      </SelectPrimitive.Trigger>

      {helperText ? (
        <p className="text-primary absolute -bottom-5 left-3 text-[12px]">{helperText}</p>
      ) : null}
    </div>
  );
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  align = 'start',
  sideOffset = 0,
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="bg-background isolate z-3 w-(--anchor-width)"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            'ring-border relative isolate z-3 max-h-60 w-full min-w-full overflow-x-hidden overflow-y-auto shadow-md ring-1 duration-100',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('text-select-label text-xs font-medium', className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, value, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      value={value}
      data-slot="select-item"
      className={cn(
        'group/item text-foreground relative flex w-full cursor-default items-center gap-3 p-3 text-sm transition-colors outline-none select-none',
        'data-highlighted:bg-select-hover data-highlighted:text-select-hover-text',
        'aria-selected:bg-select-selected aria-selected:text-select-selected-text',
        'aria-selected:data-highlighted:bg-select-selected aria-selected:data-highlighted:text-select-selected-text',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'border-border flex size-5 shrink-0 items-center justify-center border bg-transparent',
          'group-data-highlighted/item:bg-select-hover group-data-highlighted/item:text-select-hover-text',
          'group-aria-selected/item:border-select-selected-text group-aria-selected/item:bg-select-selected group-aria-selected/item:text-select-selected-text',
          'group-aria-selected/item:group-data-highlighted/item:bg-select-selected group-aria-selected/item:group-data-highlighted/item:text-select-selected-text'
        )}
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "bg-background top-0 z-2 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bg-background bottom-0 z-2 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
