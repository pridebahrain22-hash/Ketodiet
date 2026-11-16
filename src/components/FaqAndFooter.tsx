import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GUIDE_FAQS, WHATSAPP_SUPPORT_LINK, WHATSAPP_SUPPORT_NUMBER } from '../data/ebookContent';
import { WhatsAppIcon } from './WhatsAppSupportButton';

export function FaqAndFooter() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-[#060b10] text-stone-100">
      <section id="faq" className="max-w-5xl mx-auto px-6 py-20">
        <div className="space-y-3 mb-10">
          <p className="text-xs font-medium tracking-wide text-emerald-400">
            Frequently Asked Questions · الأسئلة الشائعة
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            Guidance, Safety &amp; Bahrain Delivery
          </h2>
        </div>

        <div className="divide-y divide-white/10 border-t border-b border-white/10">
          {GUIDE_FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.qEn} className="py-5">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-emerald-300 transition-colors">
                      {item.qEn}
                    </h3>
                    <p className="font-arabic text-xs sm:text-sm text-emerald-300/80 mt-1">
                      {item.qAr}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-2 text-sm text-stone-300 leading-relaxed pr-8">
                    <p>{item.aEn}</p>
                    <p className="font-arabic text-emerald-200/85 text-right" dir="rtl">
                      {item.aAr}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Realistic Health & Expectations Notice from Page 4 */}
        <div className="mt-10 bg-[#0b131b] border border-amber-500/25 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <p className="text-xs font-semibold text-amber-300">Important Safety Note</p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Thirty days helps build sustainable eating and movement habits. Use this guide as
              general education—if you are pregnant, take glucose-lowering medication, or have
              kidney/liver conditions, consult a qualified healthcare professional before starting.
            </p>
          </div>
          <p className="font-arabic text-xs text-stone-300 text-right max-w-sm" dir="rtl">
            دليل عملي للتثقيف العام وليس بديلاً عن الاستشارة الطبية. استشر مختصاً صحياً قبل البدء
            إذا كنت تعاني من أي حالة طبية.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#04070a]">
        <div className="max-w-7xl mx-auto px-6 py-8 pb-20 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-display text-base font-semibold text-white">KetoLife Bahrain</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-stone-300">ketolife.bh</span>
            <span aria-hidden="true">·</span>
            <span>Manama, Kingdom of Bahrain</span>
            <span aria-hidden="true">·</span>
            <a
              href={WHATSAPP_SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#22c55e] hover:text-emerald-300 font-medium transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WhatsApp {WHATSAPP_SUPPORT_NUMBER}</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a href="#hero-3d" className="hover:text-white transition-colors">
              3D Showcase
            </a>
            <a href="#inside-guide" className="hover:text-white transition-colors">
              30-Day Roadmap
            </a>
            <a href="#editions" className="hover:text-white transition-colors">
              Global Pricing
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
