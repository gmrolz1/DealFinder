// DealFinder logomark — bold "Z" monogram, point-symmetric.
// Uses currentColor so it inherits text colour (dark on light, light on dark).

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="DealFinder"
    >
      <path
        fill="currentColor"
        d="M20 12 L52 12 L52 24 L40 40 L52 40 L44 52 L12 52 L12 40 L24 24 L12 24 Z"
      />
    </svg>
  );
}
