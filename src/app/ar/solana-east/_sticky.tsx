"use client";

// Phone-only bottom bar: appears once the hero has scrolled away, and hides
// whenever the guide's form is on screen — so it never covers the form or
// its submit button.

import { useEffect, useState } from "react";

export function StickyBar({ label = "سجّل اهتمامك" }: { label?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    const magnet = document.getElementById("magnet");
    if (!hero || !magnet) return;
    let pastHero = false;
    let magnetOn = false;
    const apply = () => setShow(pastHero && !magnetOn);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) pastHero = !e.isIntersecting;
        if (e.target === magnet) magnetOn = e.isIntersecting;
      }
      apply();
    }, { threshold: 0.05 });
    io.observe(hero);
    io.observe(magnet);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-data bg-paper/95 p-3 backdrop-blur transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a href="#magnet" className="flex h-12 items-center justify-center rounded-xl bg-ink font-bold text-paper">
        {label}
      </a>
    </div>
  );
}
