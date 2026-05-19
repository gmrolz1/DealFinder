// DealFinder wordmark — "Block" treatment: DEAL in a solid block, FINDER plain.
// Magnetik ExtraBold, uppercase. Sized via the `className` font-size.

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center font-extrabold uppercase leading-none tracking-[0.01em] ${
        className ?? ""
      }`}
    >
      <span className="bg-ink px-[0.26em] py-[0.16em] text-paper">Deal</span>
      <span className="pl-[0.22em] text-ink">Finder</span>
    </span>
  );
}
