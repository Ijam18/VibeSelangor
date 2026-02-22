# IJAM_OS v3 — Full Feature Plan
**Date:** 2026-02-21 | **Scope:** 8 implementation phases

---

## PHASE 1 — Icon, Favicon & PWA Branding
**Files:** `index.html`, `public/icons/icon-192.svg`, `public/manifest.json`

- **BotFaceLogin inner screen:** Change from navy to yellow (`#F5D000`) background
- **Eyes:** White rectangles only (no circles, no pupils) — two flat white rects side-by-side
- **Mouth:** White rectangle or two-rect grin — NO arcs, NO ellipses, just flat rects per emotion:
  - happy: two rects angled upward (▄ ▄ with different y), or a single wide low rect
  - sad: single narrow rect positioned low
  - neutral: single medium rect centered
  - sleepy: single thin rect, low opacity
  - surprised: rect taller (open-mouth rectangle)
- **Favicon** in `index.html`: Rebuild SVG data URI with yellow inner screen + rect eyes/mouth
- **icon-192.svg**: Same yellow inner, white rect eyes, white rect mouth
- **PWA display name:** `manifest.json` short_name already = "VibeSelangor" ✓

---

## PHASE 2 — Boot Screen Fixes

### 2a. Hold-to-wake (Desktop)
**Problem:** `onMouseDown={isIdle ? onHoldStart : undefined}` — the condition removes the handler dynamically. Also `motion.div` with ongoing animation may consume pointer events.
**Fix:**
- Always attach handlers; gate inside the handler itself (`if (bootPhase !== 'idle') return;`)
- Remove `isIdle ?` ternary from JSX event props
- Add `cursor: bootPhase === 'idle' ? 'pointer' : 'default'` separately

### 2b. System Clock
- Verify `systemTime` / `systemDate` useEffect interval is running (check interval is set up and cleared correctly)

### 2c. Taskbar (macOS menu bar) — Desktop Mode
- Investigate why menu bar isn't rendering — likely the `isBooted` render path is missing the menu bar or it's behind another element
- Read the post-boot desktop render section (~line 3920+) to find and fix

---

## PHASE 3 — AssistiveTouch Polish

### 3a. Hover → Immediate opacity restore
- `onMouseEnter`: call `resetIdle()` (already does), ensure `setIsIdle(false)` runs synchronously before transition

### 3b. Idle sleep state (3s)
- When `isIdle = true`: switch `botEmotion` to `'sleepy'`
- Render floating `ZZZ` animation above the button (3 `z` letters, staggered fade-up keyframes)
- CSS: `@keyframes ijam-snore { 0%{opacity:0;transform:translateY(0)} 60%{opacity:1} 100%{opacity:0;transform:translateY(-24px)} }`
- Three `<span>` elements with animation-delay 0s / 0.4s / 0.8s

### 3c. Periodic tips
- `tipIdx` state + `useEffect` interval (every 28s) cycles through IJAM_TIPS array
- Tip toast: slides in above the bot button, auto-dismisses after 4s
- Sample tips: "Double-tap to chat with me!", "Drag apps to pin them", "Swipe left for widgets", etc.

### 3d. Home page label: "IJAM_BOT_V1"
- Find where AssistiveTouchBot label / home page refers to the bot name and update text to "IJAM_BOT_V1"

---

## PHASE 4 — Mobile iPhone HomeScreen Full Overhaul

### 4a. Layout restructure (remove wasted space, shift up)
- Remove the "pinned apps drop zone" panel above the scroll rail
- Layout: `StatusBar (48px) → HomeGrid (flex-1) → Dock (84px)`
- Shift content 12px higher (reduce top padding)

### 4b. iPhone-style 4-column app grid
- Home screen: 4 columns × N rows, icons 60×60px, gap 16px, label below (10px white)
- Long-press → jiggle mode: icons wiggle (`@keyframes ijam-jiggle`) + ✕ remove badge
- Drag-and-drop reorder in jiggle mode
- `homeApps` state: ordered array of app types (Mind Map, Prompt Forge, Simulator, Arcade, VSHub, Messaging)

### 4c. Dock — 4 utility apps (fixed)
- Bottom dock: Terminal, Files, Settings, Stats — always pinned, not draggable
- Style: frosted glass pill (same as current but fixed 4 icons)
- `onOpenApp(type)` on tap

### 4d. Home page indicator dots
- Row of dots above dock: one per page + widget page (far left dot different color)
- Active page = filled white dot

### 4e. Page swiping
- `currentPage` state: -1 = widget page, 0 = home page 1, 1 = home page 2, etc.
- Touch pan gesture: horizontal swipe detection (touchstart X → touchend X, dx ≥ 50px)
- Swipe right (dx > 0): only if `currentPage > -1 OR homeApps on page 0 > 0`
  - Actually: swipe right → next page only if current page has ≥1 app
  - Swipe left → go to widget page (if on page 0) or previous page
- Pages auto-generated: every 20 app slots = 1 page (4×5 grid)

### 4f. Widget page (swipe left from home)
- Full-height page, slides in from left
- Top: "Widgets" header + Edit button
- Stacked widget cards:
  1. **Builder Progress** — mini line graph (SVG paths), shows day-by-day sprint progress
  2. **Total Builders** — big number, subtitle "Active Sprint Builders"
  3. **Sprint Countdown** — days/hours remaining to sprint end
  4. **Weather** — from `useWeather()` hook (already exists)
  5. **IJAM_BOT Tip** — current tip card with bot face

### 4g. Lock screen swipe-down → Notification/Widget panel
- `lockWidgetOpen` state, swipe down (dy ≤ -60) on lock screen triggers it
- Panel slides from top: blur overlay + frosted card list
- Widgets shown: Sprint Countdown, Total Builders count (from Supabase profiles count), Builder Progress line graph
- Dismiss: tap outside or swipe up

---

## PHASE 5 — Mobile Full-Screen Apps + App Switcher

### 5a. Full-screen app overlay (mobile)
- `mobileOpenApp` state: `null | appType`
- When set: render `<MobileAppOverlay type={mobileOpenApp} onClose={...} />`
- Overlay: `position:fixed, inset:0, zIndex:2000, background:#000`
- Slides up from bottom (framer-motion y: 100vh → 0)
- Status bar stays on top (colored or black)
- Swipe-down from top edge (dy ≥ 80px) → minimize

### 5b. App switcher (swipe-up gesture in-app)
- While an app is open: detect fast upward swipe from bottom (dy ≥ 100px within 300ms)
- Triggers `appSwitcherOpen` state
- Card carousel: each open/recent app shown as a scaled screenshot card
- Scroll horizontally, tap to switch, swipe up card to close
- Empty state: "No recent apps"
- Close switcher: tap outside or swipe down

### 5c. App frame (mobile)
- Each app renders its full content inside the overlay
- Thin top bar: app icon + name (left), ⸺ home indicator (center-bottom)
- No window chrome (no resize, no drag)

---

## PHASE 6 — Terminal Sound Fix
- `useSoundEffects` `playKeystroke` — verify `initAudio()` is called before first sound
- Terminal input handler: call `playKeystroke()` on each character typed
- Read the terminal section in ResourcePage.jsx to find the input handler and add sound call

---

## PHASE 7 — VSHub App Store (new IjamOS app)

### Supabase schema (new SQL file: `supabase_vshub.sql`)
```sql
create table vshub_apps (
  id uuid primary key default gen_random_uuid(),
  builder_id uuid references auth.users,
  title text not null,
  description text,
  url text,
  tags text[],
  likes int default 0,
  created_at timestamptz default now()
);
create table vshub_reviews (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references vshub_apps(id),
  reviewer_id uuid references auth.users,
  rating int check (rating between 1 and 5),
  body text,
  created_at timestamptz default now()
);
```

### App UI (desktop: WindowFrame, mobile: full-screen overlay)
- **Home tab:** Grid of published apps with like count + avg rating
- **Publish tab:** Form (title, description, URL, tags) → insert to vshub_apps
- **App detail:** Reviews list + star rating form
- **My Apps tab:** Builder's own submissions

---

## PHASE 8 — Community Messaging

### Supabase schema (append to supabase_vshub.sql)
```sql
create table messages (
  id bigserial primary key,
  channel text not null default 'general',
  sender_id uuid references auth.users,
  content text not null,
  created_at timestamptz default now()
);
alter table messages enable row level security;
-- realtime enabled
```

### App UI
- **Channels sidebar:** #general, #builds, #feedback
- **Chat area:** Scrollable messages, sender avatar (BotFaceLogin size=24), timestamp
- **Input bar:** Text field + send button
- **Realtime:** Supabase `channel.on('postgres_changes', ...)` subscription
- **Unread badge:** Dot on Messaging dock icon when new messages

---

## IMPLEMENTATION ORDER (recommended)
1. Phase 1 — Icon/favicon (fast, visual win)
2. Phase 2 — Boot fixes (unblocks testing)
3. Phase 3 — AssistiveTouch polish
4. Phase 6 — Terminal sounds
5. Phase 4 — Mobile HomeScreen overhaul (biggest)
6. Phase 5 — Full-screen apps + switcher
7. Phase 7 — VSHub
8. Phase 8 — Messaging

**Estimated affected files:**
- `index.html` (favicon)
- `public/icons/icon-192.svg`
- `public/manifest.json`
- `src/pages/ResourcePage.jsx` (main — all phases)
- `src/utils/useSoundEffects.js` (Phase 6)
- `supabase_vshub.sql` (new — Phase 7+8)
