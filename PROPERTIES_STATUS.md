# Properties Section — Build Status

Complete overview of what's built in the Properties management section.

## Terminology

| UI label | DB model | Purpose |
|---|---|---|
| **Property** | `Location` | Top-level container (complex, estate, building). Holds shared data. |
| **Unit** | `Property` | Individual apartment. Can be rented. |
| **Reservation** | `Reservation` | Guest stay, belongs to a Unit. |
| **Contact** | `Contact` | Important phone numbers at the Property level. |

> Property must have **at least one Unit**. No more standalone units.

---

## Data Model

### Property (DB: `Location`)

Shared across all its units:

- **Basic info**: name, slug, address, city, country
- **Check-in / Check-out times**: default 15:00 / 11:00
- **Quiet hours**: default 23:00 — 08:00
- **Access**: gate code, parking info, building access
- **Amenities** (JSON array): pool, parking, bbq, garden, gym, spa, laundry, reception, restaurant, other — each with name, hours, notes
- **Rules** (JSON array): free-text house rules with categories
- **Local tips for AI** — host's personal recommendations
- **Emergency phone**
- **Contacts** (relation): categorized phone numbers (emergency, medical, transport, food, services, pharmacy, other)

### Unit (DB: `Property`)

Apartment-specific data:

- **Name** (e.g. "Apartment 3"), slug
- **WiFi name + password** (with show/hide toggle in form)
- **Description** (for guests)
- **House rules** (unit-specific, e.g. "shoes off inside")
- **Apartment specs**: square meters, bedrooms, bathrooms, beds, max guests
- **Location relation**: inherits address, check-in/out times, local tips, emergency phone, amenities, rules, contacts from its parent Property

---

## Properties List Page — `/admin/properties`

### Layout

- **Page header**: "Properties" + description + single **"Add property"** button
- **Empty state**: Building2 icon, "No properties yet" message + CTA
- **Property cards** (one per Location)

### Property card header

- Property name with MapPin icon
- City, country
- Action buttons row (right-aligned):
  - **Edit property** (pencil)
  - **Contacts** (phone)
  - **Add unit** (plus)

### Property card body

Two states:

#### Empty state — no units yet
- Amber warning banner: "No units yet — add the first unit to start accepting bookings"
- Direct **"Add first unit"** button → jumps to Step 2 of wizard

#### With units
Grid of unit cards (2 cols md / 3 cols lg). Each unit card shows:

- **Unit name** + actions dropdown (Edit / QR Code / Delete)
- **Specs strip**: `85m² · 2BR · 1BA · 4` (Ruler, BedDouble, Bath, Users icons)
- **Today/tomorrow alert** (amber pill, when applicable):
  - "[Guest] arrives today" (LogIn icon)
  - "[Guest] departs today" (LogOut icon)
  - "[Guest] departs tomorrow — schedule cleaning" (CalendarClock icon)
  - "Back-to-back turnover — [Guest] arrives same day" (AlertTriangle icon)
- **Upcoming reservations list** (up to 2 rows):
  - Status dot: green (active) / primary blue (upcoming)
  - Guest name
  - Status pill: "ACTIVE" (green with pulsing white dot) or "UPCOMING" (soft primary)
  - Guest count + check-in date
  - **Click any row** → opens shared reservation detail sheet

---

## Create Property Flow — 2-step Wizard

### Step 1 — Property basics — `/admin/locations/new`

- **WizardSteps indicator** at top: step 1 active (blue circle with glow), step 2 pending
- White card with subtle shadow:
  - Property name (required)
  - Address
  - City
  - Country (default "Greece")
- **Continue →** button bottom-right

On save: creates the Property, redirects to Step 2 with `?locationId=X&firstUnit=1`.

### Step 2 — First unit — `/admin/properties/new?locationId=X&firstUnit=1`

- WizardSteps indicator: step 1 completed (checkmark), step 2 active
- Full PropertyForm with all unit fields
- Address/check-in-out times/local tips/emergency phone **hidden** (inherited from the property, shown as info card)
- On save: redirects to `/admin/properties`

### Guards

- `/admin/properties/new` without `locationId` → redirects to `/admin/properties`
- `/admin/properties/new?locationId=INVALID` → redirects to `/admin/properties`

---

## Edit Property Flow — `/admin/locations/[id]`

**Layout**: 3xl max-width centered column with tab-based form.

### Tabs

1. **Basic info** — name, address, city, country (card with white bg, subtle shadow)
2. **Amenities** — dynamic list with quick-add buttons (Pool, Parking, BBQ, Garden, Gym, Laundry)
3. **Rules & access** — check-in/out times, quiet hours, gate code, parking, building access, emergency phone, local tips for AI, house rules with quick-add (No smoking, No parties, No pets, Quiet after 23:00)
4. **Contacts** — category-colored cards with Greek emergency number suggestions (112, 166, 100, 199)

Each tab content in a rounded-2xl **white card** with `border-border/40` and `shadow-xenia` (ambient shadow).

### Save

Right-aligned **"Save changes"** button (size lg), primary styling.

### Danger Zone

At the bottom of the page (outside tabs), destructive-styled section:

- **Red bordered card** with `bg-destructive/5` tint
- Title: "Danger zone" in destructive color
- Hint: "Delete this property permanently. This will also delete its N units and all their reservations."
- **"Delete property"** outline button (red)
- Click → AlertDialog confirmation with property name and unit count
- On confirm → `deleteLocation` cascades:
  - Deletes all child units (DB Properties)
  - Units' reservations cascade-delete automatically (Prisma `onDelete: Cascade`)
  - Redirects to `/admin/properties`

---

## Edit Unit Flow — `/admin/properties/[id]`

Card-based form. When unit has a `locationId`:

- **Inherited info card** (not editable): address, check-in/out times, local tips, emergency phone — with note "Inherited from [Property Name]"
- **Editable fields**: name, WiFi, description, house rules, apartment specs (sqm/BR/BA/beds/max guests)

Dropdown actions: Edit / QR Code / Delete (with confirmation).

---

## Unit Utilities

### QR Code page — `/admin/properties/[id]/qr`

- Large QR code generated from `https://xenia.app/stay/[slug]` via `react-qr-code`
- Download as PNG (via canvas) + Print buttons
- Instructions: "Print this and place it in your apartment. Guests scan it..."

### Delete Unit

- Client component `PropertyActions` with dropdown (MoreHorizontal)
- Menu: Edit / QR Code / (separator) / Delete (red icon + red text)
- Click → AlertDialog confirmation showing unit name
- On confirm: `deleteProperty` + toast + revalidate

---

## Reservation Integration

Units are the targets for reservations. When creating a reservation:

1. Host enters check-in + check-out dates first
2. Form calls `getAvailableProperties(checkIn, checkOut)` — debounced 300ms
3. Only units without overlapping non-cancelled reservations appear in the dropdown
4. If no units available: red message "No properties available for these dates"
5. Server-side validation on create/update prevents double bookings

### Upcoming reservations on unit cards

- Server action `getProperties` / `getLocations` includes up to 3 upcoming reservations per unit (`checkOut >= now`, sorted by `checkIn asc`, excluding cancelled)
- Displayed as interactive buttons that open the shared `ReservationDetailSheet` — same component used by the calendar

---

## Shared Components

### `ReservationDetailSheet`
Shared Sheet component used by both:
- **Calendar** (click an event)
- **Property cards** (click a reservation row)

Shows: source badge, guest name + nationality, property, check-in/out dates, duration in nights, guest count, special requests, action buttons (View guest page, Edit reservation, Message guest).

### `WizardSteps`
Generic multi-step indicator used in the Create Property flow:
- Numbered circles (filled with checkmark when complete, outlined with glow ring when active, muted when pending)
- Connecting line between steps (solid primary when completed)
- Label + description below each circle

### `UpcomingReservations`
Client component that lists reservations inside a property card with click-to-open-sheet behavior.

### `PropertySpecs`
Inline specs strip with icons. Only renders items that have a value.

### `PropertyAlert`
Server component that computes today/tomorrow/back-to-back alerts from an upcoming reservations list and displays a single most-urgent alert pill.

### `PropertyActions`
Dropdown menu with Edit / QR Code / Delete actions for a unit. Includes the delete confirmation dialog.

### `LocationDangerZone`
Red-bordered destructive zone with delete confirmation for a property.

---

## Server Actions

### `server_actions/properties.ts`
- `getProperties()` — all units with upcoming reservations
- `getPropertyById(id)` — single unit + location (for inheritance)
- `getAvailableProperties(checkIn, checkOut)` — units without overlaps
- `createProperty(data)` — create a unit (requires locationId now)
- `updateProperty(id, data)` — update unit
- `deleteProperty(id)` — delete unit (cascades reservations)

### `server_actions/locations.ts`
- `getLocations()` — all properties with nested units + upcoming reservations
- `getLocationById(id)` — single property with units + contacts
- `createLocation(data)` — create property
- `updateLocation(id, data)` — update property
- `deleteLocation(id)` — cascade-delete units and reservations
- Contact CRUD: `getContacts`, `createContact`, `updateContact`, `deleteContact`

All actions follow the standard pattern: `getServerSession` auth check → ownership verification → try-catch with `{ success, error, data }` return shape → `revalidatePath("/admin")`.

---

## Layout & Spacing

- Edit Property page: `max-w-3xl mx-auto` centered column
- Tab panels: white card (`bg-card`) with `border-border/40` border and `shadow-xenia` ambient shadow, `p-6 sm:p-8` padding, `rounded-2xl`
- Wizard Step 1 form: same white card treatment
- Danger Zone: red-tinted bordered card at the bottom of the edit page

---

## Translations

All strings in EN + EL:
- `Admin.locations.*` — property-level labels
- `Admin.locations.wizard.*` — wizard step titles/descriptions
- `Admin.properties.*` — unit-level labels
- `Admin.locations.dangerZone`, `deleteProperty`, etc.

---

## Not Yet Built

- Unit photo upload
- Unit-level availability calendar (public booking page)
- Multi-property bulk actions
- Unit duplication (clone an existing unit as a template for new ones)
- iCal sync (deferred)
- Nightly rate + pricing rules
