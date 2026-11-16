import { Volume2, VolumeX } from 'lucide-react';
import { CosmicTooltip } from './CosmicTooltip';

interface NavbarProps {
  priceLabel: string;
  onBuyClick: () => void;
  audioMuted: boolean;
  audioPlaying: boolean;
  onToggleAudio: () => void;
}

export function Navbar({
  priceLabel,
  onBuyClick,
  audioMuted,
  audioPlaying,
  onToggleAudio,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#04070a]/95 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element wordmark */}
        <a
          href="#hero-3d"
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          KetoLife Bahrain
        </a>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300">
          <a
            href="#why-keto"
            className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            Why It Works
          </a>
          <a
            href="#inside-guide"
            className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            30-Day Roadmap
          </a>
          <a
            href="#editions"
            className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            Global Pricing
          </a>
          <a
            href="#faq"
            className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: Soundscape Mute Toggle + Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleAudio}
            aria-label={audioMuted ? 'Unmute ambient space sound' : 'Mute ambient space sound'}
            aria-pressed={audioPlaying && !audioMuted}
            title={
              audioMuted
                ? 'Unmute ambient space sound'
                : audioPlaying
                  ? 'Mute ambient space sound'
                  : 'Play ambient space sound'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              audioPlaying && !audioMuted
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-white/5 border-white/15 text-stone-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {audioMuted ? (
              <VolumeX className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {audioMuted ? 'Muted' : audioPlaying ? 'Sound On' : 'Sound'}
            </span>
          </button>

          <CosmicTooltip
            title="25% Launch Offer · Instant PDF"
            badge="BHD / USD"
            description="Unlock all 24 bilingual English & Arabic pages immediately via BenefitPay QR, BisB IBAN, or USD transfer."
            placement="bottom"
            align="right"
          >
            <button
              onClick={onBuyClick}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
            >
              Buy eBook · {priceLabel}
            </button>
          </CosmicTooltip>
        </div>
      </div>
    </header>
  );
}
