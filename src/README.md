# src/

All application code. Organized by Next.js convention.

```
src/
├── app/           Next.js App Router routes (see app/README.md)
├── components/    Shared UI components (see components/README.md)
├── fonts/         Magnetik OTF files — loaded via lib/fonts.ts
└── lib/           Utilities (data, format, i18n, supabase, fonts) (see lib/README.md)
```

## Import alias

`@/*` resolves to `src/*` (see `tsconfig.json` paths). Always import from `@/components/...` and `@/lib/...`, not from relative paths beyond one level.

```ts
import { PropertyCard } from "@/components/property-card";   // good
import { t } from "@/lib/i18n";                              // good
import { Foo } from "../../components/foo";                  // avoid
```

## Where new code goes

| You're adding... | Put it in... |
|---|---|
| A page or route | `app/<route>/page.tsx` (and `app/ar/<route>/page.tsx` for AR) |
| A reusable component | `components/<name>.tsx` |
| A utility function | `lib/<name>.ts` |
| A UI string | `lib/i18n.ts` |

See [`docs/CONVENTIONS.md`](../docs/CONVENTIONS.md) for the full rules.

## fonts/

Magnetik OTF files (brand typeface — 18 weights). Loaded via `next/font/local` in `src/lib/fonts.ts` so Next.js optimizes and preloads them. If you add a new weight, register it in `lib/fonts.ts` first — don't import OTF files directly elsewhere.
