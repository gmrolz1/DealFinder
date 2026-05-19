// DealFinder icon — a geometric house mark with a doorway cut-out.
// Solid, monolithic; inherits text colour via currentColor.

export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="DealFinder"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5 L22.5 10.5 L22.5 22.5 L1.5 22.5 L1.5 10.5 Z M9.4 22.5 L9.4 14.4 L14.6 14.4 L14.6 22.5 Z"
      />
    </svg>
  );
}
