import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'border-muted hover:border-border active:text-primary-text active:placeholder:text-primary-text focus:placeholder:text-primary-text disabled:bg-input-disabled w-full border bg-transparent p-3',
        className
      )}
      {...props}
    />
  );
}

export { Input };
