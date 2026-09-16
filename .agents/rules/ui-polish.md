# UI & Design System Polish Guidelines

## 1. Core Visual Aesthetics & Color Architecture
- **Eliminate Generic "AI Slop" Aesthetics**: Never use unstyled raw Tailwind grays (`bg-gray-100`, `bg-gray-800`, `text-gray-500`) or flat primitive primary colors (`bg-blue-500`, `bg-red-500`) without context, texture, and depth.
- **Rich, Layered Neutral Palettes**:
  - Prefer deep slate/zinc/neutral tones with intentional color temperature (e.g., `slate-950`, `zinc-900`, `slate-900/80`).
  - Use layered surface elevation: Base surface (`slate-950`), card surface (`slate-900/70` with `backdrop-blur-md`), elevated elements/dropdowns (`slate-800/90`).
  - Always pair dark containers with translucent borders (e.g., `border border-white/[0.08]` or `border border-slate-700/50`) rather than solid opaque borders.
- **Subtle Glassmorphism & Depth**:
  - Use `backdrop-blur-md` or `backdrop-blur-lg` on floating panels, headers, dialogs, and cards.
  - Add radial gradient glows, accent ambient lighting, and subtle inner shadows (`shadow-inner`, custom box-shadows) to give surfaces tactical presence.

## 2. Motion, Transitions & Micro-Interactions
- **Mandatory Transition Tokens**:
  - Every interactive element (buttons, cards, links, inputs, toggles) MUST have smooth transitions:
    - Standard: `transition-all duration-300 ease-in-out` or `transition-all duration-200 cubic-bezier(0.16, 1, 0.3, 1)`.
    - Color/Opacity: `transition-colors duration-200 ease-out` / `transition-opacity duration-200`.
  - Zero instant state snapping: No hover/focus transitions without a defined easing and duration.
- **Micro-Interactions**:
  - **Hover**: Subtle scale-up (`hover:scale-[1.01]` or `hover:scale-[1.02]`), border glow brightening (`hover:border-cyan-500/40`), or ambient shadow expansion (`hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]`).
  - **Active / Press**: Tactile feedback with press compression (`active:scale-[0.98]` or `active:scale-95`).
  - **Focus**: High-contrast, accessible focus indicators with offsets: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`.

## 3. Typography & Spacing Rhythm
- **Typography Scale**:
  - Maintain a strict hierarchy: Display (`text-3xl`/`text-4xl font-black tracking-tight`), Section Headers (`text-xl font-bold tracking-normal`), Body (`text-sm font-normal text-slate-300 leading-relaxed`), Labels & Badges (`text-xs font-semibold tracking-wider uppercase text-slate-400`).
  - Use tabular numbers (`font-mono` or `tabular-nums`) for statutory metrics, percentages, tolerances, timestamps, and compliance figures.
- **Consistent Spacing Grid**:
  - Strict adherence to 4px / 8px grid multipliers:
    - Tight padding: `p-2` (8px), `p-3` (12px), `p-4` (16px)
    - Container padding: `p-6` (24px), `p-8` (32px)
    - Component gaps: `gap-3`, `gap-4`, `gap-6`
  - Maintain comfortable white space; avoid cramped inspection elements.

## 4. Animation & Smooth Layout Transitions
- **Framer Motion Integration**:
  - Wrap tab/step changes in `<AnimatePresence mode="wait">`.
  - Use staggered container variants for item lists (`staggerChildren: 0.05`).
  - Add enter/exit transitions with smooth spring physics (`type: 'spring', stiffness: 350, damping: 30`) or cubic curves.
- **Live Status Indicators**:
  - Use pulsing radar rings and animated status pings (`relative flex h-2.5 w-2.5` with `animate-ping`) for active scanner processes.
  - Shimmer gradients for CTAs and loading states instead of plain spinning circles.

## 5. Anti-Patterns to Strictly Avoid
1. ❌ Standard default Tailwind unstyled cards (`bg-white shadow rounded p-4` or `bg-gray-800 text-white`).
2. ❌ Hard black/white contrast with harsh zero-opacity edges.
3. ❌ Instant hover state color flips without `transition` classes.
4. ❌ Generic AI template layouts with mismatched padding and unaligned baselines.
5. ❌ Overcrowded modals without backdrop blur and smooth entrance scaling.
