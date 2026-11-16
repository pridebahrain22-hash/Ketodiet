import { Check, Clock, Globe, Landmark, QrCode, Settings2, ShieldCheck } from 'lucide-react';
import {
  BENEFITPAY_QR_URL,
  BisbBankDetails,
  CURRENCIES,
  CurrencyCode,
  DISCOUNT_PERCENT,
  EBOOK_EDITIONS,
  EbookEdition,
  WHATSAPP_SUPPORT_LINK,
  WHATSAPP_SUPPORT_NUMBER,
  applyDiscountBhd,
  formatCurrencyPrice,
} from '../data/ebookContent';
import { QrCodeDisplay } from './QrCodeDisplay';
import { WhatsAppIcon } from './WhatsAppSupportButton';

interface PurchaseSectionProps {
  currency: CurrencyCode;
  onChangeCurrency: (next: CurrencyCode) => void;
  bankDetails: BisbBankDetails;
  countdownFormatted: string;
  orderCount: number;
  onOpenStoreManager: () => void;
  onSelectEdition: (edition: EbookEdition) => void;
}

const CURRENCY_LIST: CurrencyCode[] = ['BHD', 'USD', 'SAR', 'AED', 'GBP', 'EUR'];

export function PurchaseSection({
  currency,
  onChangeCurrency,
  bankDetails,
  countdownFormatted,
  orderCount,
  onOpenStoreManager,
  onSelectEdition,
}: PurchaseSectionProps) {
  const defaultGlobalQr =
    bankDetails.globalPayLink.trim() ||
    `${WHATSAPP_SUPPORT_LINK}?text=${encodeURIComponent(
      'Hello KetoLife Bahrain! I want to pay from outside Bahrain in USD for the 30-Day Keto Guide.',
    )}`;

  return (
    <section id="editions" className="bg-[#04070a] text-stone-100 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-wide text-emerald-400">
              Bahrain QR &amp; Global USD Delivery · الدفع عبر QR في البحرين ومن جميع دول العالم
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
              Pay by Scan QR, BHD, or USD Worldwide
            </h2>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              No business CR needed to buy or send: Bahrain customers scan our BenefitPay QR code or
              transfer to BisB IBAN <span className="font-mono text-amber-300">{bankDetails.iban}</span>.
              Foreign customers pay in <strong className="text-white">USD</strong> via Wise, Remitly,
              Revolut, SWIFT (<span className="font-mono text-amber-300">{bankDetails.swiftBic}</span>),
              or scan the Global QR, then upload a screenshot to download instantly.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenStoreManager}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0b131b] hover:bg-[#13202d] border border-emerald-500/35 rounded-lg text-xs font-semibold text-emerald-300 transition-colors cursor-pointer self-start lg:self-auto whitespace-nowrap"
          >
            <Settings2 className="w-4 h-4" />
            <span>Store Manager &amp; Orders ({orderCount})</span>
          </button>
        </div>

        {/* Global Currency Selector + BisB IBAN Summary */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0b131b] border border-white/10 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-stone-400 mr-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Currency:</span>
            </span>
            {CURRENCY_LIST.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onChangeCurrency(code)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  currency === code
                    ? 'bg-emerald-500 text-stone-950 font-semibold'
                    : 'bg-black/30 text-stone-300 hover:text-white'
                }`}
              >
                {CURRENCIES[code].label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Landmark className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-stone-300">{bankDetails.bankName}</span>
            <span aria-hidden="true" className="text-stone-600">
              ·
            </span>
            <span className="font-mono text-amber-300 tabular-nums">{bankDetails.iban}</span>
            <span aria-hidden="true" className="text-stone-600">
              ·
            </span>
            <span className="font-mono text-stone-300">SWIFT: {bankDetails.swiftBic}</span>
          </div>
        </div>

        {/* Side-by-Side QR Scan Payment Options (Bahrain Local + Foreign Countries) */}
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0b131b] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="bg-white p-2 rounded-xl shrink-0">
              <img
                src={BENEFITPAY_QR_URL}
                alt="Bahrain BenefitPay QR Code"
                className="w-32 h-32 object-contain"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <QrCode className="w-3.5 h-3.5" />
                <span>Inside Bahrain · BenefitPay Scan &amp; Pay</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Scan QR with BenefitPay</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Open BenefitPay or your Bahrain bank app and scan this QR code, or transfer directly
                to BisB IBAN <span className="font-mono text-amber-300">{bankDetails.iban}</span>{' '}
                (Account <span className="font-mono text-stone-100">{bankDetails.accountNumber}</span>).
              </p>
            </div>
          </div>

          <div className="bg-[#0b131b] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="shrink-0">
              <QrCodeDisplay
                value={defaultGlobalQr}
                alt="Foreign Country USD & International Payment QR"
                size={128}
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Globe className="w-3.5 h-3.5" />
                <span>Foreign Countries · Pay in USD (No CR Needed)</span>
              </div>
              <h3 className="text-lg font-semibold text-white">International &amp; USD Solution</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Abroad in US, UK, UAE, KSA, EU, or Asia? Transfer in{' '}
                <strong className="text-white">USD</strong> via{' '}
                <strong className="text-emerald-300">Wise, Remitly, Revolut, or SWIFT</strong> to
                IBAN <span className="font-mono text-amber-300">{bankDetails.iban}</span>, or scan
                for direct WhatsApp payment support.
              </p>
              <a
                href={`${WHATSAPP_SUPPORT_LINK}?text=${encodeURIComponent(
                  'Hello! I am outside Bahrain and want to pay in USD for the KetoLife Bahrain eBook.',
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22c55e] hover:text-emerald-300 transition-colors pt-1"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp Support · {WHATSAPP_SUPPORT_NUMBER}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 25% Discount & 5-Hour Countdown Banner */}
        <div className="mb-8 bg-amber-500/10 border border-amber-500/35 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-amber-300">{DISCOUNT_PERCENT}% OFF Today</span>
            <span aria-hidden="true" className="text-stone-500">
              ·
            </span>
            <span className="text-stone-200">
              Instant 25% launch discount applied to the Bilingual Digital eBook (Bahrain &amp; Global)
            </span>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm font-semibold text-white tabular-nums shrink-0">
            <Clock className="w-4 h-4 text-amber-300" />
            <span>Time Remaining: {countdownFormatted}</span>
          </div>
        </div>

        {/* Single Official Bilingual Digital Edition */}
        {(() => {
          const edition = EBOOK_EDITIONS[0];
          const regularBhdPrice = bankDetails.digitalPriceBhd;
          const discountedBhdPrice = applyDiscountBhd(regularBhdPrice);
          const originalDisplayPrice = formatCurrencyPrice(regularBhdPrice, currency);
          const displayPrice = formatCurrencyPrice(discountedBhdPrice, currency);
          const usdPrice = formatCurrencyPrice(discountedBhdPrice, 'USD');
          const liveEdition: EbookEdition = {
            ...edition,
            numericBhd: discountedBhdPrice,
            priceBhd: `${discountedBhdPrice.toFixed(3)} BHD`,
          };

          return (
            <div className="max-w-3xl mx-auto rounded-2xl p-8 sm:p-10 bg-[#0b1612] border border-emerald-500/45 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-6">
                <div>
                  <p className="font-arabic text-sm text-emerald-300">{edition.titleAr}</p>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
                    {edition.titleEn}
                  </h3>
                  <p className="text-sm text-stone-300 mt-1.5">{edition.subtitle}</p>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="flex sm:justify-end items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-amber-300">
                      -{DISCOUNT_PERCENT}% OFF
                    </span>
                    <span className="font-mono text-xs text-stone-400 line-through tabular-nums">
                      {originalDisplayPrice}
                    </span>
                  </div>
                  <span className="font-mono text-3xl sm:text-4xl font-semibold text-amber-300 tabular-nums">
                    {displayPrice}
                  </span>
                  <p className="font-mono text-xs text-emerald-300 mt-1 tabular-nums">
                    {currency === 'USD' ? `${discountedBhdPrice.toFixed(3)} BHD` : usdPrice}
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {edition.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-stone-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 pt-2">
                <button
                  onClick={() => onSelectEdition(liveEdition)}
                  className="w-full py-4 px-6 rounded-xl text-sm sm:text-base font-semibold bg-emerald-500 hover:bg-emerald-400 text-stone-950 transition-colors cursor-pointer tabular-nums"
                >
                  Buy Now · {displayPrice} ({currency === 'USD' ? `${discountedBhdPrice.toFixed(3)} BHD` : usdPrice})
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Scan BenefitPay QR · Wise / Remitly / SWIFT USD · Instant PDF</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
