// Temporary preview page — wordmark treatment options.
// Visit /wordmark, pick one, and it gets applied to the header & footer.

export const metadata = { title: "Wordmark options — DealFinder" };

type Variant = {
  id: string;
  name: string;
  note: string;
  render: (size: string) => React.ReactNode;
};

const VARIANTS: Variant[] = [
  {
    id: "1",
    name: "Solid",
    note: "Current — ExtraBold, uppercase, light tracking.",
    render: (s) => (
      <span className={`${s} font-extrabold uppercase tracking-[0.02em]`}>
        DealFinder
      </span>
    ),
  },
  {
    id: "2",
    name: "Heavy / tight",
    note: "Heaviest weight, negative tracking — most monolithic.",
    render: (s) => (
      <span className={`${s} font-black uppercase tracking-[-0.03em]`}>
        DealFinder
      </span>
    ),
  },
  {
    id: "3",
    name: "Weight split",
    note: "DEAL heavy, FINDER regular — built-in contrast.",
    render: (s) => (
      <span className={`${s} uppercase tracking-[-0.01em]`}>
        <span className="font-black">Deal</span>
        <span className="font-normal">Finder</span>
      </span>
    ),
  },
  {
    id: "4",
    name: "Block",
    note: "DEAL in a solid block — brand monolith treatment.",
    render: (s) => (
      <span className={`${s} inline-flex items-center font-extrabold uppercase`}>
        <span className="bg-ink px-1.5 pb-0.5 pt-1 leading-none text-paper">
          Deal
        </span>
        <span className="pl-1.5 leading-none">Finder</span>
      </span>
    ),
  },
  {
    id: "5",
    name: "Spaced caps",
    note: "Wide letter-spacing — editorial, calmer.",
    render: (s) => (
      <span className={`${s} font-semibold uppercase tracking-[0.34em]`}>
        DealFinder
      </span>
    ),
  },
  {
    id: "6",
    name: "Mixed case",
    note: "Title case, weight contrast — softer, friendlier.",
    render: (s) => (
      <span className={`${s} tracking-[-0.02em]`}>
        <span className="font-black">Deal</span>
        <span className="font-light">Finder</span>
      </span>
    ),
  },
];

export default function WordmarkPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-ink">
        Wordmark options
      </h1>
      <p className="mt-1 text-[13px] text-slate">
        All set in Magnetik. Tell me the number you want and I&apos;ll apply it
        to the header &amp; footer.
      </p>

      <div className="mt-8 space-y-3">
        {VARIANTS.map((v) => (
          <div key={v.id} className="border border-data p-6">
            <div className="flex items-baseline gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-taupe">
                Option {v.id} · {v.name}
              </span>
            </div>
            <div className="mt-4 text-ink">
              {v.render("text-[40px] sm:text-[52px]")}
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-data pt-4">
              <span className="text-[10px] uppercase tracking-[0.08em] text-taupe">
                At header size
              </span>
              <span className="text-ink">{v.render("text-[20px]")}</span>
            </div>
            <p className="mt-3 text-[12px] text-slate">{v.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
