# Xenia — Build Status

A hospitality management SaaS for short-term rental hosts. Connects hosts with their guests through AI, replacing scattered WhatsApp messages and paper manuals with a single intelligent tool.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** components
- **NextAuth.js** with Google OAuth
- **Prisma 7** with **SQLite** (libsql adapter) for local dev
- **next-intl** — i18n (English + Greek)
- **Zustand** for client state
- **Framer Motion** for animations
- **react-big-calendar** + **date-fns** for calendar views
- **react-qr-code** for QR generation

## Database Models

- **User** — host account (NextAuth + bio, phone, displayName, avatarUrl, notificationPrefs)
- **Property** — apartment with WiFi, check-in times, house rules, local tips, optional `locationId`
- **Location** — groups multiple properties (complex/estate) with shared amenities, rules, access codes, quiet hours
- **Contact** — important local contacts at the location level (emergency, taxi, pharmacy, etc.)
- **Reservation** — guest stay with check-in/out, source, status, unique guest token
- **Todo** — leftover from template (unused)

---

## Features Built

### 1. Authentication
- Google OAuth via NextAuth
- Session-aware admin layout (redirects to error page if not signed in)
- User profile auto-upserted on first sign-in

### 2. Admin Dashboard (`/admin/dashboard`)
- 4 metric cards: Total Properties, Active Guests, Arriving This Week, Reservations This Month
- "Arriving Soon" list (next 5 upcoming reservations)
- "Currently Staying" list with days-remaining indicator
- Quick action buttons: Add Property, Add Reservation, View All Reservations

### 3. Calendar (`/admin/calendar`)
- **Month view** — react-big-calendar grid
- **Week view** — 7-day timeline
- **Timeline view** — custom-built component with properties as rows, 30 horizontal date columns
  - Back-to-back booking detection with warning icons
- Color-coded reservations by source (Booking.com blue, Airbnb red, Direct green, Other gray)
- Property filter dropdown
- Source legend
- Reservation detail slide-out panel (Sheet) with View Guest Page, Edit, Message buttons
- Today / Prev / Next navigation

### 4. Properties (`/admin/properties`)
- **Two-level hierarchy**: Locations group properties; standalone properties shown separately
- Location cards with stats and edit/contacts/add-property buttons
- Nested property cards with WiFi status, reservation count, edit/QR actions
- Empty state with "Add your first location" CTA
- Add Location and Add Standalone Property buttons

#### Property Form (Create + Edit)
- Sections: Basic Info, Guest Info (WiFi, times, rules, description), Local Tips for AI, Emergency Contacts
- Auto-generates URL slug on name blur
- Show/hide WiFi password toggle
- Local tips character counter

#### QR Code Page
- Large QR code linking to `xenia.app/stay/[slug]`
- Download as PNG and Print buttons

### 5. Locations (`/admin/locations/new`, `/admin/locations/[id]`)
4-tab form for managing complexes/estates:

- **Basic Info** — name, address, city, country, slug preview
- **Amenities** — dynamic list with quick-add buttons (Pool, Parking, BBQ, Garden, Gym, Laundry); each amenity has category, name, hours, notes
- **Rules & Access** — quiet hours, gate code, parking info, building access, house rules with quick-add (No smoking, No parties, etc.)
- **Contacts** (edit mode only) — full contacts management

### 6. Contacts (`/admin/locations/[id]/contacts`)
- Category-colored cards (emergency=red, medical=red, transport=blue, food=amber, services=gray, pharmacy=green)
- Pre-filled suggestions: Greek emergency numbers (112, 166, 100, 199), local taxi, pharmacy, doctor, etc.
- Suggestion click pre-fills form, host adds phone number
- Inline add/edit/delete

### 7. Reservations (`/admin/reservations`)
- Filterable table: All / Upcoming / Active / Completed (URL search params)
- Columns: Guest name + nationality + count, Property, Check-in, Check-out, Source badge, Status badge, Edit action
- Empty state with "Add your first reservation"

#### Reservation Form (Create + Edit)
- Guest details: name, email, phone, nationality, count
- Stay details: property, check-in/out dates, source, special requests
- Status selector (Confirmed/Active/Completed/Cancelled) when editing
- On create: success screen with guest URL, Copy Link, Send via WhatsApp buttons

### 8. Settings (`/admin/settings`)
Two-column layout (vertical tab nav + content) with 4 sections:

#### Profile
- Avatar, full name, display name, email (read-only from Google), phone, bio with 300-char counter

#### Connected Platforms
- Cards for Booking.com, Airbnb, WhatsApp Business (locked behind "Pro" badge)
- Direct Booking — always active with copy-link
- Upgrade to Pro banner

#### Notifications
- 7 notification types with email/push toggles each
- Types: New reservation, Guest arriving, Guest message, Issue reported, Checkout reminder, AI couldn't answer, Review received
- Save button persists to JSON column on User

#### Subscription & Billing
- Dismissible beta notice
- Current plan card (Starter)
- 3-plan comparison: Starter €29, Pro €59 (recommended), Agency €99
- Empty billing history table

### 9. Inbox (`/admin/inbox`)
- Coming Soon placeholder for Phase 2 — guest messaging from Booking.com, Airbnb, WhatsApp

### 10. Guests (`/admin/guests`)
- Coming Soon placeholder for Phase 2 — guest CRM

---

## Sidebar Navigation
Grouped sections with translated labels:
- **Main** — Dashboard, Calendar, Properties, Reservations
- **Communication** — Inbox (with "Soon" badge)
- **Guests** — Guests
- **Account** — Settings

Avatar dropdown at the bottom with:
- Back to Home
- Language switcher (English ↔ Ελληνικά)
- Theme toggle (Light ↔ Dark mode)
- Sign out

## Header
- Sidebar trigger
- Notification bell (placeholder)

## Design System (`globals.css`)
Xenia color tokens for use across the app:

**Brand colors:** `xenia-deep` (#00426d), `xenia-sea` (#005a92), `xenia-teal` (#006970), `xenia-sunset` (#653100), `xenia-amber` (#884400)

**Surface tones:** `xenia-surface`, `xenia-surface-low`, `xenia-surface-high`, `xenia-surface-variant` — for layered "no-line" depth

**Utilities:**
- `shadow-xenia`, `shadow-xenia-md`, `shadow-xenia-lg` — ambient shadows (4-8% opacity)
- `glass-xenia` — glassmorphism (75% opacity + 20px blur)
- `gradient-xenia` — primary gradient (deep → sea, 135deg)
- `gradient-xenia-warm` — warm CTA gradient (sunset → amber)

Full dark mode variants for all tokens.

---

## Internationalization
- **English** (en) and **Greek** (el) — full translations across all pages
- next-intl with locale-prefixed routes (`/en/admin/...`, `/el/admin/...`)
- Server components use `getTranslations()`, client components use `useTranslations()`
- Type-safe translation keys via `global.d.ts`

## Server Actions Pattern
All server actions follow the same shape:
- `"use server"` directive
- `getServerSession(authOptions)` auth check
- Try-catch with `{ success, error, data }` return shape
- Ownership verification before mutations
- `revalidatePath("/admin")` after mutations

Files: `properties.ts`, `reservations.ts`, `dashboard.ts`, `locations.ts`, `settings.ts`

---

## Not Yet Built (Phase 2+)

- **Guest-facing page** at `/stay/[token]` — public mobile screen with AI chat (the heart of Xenia)
- **AI integration** — Claude API for guest questions
- **iCal sync** with Booking.com / Airbnb (deferred)
- **WhatsApp messaging** integration
- **Stripe billing** activation
- **Email notifications**
- **Inbox** (real messages)
- **Guests CRM**
- **Mobile push notifications**
- **Multi-user / agency mode**

---

## Repo
**https://github.com/Kontogiorgakis/xenia**
