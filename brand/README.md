# brand/

The Deal Maker brand source assets — PDFs, fonts, logos, social-media kit. **Not served by the app** (those live in `public/`). This folder is the canonical reference for the brand identity.

```
brand/
├── BRAND MANUL/                The Deal Maker Brand Guidelines.pdf
│                               The Deal Maker Visual Identity.pdf
├── FONTS - Magnetik/           Magnetik typeface — 18 OTF files (all weights)
├── LOGO FILE/                  Original logo source files (PNG + JPG)
└── SOCIAL MEDIA ASSET/         Facebook covers, profile pics
```

> **Note:** the legacy folder names contain spaces (e.g. `BRAND MANUL` — typo preserved from the original source kit). We're not renaming subfolders yet to avoid breaking any external references. If you reference these from code, quote the path.

## Brand at a glance

| Element | Value |
|---|---|
| Primary palette | Black + white (high contrast monolith) |
| Accents | Slate / data grey for charts and supporting micro-elements |
| Earthy taupe | Reserved for micro-elements only — never primary CTAs |
| Typeface | **Magnetik** — uppercase headings, mixed-case body |
| CTAs | Square / monolithic, black or white only — never grey, never taupe |
| Grid | 9×12 modular |

Read the PDFs in `BRAND MANUL/` for the full system (colour codes, spacing, glitch treatment rules, layout examples).

## Using the brand in code

- **Fonts:** Magnetik OTF files are also copied into `src/fonts/` and loaded via `src/lib/fonts.ts` (Next.js `next/font/local`). The version in `src/fonts/` is what ships to users — `brand/FONTS - Magnetik/` is the canonical source.
- **Logo:** the production logo files served by the app live in `public/` (`logo-mark.png`, `logo-mark-white.png`). They're processed from `public/logo.png` via `node scripts/process-logo.mjs`. The original source kit is in `LOGO FILE/`.
- **Colours:** brand tokens are declared in `src/app/globals.css` (`bg-paper`, `text-ink`, `border-slate`, `bg-data`, `text-taupe`). Use these — don't sprinkle raw hex.

## Updating the brand

1. Add new source files to the appropriate subfolder.
2. If a logo or font changes:
   - Copy the new font(s) into `src/fonts/` and register them in `src/lib/fonts.ts`.
   - Replace `public/logo.png` with the new source, then run `node scripts/process-logo.mjs`.
3. Update `src/app/globals.css` if colour tokens change.
4. Note the change in `docs/LOG.md`.
