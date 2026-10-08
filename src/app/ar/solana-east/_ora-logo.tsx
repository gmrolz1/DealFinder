// Ora's wordmark redrawn as SVG (three shapes: ring, Γ, Δ) so it stays crisp
// on dark and light backgrounds. Trademark of Ora Developers; used to name
// whose project this is, never to present this page as Ora's own site.

export function OraLogo({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 300 100" className={className} role="img" aria-label="ORA" fill={color}>
      <path fillRule="evenodd" d="M45 8a42 42 0 1 1 0 84a42 42 0 1 1 0-84Zm0 17a25 25 0 1 0 0 50a25 25 0 1 0 0-50Z" />
      <path d="M108 10h62v17h-44v65h-18Z" />
      <path fillRule="evenodd" d="M240 8l50 84H190Zm0 33-18 32h36Z" />
    </svg>
  );
}
