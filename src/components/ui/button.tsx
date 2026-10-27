import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const buttonVariants = cva(
  'py-4 px-8 rounded-[40px] border border-transparent text-sm transition-all font-medium uppercase cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-secondary hover:bg-transparent hover:border-primary hover:text-primary active:bg-primary-active active:text-primary disabled:bg-primary-disabled disabled:text-primary-hover disabled:border-0',
        primaryV2:
          'bg-transparent text-primary hover:border-primary active:bg-primary-active disabled:bg-muted disabled:text-muted-foreground',
        secondary:
          'bg-transparent border-border text-primary-foreground hover:bg-secondary-button-hover hover:border-secondary-button-hover-border hover:text-secondary-button-hover-text active:bg-secondary-button-active active:text-secondary-button-active-text active:shadow-md disabled:bg-primary-disabled disabled:text-primary-hover disabled:border-0',
        ghost:
          'hover:border-ghost-button-hover-border hover:text-ghost-button-hover-text active:bg-ghost-button-active active:text-ghost-button-active-text disabled:bg-muted disabled:text-muted-foreground',
        icon: 'text-primary-foreground p-3 hover:border-icon-button-hover-border hover:text-icon-button-hover-text active:bg-icon-button-active active:text-icon-button-active-text disabled:bg-transparent disabled:text-muted',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
