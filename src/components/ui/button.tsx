import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const buttonVariants = cva(
  'py-4 px-8 rounded-[40px] border border-transparent text-sm transition-all font-medium uppercase cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-transparent hover:border-primary hover:text-primary active:bg-primary-active active:text-primary disabled:bg-primary-disabled disabled:text-primary-hover disabled:border-0',
        primaryV2:
          'bg-transparent text-primary hover:border-primary active:bg-primary-active disabled:bg-muted disabled:text-muted-foreground',
        secondary:
          'bg-transparent border-primary-text text-primary-text hover:bg-primary-disabled hover:text-muted-foreground active:bg-primary-text active:text-muted-foreground active:shadow-md disabled:bg-primary-disabled disabled:text-primary-hover disabled:border-0',
        ghost:
          'hover:border-border active:bg-muted disabled:bg-muted disabled:text-muted-foreground',
        icon: 'text-primary-text p-3 hover:border-border active:bg-muted active:text-secondary disabled:bg-transparent disabled:text-muted',
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
