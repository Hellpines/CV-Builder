import { cn } from 'cn';

export type LevelTone = 'gray' | 'blue' | 'green' | 'yellow' | 'red';

export const toneClass: Record<LevelTone, string> = {
  gray: 'text-[#626262]',
  blue: 'text-[#29B6F6]',
  green: 'text-[#66BB6A]',
  yellow: 'text-[#FFB800]',
  red: 'text-primary',
};

const trackClass: Record<LevelTone, string> = {
  gray: 'bg-current',
  blue: 'bg-[color-mix(in_srgb,currentColor_50%,black)]',
  green: 'bg-[color-mix(in_srgb,currentColor_50%,black)]',
  yellow: 'bg-[color-mix(in_srgb,currentColor_50%,black)]',
  red: 'bg-[color-mix(in_srgb,currentColor_50%,black)]',
};

const fillClass: Record<LevelTone, string> = {
  gray: 'bg-[color-mix(in_srgb,currentColor_80%,white)]',
  blue: 'bg-current',
  green: 'bg-current',
  yellow: 'bg-current',
  red: 'bg-current',
};

interface LevelBarProps {
  label: string;
  progress: number;
  tone: LevelTone;
  className?: string;
}

export function LevelBar({ label, progress, tone, className }: LevelBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <span className={cn('flex items-center gap-4', className)}>
      <span className={cn('relative block h-1 w-20 shrink-0', toneClass[tone])} aria-hidden="true">
        <span className={cn('absolute inset-0', trackClass[tone])} />
        <span
          className={cn('absolute inset-y-0 left-0', fillClass[tone])}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span className="text-primary-foreground text-sm">{label}</span>
    </span>
  );
}
