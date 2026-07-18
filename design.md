# Design — Heart in Motion

A locked design system for this app. Every page reads this file before styling.
Do not regenerate per page — extend or amend this file when the system grows.

/ Hallmark · genre: modern-minimal · theme: custom (brand-red) · designed-as-app /

## Genre
modern-minimal — Linear / Stripe school. Crisp, generous whitespace, hairline
borders, restrained accent, soft one-layer depth. Function carries the page.

## Macrostructure family
- Marketing / public pages: centered content column, generous vertical rhythm,
  card grids for events/files.
- App pages (account + admin): Workbench — toolbar + table/card content, dense
  but calm. No enrichment; the data is the interface.
- Content pages (CMS via `[...slug]`): typographic prose, single measure.

## Theme (light only)
HSL triplets, consumed through the shadcn token contract in `tailwind.config.ts`
as `hsl(var(--token) / <alpha-value>)`.

- `--background`          0 0% 100%      (paper)
- `--foreground`          240 6% 10%     (ink)
- `--card`                0 0% 100%
- `--muted`               240 5% 96.5%   (subtle fills, table headers)
- `--muted-foreground`    240 4% 44%     (secondary text)
- `--border` / `--input`  240 6% 90%     (hairlines)
- `--primary`             4 74% 51%       (Heart in Motion red, retuned)
- `--primary-foreground`  0 0% 100%
- `--ring`                4 74% 51%       (focus)

## Typography
- Display + body: Inter (single family — the clean minimal look). Weight 400/500
  body, 600/700 headings.
- Display tracking: -0.02em on large headings; roman only, never italic headers.
- Type scale: modest, clamp-based hero, 1.5 line-height body.

## Spacing
4-point named scale. Pages use Tailwind spacing utilities.

## Radius & depth
- `--radius` 0.65rem. Cards 0.75rem, inputs/buttons 0.5–0.65rem. No pills except
  the primary CTA where a full radius reads friendly.
- Shadows: single soft layer (Linear-style), never heavy drop shadows.

## Motion
- Easing `--ease-out` cubic-bezier(0.16, 1, 0.3, 1); durations 150–200ms.
- Transitions on color/background/transform/opacity only. Reduced-motion honored.

## Microinteractions stance
- Silent success, subtle hover lift on cards, instant focus ring (never animated).

## CTA voice
- Primary: solid brand fill, rounded, medium weight.
- Secondary: hairline outline on paper, muted hover fill.

## What pages MUST share
- The wordmark, the brand-red accent (used sparingly), Inter, the CTA voice, the
  hairline-border + soft-shadow card language, and the focus ring.

## What pages MAY differ on
- Macrostructure within the family (marketing card grid vs. admin workbench table).
