# Lessons Learned

Rules, style preferences, and best practices. Review at session start.

---

## Package Manager

- **Always use pnpm** - Never npm or yarn.

## Code Style

- **Prefer arrow functions for client-side code** — callbacks, hooks, utilities, event handlers. Server components and exported async functions can use `function` declarations since they read more naturally with `export async function`.
- **If/else consistency** - Match formatting between if and else:
  - Both single-line: no braces for either
  - One is multi-line: braces for both
  - Never mix

  ```typescript
  // GOOD - Both single-line, no braces
  if (condition) doSomething();
  else doSomethingElse();

  // GOOD - One is multi-line, both use braces
  if (condition) {
    doSomething();
    doMore();
  } else {
    doSomethingElse();
  }

  // BAD - Inconsistent formatting
  if (condition) doSomething();
  else {
    doSomethingElse();
    doMore();
  }
  ```

- **Object parameters for 3+ args** - Functions with more than 2 parameters should take a single object parameter.
- **Static objects outside components** - Define constants and config objects outside component bodies to prevent recreation on every render.

## Component Architecture

- **Server/client separation** - Keep `page.tsx` and `layout.tsx` as server components. Never add `"use client"` to these files. Create separate client components when interactivity is needed.
- **Server/client split for i18n + interactivity** — When a section needs both translations AND client-side state (lightbox, forms, scroll listeners), create a server component wrapper that calls `getTranslations()` and renders a client child that uses `useTranslations()` + `useState`. Example: `gallery-section.tsx` (server) renders `gallery-grid.tsx` (client).
- **Component structure order**: State > Callbacks > useEffects > Return. No exceptions.
- **useEffect placement** - ALL useEffects go immediately before the return statement, after all callbacks.
- **Interface location** - Component interfaces immediately before component definition. Shared interfaces in `/types` folder.

## React Best Practices

### useEffect Guidelines

- **Minimal dependencies** - Only include what's actually used AND should trigger re-runs. Never include state that the effect itself updates (circular dependency).
- **Prefer derived state** - Compute values directly instead of syncing with useEffect when possible.
- **Memory leak prevention** - Use `isMountedRef` pattern for async operations in useEffects.
- **Always clean up** - Return cleanup function for subscriptions, timers, listeners.

### Performance — Zero Lag Rules

- **Server Components by default** — only `"use client"` for event handlers, browser APIs, useState/useEffect, animations. Push it as far down the tree as possible.
- **Small components with isolated state** — extract interactive pieces into tiny client components so parent Server Components ship zero JS. A component that owns state re-renders only itself.
- **Lazy load heavy client components** — use `next/dynamic` with `ssr: false` for modals, charts, editors, below-the-fold widgets. Wrap route segments in `<Suspense>`.
- **Memoize where it matters** — `React.memo` on leaf components with stable props. `useMemo`/`useCallback` for expensive derivations only. Never define objects/arrays/functions inline in JSX props of memoized children.
- **Images with `next/image`** — automatic WebP/AVIF, responsive srcset, lazy loading. Set explicit width/height to prevent CLS. `priority` only on above-the-fold LCP images.
- **Fonts with `next/font`** — self-hosted, preloaded, zero layout shift.
- **Third-party scripts via `next/script`** — `strategy="lazyOnload"` for analytics, `strategy="afterInteractive"` for tag managers. Never raw `<script>` tags.
- **CSS transitions only on `transform`/`opacity`** — never animate width/height/top/left. Avoid `will-change` on more than a few elements.
- **Use `useTransition`/`useDeferredValue`** for non-urgent state updates to keep the UI responsive.
- **Prefer derived state over useEffect** for computed values.

### Loading States

- **NEVER use "..." dots** for loading states in buttons. Use a spinner component or icon.
- Pattern: `{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : t("save")}`

### Form Inputs & Labels

- **Add Lucide icons to ALL form labels and inputs** — every input field, textarea, and select should have a relevant Lucide icon. Use `inline size-3.5` class on the icon.
- Pattern: `<FormLabel><User className="inline size-3.5" /> {t("name")}</FormLabel>`
- For inputs with icons inside: use a wrapper div with the icon positioned absolutely at the start, and `pl-9` on the input.

### shadcn/ui Component Rule

- **If a component exists in the shadcn/ui library, use it** — never build custom versions of Button, Dialog, Select, Input, etc. Download via `npx shadcn@latest add <component>` and use the official API.
- **`cursor-pointer` on ALL interactive elements** — buttons, dropdowns, selects, links, toggles, switches, cards with onClick. If a shadcn component doesn't include it by default, add it via className or override in `components/ui/`.

## UI / Styling

### Button Component

- **ALWAYS use shadcn/ui Button** with ONLY variants and sizes.
- **NEVER add Tailwind classes** that duplicate what a variant already provides.
- Only add `className` for: layout positioning (`w-full`, `flex-1`) or conditional states (`isOpen && "border-primary"`)

### Typography

- Use typography components from `@/components/ui/typography.tsx` for admin/app pages.
- For landing page sections, raw HTML elements (`<h2>`, `<p>`) with Tailwind classes are fine — they give more design flexibility.

### ScrollArea (shadcn/ui) — PREFERRED for all scrollable areas

- **Always prefer ScrollArea** over native overflow scrolling. Use it for any scrollable content area.
- **Radix uses `display: table` internally** on the Viewport, which breaks height calculation in flex containers.
- **Always add `min-h-0`** to ScrollArea when it's a flex child (e.g., `className="flex-1 min-h-0"`).
- **Always add `viewportClassName="!overflow-y-scroll"`** to force the viewport to scroll — the `!important` is required to override Radix's inline styles.
- **Parent flex container must have a fixed/constrained height** (e.g., `h-screen`, `h-[80vh]`) — `h-auto` will NOT work because the container grows with content instead of constraining it.
- **Never use `h-auto` with `max-h-*`** on a ScrollArea's parent flex container — use a fixed height instead (e.g., `md:h-[80vh]` not `md:h-auto md:max-h-[80vh]`).
- **Use `h-0 flex-1` pattern** as an alternative — `h-0` provides a definite base height (0px), `flex-1` grows it. The viewport's `height: 100%` then resolves correctly.
- **For admin-style layouts**: constrain the shell to viewport height (`h-svh max-h-svh overflow-hidden`), then use `<ScrollArea className="h-0 flex-1">` for the content area.

```tsx
// CORRECT pattern for ScrollArea in flex layouts
<div className="h-screen flex flex-col">
  <header>...</header>
  <ScrollArea className="flex-1 min-h-0" viewportClassName="!overflow-y-scroll">
    <div className="p-4">{content}</div>
  </ScrollArea>
  <footer>...</footer>
</div>
```

### Color

- **Semantic color naming** - Use `text-foreground`, `bg-background`, etc. Never use raw color values.
- **Custom color tokens** - Define brand colors as CSS variables in globals.css with semantic names (e.g., `--forest`, `--leaf`, `--cream`). Reference them via Tailwind classes (`bg-forest`, `text-leaf`).

### CSS Transitions

- **Never toggle a CSS property on/off with `transition-all`** — e.g., toggling `border-b` causes a flicker because the property appears/disappears. Instead, keep the property always present and toggle its VALUE: use `border-transparent` (invisible) vs `border-border` (visible).
- **Always use `transition-all duration-300`** or `transition-colors` on interactive elements. No jarring state changes.

### Tailwind 4

- **Use canonical class names** — `z-100` not `z-[100]`, `bg-linear-to-t` not `bg-gradient-to-t`. Tailwind 4 lint will flag these.

### Mobile Design

- **Mobile menus must be slide-in panels** — not cramped dropdowns. Use a full-height panel sliding from the right with backdrop blur overlay, body scroll lock, and proper close button.
- **Icon-only buttons on mobile when space is tight** — hide button text with `hidden sm:inline` on the text span, keep the icon always visible. Prevents layout breaking on small screens.
- **Always add `cursor-pointer`** to all interactive/clickable elements.

### Icon Components

- **`SocialIcon`** (`@/components/social-icon.tsx`) — ALWAYS use for social media links in footer, contact sections, navbar. Never build custom social buttons. Provides platform-specific colors (instagram, youtube, facebook, twitter, tiktok, linkedin, spotify) and hover effects.
- **`CircleIcon`** (`@/components/CircleIcon.tsx`) — Use for icon display in feature cards, services, about sections, highlights. Renders a Lucide icon inside a colored circular background.
- **Lucide icons** — Only use raw Lucide icons for small inline UI elements (button icons, form labels, nav items). For any prominent icon display, wrap in `CircleIcon`.
- **`ExpandMap`** (`@/components/expand-map.tsx`) — ALWAYS use for map displays (contact sections, footer, location pages). Never embed raw Google Maps iframes. Props: `address`, `mapsUrl`, `coordinates`.

## Landing Page Patterns

- **Extract business constants** — All hardcoded business data (phone, email, addresses, social URLs, map embeds) goes in `lib/general/constants.ts` as a single exported object. Never scatter these as magic strings across components.
- **Smooth scrolling** — Add `scroll-behavior: smooth` to the html element in globals.css. All anchor links (`#services`, `#contact`) then scroll smoothly.
- **Real photos over icons for services/products** — Lucide icons look generic. Use actual photos with gradient overlays and text on top. Download from Pexels if needed.
- **Image download verification** — When downloading images from Pexels or similar: search by keyword, download, then VISUALLY VERIFY the image matches. IDs and random URLs frequently return wrong/unrelated images. Expect 2-3 retry rounds.
- **Navbar scroll pattern** — Fixed position, transparent over hero, solid on scroll. Always keep `border-b` present and toggle between `border-transparent` / `border-border` to avoid transition flicker.

## Next.js Patterns

- **Always await params in pages/layouts** - Next.js 16 requirement. `params` is a `Promise<{ locale: string }>`, not a plain object.
- **Never place `redirect()` inside try-catch blocks** - `redirect()` throws internally to trigger navigation; catching it silently breaks the redirect.

  ```typescript
  // GOOD
  const data = await fetchData();
  if (!data) redirect("/error");

  // BAD
  try {
    if (!data) redirect("/error"); // Gets caught!
  } catch (error) {
    // Redirect fails
  }
  ```

## Drag & Drop (dnd-kit)

- **Use `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`** for any drag-and-drop UI.
- **`PointerSensor` with `distance: 8`** — prevents accidental drags when clicking interactive elements.
- **`closestCorners`** collision detection for column/grid-based layouts (e.g., Kanban boards).
- **`DragOverlay`** — always render a ghost card while dragging for smooth UX. Apply `shadow-xl rotate-2 opacity-90` for a natural "picked up" feel.
- **`useSortable`** for draggable items, **`useDroppable`** for drop targets (columns).
- **Optimistic updates** — move item visually on drop, revert on API error.

## State Transitions

- **`VALID_TRANSITIONS` map** — define allowed transitions as `Record<Status, Status[]>`. Keep it client-side for instant validation before API calls.
- **Flexible forward skips** — don't force step-by-step. Users should be able to skip stages forward (e.g., PREPARING → DELIVERING directly).
- **Terminal states** — map to empty arrays `[]`. Disable drag on items in terminal states.
- **Special transitions** — some transitions may require extra input (e.g., reason for rejection, estimated time). Show a dialog before confirming the transition.

## Reusable Component Extraction

- **Extract when 3+ duplications exist** across the codebase.
- **Standard reusable set** — keep these in `components/` (not `components/ui/`):
  - `EmptyState` — icon + title + optional description
  - `PageHeader` — title + optional description + children slot for action buttons
  - `UserAvatar` — image with initials fallback, size variants (sm/md/lg)
  - `PaginationControls` — prev/next buttons with page count, auto-hides when totalPages <= 1

## Workflow

- **Lessons go in `tasks/lessons.md`** - NEVER use the auto memory system for coding rules or user preferences. After ANY correction from the user, immediately update THIS file. Read this file at session start.
- **Error Checking Protocol** - After completing work on any file: (1) Run `pnpm tsc --noEmit`, (2) Run `pnpm lint`, (3) Fix ALL errors before moving on.
- **Code Review Mindset** - Question if implementation is correct. Push back on incorrect requirements. Prefer native solutions over reinventing the wheel. Check for latest best practices.
- **Screenshot verification** - After each meaningful UI change, screenshot and visually verify. Don't batch all changes and check once at the end. Catch issues early.

---

_Update this file after any correction from the user. Write rules that prevent the same mistake._
