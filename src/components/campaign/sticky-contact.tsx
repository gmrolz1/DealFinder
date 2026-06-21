// Fixed bottom WhatsApp + Call bar — always visible for one-tap contact.
// Sits above the mobile tab bar (bottom-16) and at the screen edge on desktop.
// Server component (plain links).

import type { Locale } from "@/lib/i18n";
import { campaignTelHref, campaignWhatsAppGeneric, CAMPAIGN_COPY } from "@/lib/campaign";
import { PhoneIcon, WhatsAppIcon } from "./icons";

export function StickyContact({
  locale = "en",
  waHref,
  callHref,
}: {
  locale?: Locale;
  /** Override the WhatsApp deep link (e.g. a compound-specific message). */
  waHref?: string;
  /** Override the tap-to-call href. */
  callHref?: string;
}) {
  const isAr = locale === "ar";
  const c = CAMPAIGN_COPY[locale];
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-paper/95 backdrop-blur"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-3xl items-stretch gap-px bg-ink">
        <a
          href={callHref ?? campaignTelHref}
          className="flex flex-1 items-center justify-center gap-2 bg-paper py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
          aria-label={c.callCta}
        >
          <PhoneIcon size={16} />
          {c.callCta}
        </a>
        <a
          href={waHref ?? campaignWhatsAppGeneric(locale)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-[1.4] items-center justify-center gap-2 bg-ink py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-paper transition hover:opacity-90"
          aria-label={c.waCta}
        >
          <WhatsAppIcon size={16} />
          {c.waCta}
        </a>
      </div>
    </div>
  );
}

/** Inline hero CTA pair (WhatsApp solid + Call outline). Locale-agnostic — the
 * caller passes resolved hrefs and labels. */
export function ContactButtons({
  waHref,
  callHref,
  waLabel,
  callLabel,
  locale = "en",
}: {
  waHref: string;
  callHref: string;
  waLabel: string;
  callLabel: string;
  locale?: Locale;
}) {
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="flex flex-col gap-2 sm:flex-row sm:gap-3"
    >
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 bg-ink px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-paper transition hover:opacity-90"
      >
        <WhatsAppIcon size={16} />
        {waLabel}
      </a>
      <a
        href={callHref}
        className="flex flex-1 items-center justify-center gap-2 border border-ink px-5 py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
      >
        <PhoneIcon size={16} />
        {callLabel}
      </a>
    </div>
  );
}
