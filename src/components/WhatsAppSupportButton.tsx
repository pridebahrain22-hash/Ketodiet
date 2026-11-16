import { WHATSAPP_SUPPORT_LINK, WHATSAPP_SUPPORT_NUMBER } from '../data/ebookContent';

interface WhatsAppSupportButtonProps {
  message?: string;
}

export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.03 2C6.51 2 2.04 6.47 2.04 11.99c0 1.76.46 3.48 1.33 4.99L2 22l5.15-1.35a9.95 9.95 0 0 0 4.88 1.27h.01c5.52 0 9.99-4.47 9.99-9.99A9.93 9.93 0 0 0 12.03 2Zm5.82 14.21c-.25.7-1.43 1.33-1.99 1.4-.52.07-1.18.1-1.9-.13-.44-.14-1-.33-1.72-.64-3.02-1.3-4.99-4.35-5.14-4.55-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.6-.38.8-.38.2 0 .4 0 .58.01.19.01.44-.07.69.53.25.6.86 2.09.94 2.24.08.15.13.33.03.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.54-.15.15-.31.32-.13.62.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.45 1.51.3.15.48.13.66-.08.18-.2.75-.88.95-1.18.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.58.35.07.12.07.72-.18 1.42Z" />
    </svg>
  );
}

export function WhatsAppSupportButton({
  message = 'Hello KetoLife Bahrain! I would like help with buying or downloading the 30-Day Keto Guide.',
}: WhatsAppSupportButtonProps) {
  const href = `${WHATSAPP_SUPPORT_LINK}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`WhatsApp Customer Support ${WHATSAPP_SUPPORT_NUMBER}`}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white shadow-2xl border border-white/20 transition-transform hover:scale-[1.02]"
    >
      <WhatsAppIcon className="w-5 h-5 shrink-0" />
      <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
        Support · {WHATSAPP_SUPPORT_NUMBER}
      </span>
    </a>
  );
}
