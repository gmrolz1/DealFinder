// Fixed bottom WhatsApp + Call bar — always visible for one-tap contact.
// CTAs route through /api/go so every tap is recorded as a lead and pinned
// to the landing's client before redirecting to their number.

import type { Locale } from "@/lib/i18n";
import { CAMPAIGN_COPY } from "@/lib/campaign";
import { goHref } from "@/lib/leads";
import { GoLink } from "@/components/go-link";
import { PhoneIcon, WhatsAppIcon } from "./icons";

export function StickyContact({
  locale = "en",
  landingPath,
}: {
  locale?: Locale;
  landingPath: string;
}) {
  const isAr = locale === "ar";
  const c = CAMPAIGN_COPY[locale];
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-paper/95 backdrop-blur"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-3xl items-stretch gap-px bg-ink">
        <GoLink
          href={goHref({ channel: "tel", pinnedPath: landingPath, locale })}
          className="flex flex-1 items-center justify-center gap-2 bg-paper py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
          aria-label={c.callCta}
        >
          <PhoneIcon size={16} />
          {c.callCta}
        </GoLink>
        <GoLink
          href={goHref({ channel: "wa", pinnedPath: landingPath, locale })}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex flex-[1.4] items-center justify-center gap-2 bg-ink py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-paper transition hover:opacity-90"
          aria-label={c.waCta}
        >
          <WhatsAppIcon size={16} />
          {c.waCta}
        </GoLink>
      </div>
    </div>
  );
}
