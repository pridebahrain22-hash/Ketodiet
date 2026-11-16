import { useEffect, useRef, useState } from 'react';
import { createSpaceSoundscape, SpaceSoundscape } from './audio/spaceSoundscape';
import { BookPreviewSection } from './components/BookPreviewSection';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { FaqAndFooter } from './components/FaqAndFooter';
import { Hero3DCanvas } from './components/Hero3DCanvas';
import { Navbar } from './components/Navbar';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { PurchaseSection } from './components/PurchaseSection';
import { StoreManagerModal } from './components/StoreManagerModal';
import { WhatsAppSupportButton } from './components/WhatsAppSupportButton';
import {
  BisbBankDetails,
  CurrencyCode,
  DEFAULT_BISB_ACCOUNT,
  DEFAULT_SOCIAL_ACCOUNTS,
  EBOOK_EDITIONS,
  EbookEdition,
  OrderRecord,
  SocialAccounts,
  applyDiscountBhd,
  formatCurrencyPrice,
} from './data/ebookContent';
import { useOfferCountdown } from './hooks/useOfferCountdown';

const BANK_STORAGE_KEY = 'ketolife_bisb_bank_details';
const ORDERS_STORAGE_KEY = 'ketolife_global_orders';
const SOCIAL_STORAGE_KEY = 'ketolife_social_accounts';

export default function App() {
  const [currency, setCurrency] = useState<CurrencyCode>('BHD');
  const [checkoutEdition, setCheckoutEdition] = useState<EbookEdition | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [storeManagerOpen, setStoreManagerOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const soundscapeRef = useRef<SpaceSoundscape | null>(null);
  const scrollBarRef = useRef<HTMLDivElement | null>(null);
  const countdown = useOfferCountdown();

  useEffect(() => {
    let rafId = 0;
    const updateScrollProgress = () => {
      rafId = 0;
      const bar = scrollBarRef.current;
      if (!bar) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    const scheduleUpdate = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateScrollProgress);
      }
    };

    updateScrollProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    const soundscape = createSpaceSoundscape({
      onStateChange: (playing, muted) => {
        setAudioPlaying(playing);
        setAudioMuted(muted);
      },
    });
    soundscapeRef.current = soundscape;
    soundscape.bindFirstInteraction();
    return () => {
      soundscape.dispose();
      soundscapeRef.current = null;
    };
  }, []);

  const [bankDetails, setBankDetails] = useState<BisbBankDetails>(() => {
    try {
      const saved = localStorage.getItem(BANK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<BisbBankDetails>;
        return {
          ...DEFAULT_BISB_ACCOUNT,
          ...parsed,
          benefitPayNumber:
            parsed.benefitPayNumber && parsed.benefitPayNumber.trim() !== '+973'
              ? parsed.benefitPayNumber
              : DEFAULT_BISB_ACCOUNT.benefitPayNumber,
        };
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_BISB_ACCOUNT;
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as OrderRecord[];
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  const [socialAccounts, setSocialAccounts] = useState<SocialAccounts>(() => {
    try {
      const saved = localStorage.getItem(SOCIAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SOCIAL_ACCOUNTS, ...(JSON.parse(saved) as Partial<SocialAccounts>) };
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_SOCIAL_ACCOUNTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(bankDetails));
    } catch {
      // Ignore storage errors
    }
  }, [bankDetails]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(socialAccounts));
    } catch {
      // Ignore storage errors
    }
  }, [socialAccounts]);

  const discountedDigitalBhd = applyDiscountBhd(bankDetails.digitalPriceBhd);
  const primaryPriceLabel = formatCurrencyPrice(discountedDigitalBhd, currency);
  const originalPriceLabel = formatCurrencyPrice(bankDetails.digitalPriceBhd, currency);
  const usdPriceLabel = formatCurrencyPrice(discountedDigitalBhd, 'USD');

  const openDefaultCheckout = () => {
    setCheckoutEdition({
      ...EBOOK_EDITIONS[0],
      numericBhd: discountedDigitalBhd,
      priceBhd: `${discountedDigitalBhd.toFixed(3)} BHD`,
    });
  };

  return (
    <div className="min-h-screen bg-[#04070a] text-stone-100">
      {/* Slim Fixed Top Scroll Progress Bar */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/5 pointer-events-none"
      >
        <div
          ref={scrollBarRef}
          className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-300 transition-transform duration-75 ease-out"
        />
      </div>

      <Navbar
        priceLabel={primaryPriceLabel}
        onBuyClick={openDefaultCheckout}
        audioMuted={audioMuted}
        audioPlaying={audioPlaying}
        onToggleAudio={() => {
          void soundscapeRef.current?.toggleMute();
        }}
      />

      <main>
        <Hero3DCanvas
          priceLabel={primaryPriceLabel}
          originalPriceLabel={originalPriceLabel}
          usdPriceLabel={usdPriceLabel}
          countdownFormatted={countdown.formatted}
          currency={currency}
          onChangeCurrency={(next) => setCurrency(next)}
          onBuyClick={openDefaultCheckout}
          onPreviewPdfClick={() => setPdfModalOpen(true)}
        />

        <BookPreviewSection onOpenPdfModal={() => setPdfModalOpen(true)} />

        <PurchaseSection
          currency={currency}
          onChangeCurrency={setCurrency}
          bankDetails={bankDetails}
          countdownFormatted={countdown.formatted}
          orderCount={orders.length}
          onOpenStoreManager={() => setStoreManagerOpen(true)}
          onSelectEdition={(edition) => setCheckoutEdition(edition)}
        />
      </main>

      <FaqAndFooter />

      <WhatsAppSupportButton />

      <CheckoutDrawer
        edition={checkoutEdition}
        currency={currency}
        onChangeCurrency={setCurrency}
        bankDetails={bankDetails}
        countdownFormatted={countdown.formatted}
        onOrderRecorded={(order) => setOrders((prev) => [order, ...prev])}
        onClose={() => setCheckoutEdition(null)}
      />

      <PdfPreviewModal
        open={pdfModalOpen}
        priceLabel={primaryPriceLabel}
        onClose={() => setPdfModalOpen(false)}
        onBuyClick={openDefaultCheckout}
      />

      <StoreManagerModal
        open={storeManagerOpen}
        onClose={() => setStoreManagerOpen(false)}
        bankDetails={bankDetails}
        onSaveBankDetails={setBankDetails}
        socialAccounts={socialAccounts}
        onSaveSocialAccounts={setSocialAccounts}
        orders={orders}
        onClearOrders={() => setOrders([])}
      />
    </div>
  );
}
