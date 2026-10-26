import { t, type Locale } from "@/lib/i18n";
import type { CompoundVideo as CompoundVideoAsset } from "@/lib/data";

/** Vertical project reel. Capped in width so a 9:16 phone video doesn't take
 * over the page, and `preload="none"` so it costs nothing until a visitor
 * presses play — paid traffic lands here on mobile data. */
export function CompoundVideo({
  video,
  name,
  locale,
}: {
  video: CompoundVideoAsset;
  name: string;
  locale: Locale;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-taupe">
        {t("compound.video", locale)}
      </h2>
      <div className="mt-2 mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden border border-data bg-data">
        <video
          className="h-full w-full"
          src={video.src}
          poster={video.poster ?? undefined}
          controls
          preload="none"
          playsInline
          aria-label={`${name} — ${t("compound.video", locale)}`}
        />
      </div>
    </section>
  );
}
