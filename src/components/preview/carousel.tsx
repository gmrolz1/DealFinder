"use client";

// Generic image carousel. Used on the v2 cards.
// - swipe on touch devices
// - left/right arrows on hover (desktop)
// - dot indicators (only if 2+ images)
// - counter pill (top right)
// - prevents click-through to the wrapping Link when the user is navigating slides
//
// Once per-unit gallery scrape lands (Roadmap M2), PropertyCardV2 can pass
// the full unit images[] here and the carousel just works.

import { useState, useRef, type TouchEvent, type MouseEvent } from "react";

export function Carousel({
  images,
  alt,
  aspectRatio = "4/3",
  className = "",
}: {
  images: string[];
  alt: string;
  /** CSS aspect-ratio string, e.g. "4/3", "5/3", "16/9" */
  aspectRatio?: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const valid = images.filter(Boolean);
  const count = valid.length;

  // No-image placeholder
  if (count === 0) {
    return (
      <div
        className={`relative grid place-items-center bg-data ${className}`}
        style={{ aspectRatio }}
      >
        <span className="text-[11px] uppercase tracking-[0.08em] text-slate">
          No image
        </span>
      </div>
    );
  }

  const goTo = (i: number) => setIndex(((i % count) + count) % count);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
    touchStart.current = null;
  };

  return (
    <div
      className={`relative overflow-hidden bg-data ${className}`}
      style={{ aspectRatio }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* current image — keying forces a fresh element so transitions are clean */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={index}
        src={valid[index]}
        alt={`${alt} (${index + 1} of ${count})`}
        loading="lazy"
        className="h-full w-full object-cover transition-opacity duration-200"
      />

      {count > 1 && (
        <>
          {/* arrows (desktop only) */}
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              prev();
            }}
            className="hidden sm:grid place-items-center absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-ink/70 text-paper opacity-0 group-hover:opacity-100 transition hover:bg-ink"
            aria-label="Previous image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              next();
            }}
            className="hidden sm:grid place-items-center absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-ink/70 text-paper opacity-0 group-hover:opacity-100 transition hover:bg-ink"
            aria-label="Next image"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          {/* dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {valid.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  stop(e);
                  goTo(i);
                }}
                className={`h-1 transition-all duration-200 ${
                  i === index ? "w-6 bg-paper" : "w-1.5 bg-paper/60"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>

          {/* counter */}
          <span className="pointer-events-none absolute top-2 right-2 bg-ink/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-paper">
            {index + 1}/{count}
          </span>
        </>
      )}
    </div>
  );
}
