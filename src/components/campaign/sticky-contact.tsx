// Fixed bottom WhatsApp + Call bar — always visible for one-tap contact.
// CTAs route through /api/go so every tap is recorded as a lead and pinned
// to the landing's client before redirecting to the assigned broker.

import type { Locale } from "@/lib/i18n";
import {
  CAMPAIGN_COPY,
  campaignWaTextGeneric,
  type CampaignAreaLabel,
} from "@/lib/campaign";
import { goHref } from "@/lib/leads";
import { GoLink } from "@/components/go-link";
import { PhoneIcon, WhatsAppIcon } from "./icons";

export function StickyContact({
  locale = "en",
  landingPath,
  waArea,
  waHref,
  callHref,
}: {
  locale?: Locale;
  /** Landing page path — /api/go maps it to the pinned client. Omit on
   * shared pages (e.g. compound details) so the lead rotates. */
  landingPath?: string;
  /** Area wording for the prefilled WhatsApp message. */
  waArea?: CampaignAreaLabel;
  /** Full href overrides (callers build them with goHref for custom texts). */
  waHref?: string;
  callHref?: string;
}) {
  const isAr = locale === "ar";
  const c = CAMPAIGN_COPY[locale];
  const telTarget =
    callHref ?? goHref({ channel: "tel", pinnedPath: landingPath, locale });
  const waTarget =
    waHref ??
    goHref({
      channel: "wa",
      pinnedPath: landingPath,
      locale,
      text: campaignWaTextGeneric(locale, waArea),
    });
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-paper/95 backdrop-blur"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-3xl items-stretch gap-px bg-ink">
        <GoLink
          href={telTarget}
          className="flex flex-1 items-center justify-center gap-2 bg-paper py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-ink transition hover:bg-ink hover:text-paper"
          aria-label={c.callCta}
        >
          <PhoneIcon size={16} />
          {c.callCta}
        </GoLink>
        <GoLink
          href={waTarget}
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

/** Inline hero CTA pair (WhatsApp solid + Call outline). Locale-agnostic — the
 * caller passes resolved hrefs and labels (use goHref() so taps are recorded). */
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
        rel="noopener noreferrer nofollow"
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
