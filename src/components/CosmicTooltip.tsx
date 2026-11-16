import { ReactNode, useId } from 'react';
import { Sparkles } from 'lucide-react';

interface CosmicTooltipProps {
  title: string;
  description: string;
  badge?: string;
  placement?: 'top' | 'bottom';
  align?: 'center' | 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export function CosmicTooltip({
  title,
  description,
  badge,
  placement = 'top',
  align = 'center',
  fullWidth = false,
  className = '',
  children,
}: CosmicTooltipProps) {
  const tooltipId = useId();

  const verticalPosClass = placement === 'top' ? 'bottom-full mb-3' : 'top-full mt-3';

  const horizontalPosClass =
    align === 'right'
      ? 'right-0'
      : align === 'left'
        ? 'left-0'
        : 'left-1/2 -translate-x-1/2';

  const arrowPosClass =
    align === 'right'
      ? 'right-6'
      : align === 'left'
        ? 'left-6'
        : 'left-1/2 -translate-x-1/2';

  const motionClass =
    placement === 'top'
      ? 'translate-y-1.5 group-hover/tooltip:translate-y-0 group-focus-within/tooltip:translate-y-0'
      : '-translate-y-1.5 group-hover/tooltip:translate-y-0 group-focus-within/tooltip:translate-y-0';

  return (
    <div
      className={`relative group/tooltip ${fullWidth ? 'w-full block' : 'inline-flex'} pointer-events-auto ${className}`}
      aria-describedby={tooltipId}
    >
      {children}

      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute z-50 w-64 sm:w-72 rounded-xl bg-[#04070d] border border-emerald-400/50 p-3.5 text-left opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-all duration-200 ease-out shadow-[0_0_28px_rgba(16,185,129,0.34),0_0_14px_rgba(251,191,36,0.22),0_14px_32px_rgba(0,0,0,0.92)] ${verticalPosClass} ${horizontalPosClass} ${motionClass}`}
      >
        {/* Photon Ring Top Accent */}
        <div
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 opacity-90"
        />

        {/* Subtle Inner Event Horizon Halo */}
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-xl bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-400/10 pointer-events-none"
        />

        <div className="relative space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-amber-300">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{title}</span>
            </span>
            {badge && (
              <span className="font-mono text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-400/35 px-1.5 py-0.5 rounded">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-stone-200">{description}</p>
        </div>

        {/* Cosmic Pointer Arrow */}
        <span
          aria-hidden="true"
          className={`absolute w-2.5 h-2.5 rotate-45 bg-[#04070d] border-emerald-400/50 ${arrowPosClass} ${
            placement === 'top' ? '-bottom-[6px] border-r border-b' : '-top-[6px] border-l border-t'
          }`}
        />
      </div>
    </div>
  );
}
