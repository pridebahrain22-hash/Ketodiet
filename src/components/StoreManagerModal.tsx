import { FormEvent, useEffect, useState } from 'react';
import { Download, Globe, Landmark, Receipt, Share2, Tag, X } from 'lucide-react';
import {
  BisbBankDetails,
  DEFAULT_BISB_ACCOUNT,
  OrderRecord,
  SOCIAL_PLATFORMS,
  SocialAccounts,
  normalizeSocialUrl,
} from '../data/ebookContent';

export type ManagerTab = 'orders' | 'payouts' | 'pricing' | 'social';

interface StoreManagerModalProps {
  open: boolean;
  initialTab?: ManagerTab;
  onClose: () => void;
  bankDetails: BisbBankDetails;
  onSaveBankDetails: (next: BisbBankDetails) => void;
  socialAccounts: SocialAccounts;
  onSaveSocialAccounts: (next: SocialAccounts) => void;
  orders: OrderRecord[];
  onClearOrders: () => void;
}

export function StoreManagerModal({
  open,
  initialTab = 'orders',
  onClose,
  bankDetails,
  onSaveBankDetails,
  socialAccounts,
  onSaveSocialAccounts,
  orders,
  onClearOrders,
}: StoreManagerModalProps) {
  const [tab, setTab] = useState<ManagerTab>(initialTab);
  const [draft, setDraft] = useState<BisbBankDetails>(bankDetails);
  const [socialDraft, setSocialDraft] = useState<SocialAccounts>(socialAccounts);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setDraft(bankDetails);
      setSocialDraft(socialAccounts);
    }
  }, [open, initialTab, bankDetails, socialAccounts]);

  if (!open) return null;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSaveBankDetails({
      ...draft,
      bankName: draft.bankName.trim() || DEFAULT_BISB_ACCOUNT.bankName,
      accountHolder: draft.accountHolder.trim() || DEFAULT_BISB_ACCOUNT.accountHolder,
      iban: draft.iban.trim() || DEFAULT_BISB_ACCOUNT.iban,
      accountNumber: draft.accountNumber.trim() || DEFAULT_BISB_ACCOUNT.accountNumber,
      swiftBic: draft.swiftBic.trim() || DEFAULT_BISB_ACCOUNT.swiftBic,
      merchantEmail: draft.merchantEmail.trim() || DEFAULT_BISB_ACCOUNT.merchantEmail,
      digitalPriceBhd: Math.max(1, Number(draft.digitalPriceBhd) || 9.9),
      bundlePriceBhd: Math.max(1, Number(draft.bundlePriceBhd) || 14.9),
    });
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2200);
  };

  const handleSaveSocial = (e: FormEvent) => {
    e.preventDefault();
    onSaveSocialAccounts({
      instagram: normalizeSocialUrl(socialDraft.instagram),
      tiktok: normalizeSocialUrl(socialDraft.tiktok),
      youtube: normalizeSocialUrl(socialDraft.youtube),
      x: normalizeSocialUrl(socialDraft.x),
      facebook: normalizeSocialUrl(socialDraft.facebook),
      snapchat: normalizeSocialUrl(socialDraft.snapchat),
    });
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2200);
  };

  const exportCsv = () => {
    const header = [
      'Order ID',
      'Date',
      'Customer Name',
      'Country',
      'Phone',
      'Email',
      'Edition',
      'Amount',
      'Payment Rail',
      'Screenshot File',
    ];
    const rows = orders.map((o) => [
      o.id,
      o.createdAt,
      o.customerName,
      o.country,
      o.phone,
      o.email,
      o.editionTitle,
      o.amountFormatted,
      o.paymentRail,
      o.screenshotName,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ketolife_bahrain_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-manager-title"
    >
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#080f16] border border-white/15 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#0b131b] border-b border-white/10">
          <div>
            <p className="text-xs font-medium text-emerald-400">Merchant Control Center</p>
            <h2 id="store-manager-title" className="text-lg sm:text-xl font-semibold text-white">
              KetoLife Global &amp; Bahrain Store Manager
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close store manager"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 pb-3 bg-[#091017] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-lg">
            <button
              type="button"
              onClick={() => setTab('orders')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                tab === 'orders'
                  ? 'bg-emerald-500 text-stone-950 font-semibold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(bankDetails);
                setTab('payouts');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                tab === 'payouts'
                  ? 'bg-emerald-500 text-stone-950 font-semibold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>BisB &amp; Global Payouts</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(bankDetails);
                setTab('pricing');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                tab === 'pricing'
                  ? 'bg-emerald-500 text-stone-950 font-semibold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Global Pricing</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSocialDraft(socialAccounts);
                setTab('social');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                tab === 'social'
                  ? 'bg-emerald-500 text-stone-950 font-semibold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Social Accounts</span>
            </button>
          </div>

          {savedToast && (
            <span className="text-xs font-medium text-emerald-300">Changes saved</span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-stone-300">
                  Every verified BisB / BenefitPay and Global SWIFT order submitted in checkout is
                  logged here with its transfer screenshot.
                </p>
                <div className="flex items-center gap-2">
                  {orders.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={exportCsv}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={onClearOrders}
                        className="px-3 py-1.5 bg-white/5 hover:bg-rose-500/20 text-xs text-stone-300 hover:text-rose-200 rounded-lg cursor-pointer"
                      >
                        Clear Log
                      </button>
                    </>
                  )}
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="bg-[#0b131b] border border-white/10 rounded-xl p-10 text-center space-y-2">
                  <Globe className="w-7 h-7 text-emerald-400 mx-auto" />
                  <p className="text-sm font-medium text-white">No customer orders recorded yet</p>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    When a buyer in Bahrain or worldwide uploads a transfer screenshot in checkout,
                    their order details and receipt preview appear here for tracking and CSV export.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#0b131b] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-semibold text-emerald-300 tabular-nums">
                            {order.id}
                          </span>
                          <span className="text-stone-500">·</span>
                          <span className="text-stone-400">{order.createdAt}</span>
                          <span className="text-stone-500">·</span>
                          <span className="text-amber-300 font-mono tabular-nums">
                            {order.amountFormatted}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {order.customerName} ({order.country})
                        </p>
                        <p className="text-xs text-stone-300">
                          {order.email} · {order.phone} · {order.editionTitle}
                        </p>
                      </div>

                      {order.screenshotDataUrl && (
                        <img
                          src={order.screenshotDataUrl}
                          alt={`Receipt for ${order.id}`}
                          className="w-16 h-16 rounded-lg object-cover border border-white/15 shrink-0"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'payouts' && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-stone-300">Bank Name</label>
                  <input
                    type="text"
                    value={draft.bankName}
                    onChange={(e) => setDraft({ ...draft, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-stone-300">Account Holder Name</label>
                  <input
                    type="text"
                    value={draft.accountHolder}
                    onChange={(e) => setDraft({ ...draft, accountHolder: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-stone-300">BisB IBAN (Local &amp; Global)</label>
                  <input
                    type="text"
                    value={draft.iban}
                    onChange={(e) => setDraft({ ...draft, iban: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm font-mono text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-stone-300">BisB Account Number</label>
                  <input
                    type="text"
                    value={draft.accountNumber}
                    onChange={(e) => setDraft({ ...draft, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm font-mono text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-stone-300">SWIFT / BIC Code (Global Wire)</label>
                  <input
                    type="text"
                    value={draft.swiftBic}
                    onChange={(e) => setDraft({ ...draft, swiftBic: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm font-mono text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-stone-300">WhatsApp Customer Support Number (+973)</label>
                  <input
                    type="text"
                    value={draft.benefitPayNumber}
                    onChange={(e) => setDraft({ ...draft, benefitPayNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm font-mono text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-stone-300">
                    Optional Personal Global Pay Link — PayPal.me / Wise / Revolut (No CR needed; updates Foreign QR code)
                  </label>
                  <input
                    type="url"
                    value={draft.globalPayLink}
                    onChange={(e) => setDraft({ ...draft, globalPayLink: e.target.value })}
                    placeholder="https://paypal.me/yourname or https://wise.com/pay/..."
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-stone-300">Merchant Notification Email</label>
                  <input
                    type="email"
                    value={draft.merchantEmail}
                    onChange={(e) => setDraft({ ...draft, merchantEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Save Payout Configuration
                </button>
              </div>
            </form>
          )}

          {tab === 'pricing' && (
            <form onSubmit={handleSave} className="space-y-5">
              <p className="text-xs text-stone-400">
                Set regular base prices in Bahraini Dinars (BHD). Global currencies (USD, SAR, AED,
                GBP, EUR) convert automatically, and the active 25% storewide discount applies on top
                of these base prices.
              </p>

              <div className="max-w-sm">
                <div className="space-y-1.5">
                  <label className="text-xs text-stone-300">
                    Bilingual Digital eBook Base Price (BHD)
                  </label>
                  <input
                    type="number"
                    step="0.100"
                    min="1"
                    value={draft.digitalPriceBhd}
                    onChange={(e) =>
                      setDraft({ ...draft, digitalPriceBhd: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm font-mono text-white tabular-nums focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Update Global Prices
                </button>
              </div>
            </form>
          )}

          {tab === 'social' && (
            <form onSubmit={handleSaveSocial} className="space-y-5">
              <p className="text-xs text-stone-300 leading-relaxed">
                Paste your official social media profile links below. Any saved profile automatically
                appears with its icon in the site footer for customers to follow KetoLife Bahrain.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.id} className="space-y-1">
                    <label className="text-xs text-stone-300">{platform.label} URL</label>
                    <input
                      type="text"
                      value={socialDraft[platform.id]}
                      onChange={(e) =>
                        setSocialDraft({ ...socialDraft, [platform.id]: e.target.value })
                      }
                      placeholder={platform.placeholder}
                      className="w-full px-3.5 py-2.5 bg-[#04070a] border border-white/15 rounded-lg text-sm text-white placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Save Social Links
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
