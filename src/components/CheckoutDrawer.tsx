import { ChangeEvent, FormEvent, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Globe,
  ImagePlus,
  Landmark,
  Mail,
  QrCode,
  Trash2,
  X,
} from 'lucide-react';
import {
  BENEFITPAY_QR_URL,
  BisbBankDetails,
  CURRENCIES,
  CurrencyCode,
  DISCOUNT_PERCENT,
  EBOOK_PDF_URL,
  EbookEdition,
  OrderRecord,
  WHATSAPP_SUPPORT_LINK,
  WHATSAPP_SUPPORT_NUMBER,
  formatCurrencyPrice,
} from '../data/ebookContent';
import { QrCodeDisplay } from './QrCodeDisplay';
import { WhatsAppIcon } from './WhatsAppSupportButton';

interface CheckoutDrawerProps {
  edition: EbookEdition | null;
  currency: CurrencyCode;
  onChangeCurrency: (next: CurrencyCode) => void;
  bankDetails: BisbBankDetails;
  countdownFormatted: string;
  onOrderRecorded: (order: OrderRecord) => void;
  onClose: () => void;
}

const COUNTRIES = [
  'Kingdom of Bahrain',
  'Saudi Arabia',
  'United Arab Emirates',
  'Kuwait',
  'Qatar',
  'Oman',
  'United Kingdom',
  'United States',
  'Canada',
  'European Union',
  'India / Philippines / Pakistan',
  'Other Country (Worldwide)',
];

const CURRENCY_OPTIONS: CurrencyCode[] = ['BHD', 'USD', 'SAR', 'AED', 'GBP', 'EUR'];

export function CheckoutDrawer({
  edition,
  currency,
  onChangeCurrency,
  bankDetails,
  countdownFormatted,
  onOrderRecorded,
  onClose,
}: CheckoutDrawerProps) {
  const [paymentRail, setPaymentRail] = useState<'bisb-local' | 'global-swift'>('bisb-local');
  const [country, setCountry] = useState('Kingdom of Bahrain');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+973 ');
  const [email, setEmail] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  if (!edition) return null;

  const originalBhd = Math.round((edition.numericBhd / (1 - DISCOUNT_PERCENT / 100)) * 1000) / 1000;
  const originalDisplayPrice = formatCurrencyPrice(originalBhd, currency);
  const displayPrice = formatCurrencyPrice(edition.numericBhd, currency);
  const usdEquivalent = formatCurrencyPrice(edition.numericBhd, 'USD');

  const globalWhatsAppUrl = `${WHATSAPP_SUPPORT_LINK}?text=${encodeURIComponent(
    `Hello KetoLife Bahrain! I am paying from ${country} for "${edition.titleEn}" (${usdEquivalent} / ${edition.priceBhd}). Please guide me or verify my global transfer.`,
  )}`;

  const globalQrTarget = bankDetails.globalPayLink.trim() || globalWhatsAppUrl;

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  const handleScreenshotChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    setFormError('');
  };

  const clearScreenshot = () => {
    setScreenshotName('');
    setScreenshotDataUrl(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const digits = phone.replace(/\D/g, '');

    if (trimmedName.length < 2) {
      setFormError('Please enter your full name for transfer verification.');
      return;
    }
    if (digits.length < 7) {
      setFormError('Please enter a valid mobile or WhatsApp number with country code.');
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setFormError('Please enter your email address to receive your KetoLife Bahrain eBook.');
      return;
    }
    if (!screenshotDataUrl) {
      setFormError(
        'Please upload your BenefitPay QR, BisB, or International transfer screenshot to unlock your PDF.',
      );
      return;
    }

    setFormError('');
    const orderNum = `KLB-${paymentRail === 'bisb-local' ? 'QR' : 'USD'}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    onOrderRecorded({
      id: orderNum,
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      customerName: trimmedName,
      country,
      phone: phone.trim(),
      email: trimmedEmail,
      editionTitle: edition.titleEn,
      amountFormatted: displayPrice,
      paymentRail,
      screenshotName,
      screenshotDataUrl,
    });

    setConfirmedRef(orderNum);
  };

  const resetAndClose = () => {
    setConfirmedRef(null);
    setFormError('');
    onClose();
  };

  const mailtoHref = confirmedRef
    ? `mailto:${encodeURIComponent(bankDetails.merchantEmail)}?cc=${encodeURIComponent(
        email.trim(),
      )}&subject=${encodeURIComponent(
        `KetoLife Bahrain eBook Order ${confirmedRef} — ${displayPrice}`,
      )}&body=${encodeURIComponent(
        `Order Reference: ${confirmedRef}\nEdition: ${edition.titleEn} (${displayPrice} / ${edition.priceBhd})\nCustomer Name: ${fullName}\nCountry: ${country}\nCustomer Email: ${email}\nPhone/WhatsApp: ${phone}\nPayment Rail: ${
          paymentRail === 'bisb-local'
            ? 'Bahrain BenefitPay QR / BisB'
            : 'Foreign Country Global Transfer (USD / SWIFT / Link)'
        }\nBisB IBAN: ${bankDetails.iban}\nSWIFT/BIC: ${bankDetails.swiftBic}\nScreenshot Uploaded: ${screenshotName}`,
      )}`
    : '#';

  const whatsappConfirmHref = confirmedRef
    ? `${WHATSAPP_SUPPORT_LINK}?text=${encodeURIComponent(
        `Hello KetoLife Bahrain! I just completed order ${confirmedRef} (${edition.titleEn} · ${displayPrice}) from ${country}. Name: ${fullName}, Email: ${email}.`,
      )}`
    : WHATSAPP_SUPPORT_LINK;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="w-full max-w-lg bg-[#080f16] border-l border-white/15 h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-xs text-emerald-400 font-medium">
                Scan QR · BenefitPay · Global USD Transfer
              </p>
              <h2 id="checkout-title" className="font-display text-2xl font-semibold text-white">
                {confirmedRef ? 'Transfer Screenshot Verified' : 'Scan, Pay & Download'}
              </h2>
            </div>
            <button
              onClick={resetAndClose}
              aria-label="Close checkout"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selected Edition + 25% Discount & Timer + Quick Currency Bar */}
          <div className="mt-5 bg-[#0d1720] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-[11px]">
              <span className="font-semibold text-amber-300">25% OFF Applied</span>
              <span className="inline-flex items-center gap-1 font-mono font-semibold text-white tabular-nums">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>{countdownFormatted} left</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{edition.titleEn}</p>
                <p className="font-arabic text-xs text-emerald-300 mt-0.5">{edition.titleAr}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="block font-mono text-[11px] text-stone-400 line-through tabular-nums">
                  {originalDisplayPrice}
                </span>
                <span className="font-mono text-lg font-semibold text-amber-300 tabular-nums">
                  {displayPrice}
                </span>
                {currency !== 'USD' ? (
                  <span className="block font-mono text-[11px] text-emerald-300 tabular-nums">
                    {usdEquivalent}
                  </span>
                ) : (
                  <span className="block font-mono text-[11px] text-stone-400 tabular-nums">
                    {edition.priceBhd}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10">
              <span className="text-[11px] text-stone-400 mr-1">Currency:</span>
              {CURRENCY_OPTIONS.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeCurrency(code)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    currency === code
                      ? 'bg-emerald-500 text-stone-950 font-semibold'
                      : 'bg-black/40 text-stone-300 hover:text-white'
                  }`}
                >
                  {CURRENCIES[code].code}
                </button>
              ))}
            </div>
          </div>

          {!confirmedRef ? (
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Transfer Region Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentRail('bisb-local');
                    setCountry('Kingdom of Bahrain');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    paymentRail === 'bisb-local'
                      ? 'bg-emerald-500 text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Bahrain · Scan QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentRail('global-swift');
                    if (country === 'Kingdom of Bahrain') {
                      setCountry('United States');
                    }
                    if (currency === 'BHD') {
                      onChangeCurrency('USD');
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    paymentRail === 'global-swift'
                      ? 'bg-emerald-500 text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Foreign · USD &amp; QR</span>
                </button>
              </div>

              {paymentRail === 'bisb-local' ? (
                /* Bahrain Local: BenefitPay Scannable QR + Fawri+ Mobile + BisB IBAN */
                <div className="bg-[#0b1512] border border-emerald-500/35 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Landmark className="w-4 h-4 shrink-0" />
                    <span>Step 1 · Scan BenefitPay QR or Transfer {edition.priceBhd}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#060c0a] border border-white/10 rounded-xl p-3.5">
                    <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg">
                      <img
                        src={BENEFITPAY_QR_URL}
                        alt="Scan BenefitPay QR Code to pay KetoLife Bahrain"
                        className="w-36 h-36 object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-xs text-stone-300 text-center sm:text-left">
                      <p className="font-semibold text-white">Scan with BenefitPay App</p>
                      <p className="leading-relaxed">
                        Open <strong className="text-emerald-300">BenefitPay</strong> or your
                        Bahrain bank app, tap <strong className="text-white">Scan QR</strong>, and
                        send <strong className="font-mono text-amber-300">{edition.priceBhd}</strong>.
                      </p>
                      <p className="font-arabic text-emerald-300/90 text-[11px]" dir="rtl">
                        افتح تطبيق بنفت باي وامسح الرمز لإتمام الدفع فوراً
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 bg-[#060c0a] border border-white/10 rounded-lg px-3 py-2">
                      <div>
                        <span className="block text-[11px] text-stone-400">BisB IBAN</span>
                        <span className="font-mono text-xs sm:text-sm font-semibold text-amber-300 tabular-nums">
                          {bankDetails.iban}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText('iban', bankDetails.iban)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer shrink-0"
                      >
                        {copiedField === 'iban' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy IBAN</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-[#060c0a] border border-white/10 rounded-lg px-3 py-2">
                      <div>
                        <span className="block text-[11px] text-stone-400">
                          BisB Account Number ({bankDetails.bankName})
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-semibold text-stone-100 tabular-nums">
                          {bankDetails.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText('acct', bankDetails.accountNumber)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer shrink-0"
                      >
                        {copiedField === 'acct' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Account</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Foreign Country Solution (Personal Account — No Business CR Required) */
                <div className="bg-[#0b1512] border border-emerald-500/35 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>
                      Step 1 · Foreign Payment in {currency === 'BHD' ? 'USD' : currency} ({usdEquivalent})
                    </span>
                  </div>

                  {/* Foreign Scannable QR Code */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#060c0a] border border-white/10 rounded-xl p-3.5">
                    <div className="shrink-0">
                      <QrCodeDisplay
                        value={globalQrTarget}
                        alt="Scan Global Payment & WhatsApp Support QR"
                        size={136}
                      />
                    </div>
                    <div className="space-y-2 text-xs text-stone-300 text-center sm:text-left">
                      <p className="font-semibold text-white">
                        {bankDetails.globalPayLink
                          ? 'Scan Global Payment QR'
                          : 'Scan with Phone for Instant Global Pay Help'}
                      </p>
                      <p className="leading-relaxed">
                        Send <strong className="font-mono text-amber-300">{usdEquivalent}</strong>{' '}
                        from any country using <strong className="text-white">Wise, Remitly, Revolut</strong>, or{' '}
                        <strong className="text-white">International Bank App</strong> directly to the BisB IBAN below — or scan this QR to pay/confirm directly via WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 bg-[#060c0a] border border-white/10 rounded-lg px-3 py-2">
                      <div>
                        <span className="block text-[11px] text-stone-400">
                          Beneficiary IBAN (Wise / Remitly / SWIFT)
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-semibold text-amber-300 tabular-nums">
                          {bankDetails.iban}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText('iban', bankDetails.iban)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer shrink-0"
                      >
                        {copiedField === 'iban' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy IBAN</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-[#060c0a] border border-white/10 rounded-lg px-3 py-2">
                      <div>
                        <span className="block text-[11px] text-stone-400">
                          Bank Name &amp; SWIFT / BIC Code
                        </span>
                        <span className="font-mono text-xs sm:text-sm text-stone-100 tabular-nums">
                          {bankDetails.swiftBic} · BisB Bahrain
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText('swift', bankDetails.swiftBic)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer shrink-0"
                      >
                        {copiedField === 'swift' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy SWIFT</span>
                          </>
                        )}
                      </button>
                    </div>

                    {bankDetails.globalPayLink && (
                      <a
                        href={bankDetails.globalPayLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-lg text-xs font-semibold text-emerald-300 transition-colors"
                      >
                        <span>Open Direct International Payment Link ({usdEquivalent})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <a
                      href={globalWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#16a34a]/20 hover:bg-[#16a34a]/30 border border-[#16a34a]/45 rounded-lg text-xs font-semibold text-emerald-200 transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-[#22c55e]" />
                      <span>Need Card / Western Union / Wise Help? WhatsApp {WHATSAPP_SUPPORT_NUMBER}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Buyer Info */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="buyer-name" className="block text-xs font-medium text-stone-300">
                      Full Name
                    </label>
                    <input
                      id="buyer-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="buyer-country"
                      className="block text-xs font-medium text-stone-300"
                    >
                      Country
                    </label>
                    <select
                      id="buyer-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm text-white focus:border-emerald-400 focus:outline-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="buyer-phone"
                      className="block text-xs font-medium text-stone-300"
                    >
                      WhatsApp / Mobile
                    </label>
                    <input
                      id="buyer-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+973 / +1 / +44..."
                      className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm font-mono text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="buyer-email"
                      className="block text-xs font-medium text-stone-300"
                    >
                      Email for eBook Delivery
                    </label>
                    <input
                      id="buyer-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-stone-300">
                  Step 2 · Upload Payment Screenshot to Unlock Immediate PDF Download
                </span>

                {!screenshotDataUrl ? (
                  <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-emerald-500/45 hover:border-emerald-400 bg-[#0b131b] rounded-xl p-5 text-center cursor-pointer transition-colors">
                    <ImagePlus className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-medium text-white">
                      Click to upload QR / BenefitPay / Wise / Bank screenshot
                    </span>
                    <span className="text-[11px] text-stone-400">
                      PNG or JPG transfer receipt
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-[#0b131b] border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={screenshotDataUrl}
                        alt="Uploaded payment screenshot"
                        className="w-12 h-12 rounded-lg object-cover border border-white/15 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-emerald-300 truncate">
                          {screenshotName}
                        </p>
                        <p className="text-[11px] text-stone-400">Screenshot attached &amp; ready</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearScreenshot}
                      aria-label="Remove screenshot"
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-stone-300 hover:text-rose-300 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {formError && (
                <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/30 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Verify Screenshot &amp; Unlock PDF · {displayPrice}
              </button>
            </form>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    Order #{confirmedRef} Verified
                  </span>
                </div>
                <p className="text-sm text-stone-200 leading-relaxed">
                  Thank you, <span className="font-semibold text-white">{fullName}</span> (
                  {country}). Your payment receipt (
                  <span className="text-emerald-300">{screenshotName}</span>) has been logged for{' '}
                  <span className="text-white">{displayPrice}</span>. Your complete 24-page bilingual
                  PDF is unlocked below.
                </p>
                {screenshotDataUrl && (
                  <img
                    src={screenshotDataUrl}
                    alt="Verified transfer screenshot"
                    className="w-full max-h-36 object-contain rounded-lg bg-black/40 border border-white/10 p-1"
                  />
                )}
              </div>

              <div className="space-y-3">
                <a
                  href={EBOOK_PDF_URL}
                  download="KetoLife_Bahrain_30_Day_Keto_Guide.pdf"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-sm font-semibold rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full 24-Page PDF Now</span>
                </a>

                <a
                  href={whatsappConfirmHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Confirm Receipt on WhatsApp ({WHATSAPP_SUPPORT_NUMBER})</span>
                </a>

                <a
                  href={mailtoHref}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#0d1720] hover:bg-[#142330] border border-emerald-500/35 text-emerald-300 text-sm font-medium rounded-xl transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Receipt Copy ({email})</span>
                </a>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-stone-500 pt-6 border-t border-white/10 mt-6">
          BisB IBAN: {bankDetails.iban} · SWIFT: {bankDetails.swiftBic} · Support: {WHATSAPP_SUPPORT_NUMBER}
        </p>
      </div>
    </div>
  );
}
