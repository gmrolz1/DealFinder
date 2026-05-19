// DealFinder icon — two-slab mark. Inherits text colour via currentColor.

export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 427 292.28"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="DealFinder"
    >
      <polygon points="427 84.39 427 174.67 323.83 174.67 212.53 292.28 154.76 222.13 199.64 174.67 285.14 84.39 427 84.39" />
      <polygon points="0 207.89 0 117.62 103.17 117.62 214.47 0 272.24 70.16 227.36 117.62 141.86 207.89 0 207.89" />
    </svg>
  );
}
