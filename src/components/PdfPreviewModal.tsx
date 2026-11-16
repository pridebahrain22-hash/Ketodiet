import { Lock, ShoppingBag, X } from 'lucide-react';
import {
  BOOK_COVER_IMAGE_URL,
  CHAPTER_TOPIC_CARDS,
  WHATSAPP_SUPPORT_LINK,
  WHATSAPP_SUPPORT_NUMBER,
} from '../data/ebookContent';
import { CosmicTooltip } from './CosmicTooltip';
import { WhatsAppIcon } from './WhatsAppSupportButton';

interface PdfPreviewModalProps {
  open: boolean;
  priceLabel: string;
  onClose: () => void;
  onBuyClick: () => void;
}

export function PdfPreviewModal({ open, priceLabel, onClose, onBuyClick }: PdfPreviewModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#080f16] border border-white/15 rounded-2xl overflow-hidden flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-[#0b131b]">
          <div>
            <h2 id="pdf-modal-title" className="text-base sm:text-lg font-semibold text-white">
              KetoLife Bahrain — Official Edition Overview
            </h2>
            <p className="text-xs text-stone-400">
              Full 24-page English &amp; Arabic PDF unlocks immediately after payment verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CosmicTooltip
              title="Unlock All 24 Bilingual Pages"
              badge="25% OFF"
              description="Proceed to BenefitPay QR or Global USD checkout for instant PDF access."
              placement="bottom"
              align="right"
            >
              <button
                onClick={() => {
                  onClose();
                  onBuyClick();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer tabular-nums"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Unlock Full PDF · {priceLabel}</span>
              </button>
            </CosmicTooltip>
            <button
              onClick={onClose}
              aria-label="Close edition overview"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#04070a]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Official Front Cover Only */}
            <div className="md:col-span-5 bg-[#0b131b] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Official Front Cover</span>
                <span className="font-arabic text-xs text-emerald-300">الغلاف الرسمي</span>
              </div>
              <div className="bg-white p-3 flex items-center justify-center">
                <img
                  src={BOOK_COVER_IMAGE_URL}
                  alt="KetoLife Bahrain Official Cover"
                  className="w-full h-auto max-h-[400px] object-contain"
                />
              </div>
            </div>

            {/* Right: Locked Chapters Index + Instant Purchase / WhatsApp Help */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-[#0b131b] border border-amber-500/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Inside the 24-Page Paid Bilingual eBook</span>
                </div>

                <div className="space-y-3">
                  {CHAPTER_TOPIC_CARDS.map((topic) => (
                    <div
                      key={topic.titleEn}
                      className="border-b border-white/10 last:border-b-0 pb-2.5 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-emerald-400">{topic.pages}</span>
                        <span className="font-arabic text-emerald-300">{topic.titleAr}</span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-0.5">{topic.titleEn}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{topic.scope}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <CosmicTooltip
                  title="Instant Digital Delivery"
                  badge={priceLabel}
                  description="Scan BenefitPay QR, use BisB IBAN, or pay via Wise / SWIFT USD to unlock your PDF immediately."
                  placement="top"
                  align="center"
                  className="flex-1"
                >
                  <button
                    onClick={() => {
                      onClose();
                      onBuyClick();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer tabular-nums"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Buy &amp; Download Full Guide · {priceLabel}</span>
                  </button>
                </CosmicTooltip>
                <a
                  href={`${WHATSAPP_SUPPORT_LINK}?text=${encodeURIComponent(
                    'Hello KetoLife Bahrain! I would like to ask about the 30-Day Keto Guide.',
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#16a34a]/20 hover:bg-[#16a34a]/30 border border-[#16a34a]/50 text-emerald-200 text-xs sm:text-sm font-medium rounded-xl transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#22c55e]" />
                  <span>WhatsApp {WHATSAPP_SUPPORT_NUMBER}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
