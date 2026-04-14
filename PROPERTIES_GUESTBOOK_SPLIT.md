# Properties ↔ Guestbook — what lives where

Two sections, two jobs:

- **Properties** = the business side — everything that defines the listing itself (what it is, what it offers, what the rules are, what it costs).
- **Guestbook** = the guest-experience side — the personal layer the host designs for their guests (welcome message, local tips, contacts, AI knowledge).

Facilities and House Rules belong to **Properties** because they are part of the listing. Guestbook shows them as **read-only previews** with a link back to Properties to edit.

---

## Properties — Edit Property page

Vertical-tab form at `/admin/properties/[id]`. Five editable tabs:

| Tab | What's in it |
|---|---|
| **Basic** | Name, address, city, country, slug / guest URL preview |
| **Photos** | Cover photo + gallery (URL-based, via `PhotosTab`) |
| **Facilities** | Amenity editor: quick-add chips (pool / parking / garden / bbq / gym / laundry) + manual entry with category / name / hours / notes (via `AmenitiesTab`) |
| **House rules** | Structured policies (smoking / pets / parties / children / max guests via `PoliciesSection` with ToggleGroup) + check-in/out times + quiet hours + access info (gate code, parking, building access, emergency phone) + local tips + free-text rules list (via `RulesTab`) |
| **Booking settings** | Nightly rate, cleaning fee, city tax, security deposit, min-stay (default + peak), peak season dates, instant book, cancellation policy, advance notice, booking window, payment method, deposit percent (via `BookingSettingsTab`) |

Plus **Danger Zone** (archive / delete / export) at the bottom.

Save button only appears on the **Basic** tab — the other four tabs each have their own save buttons and manage their own saves.

**Deep linking:** the Edit Property page reads a `?tab=` query param, so links like `/admin/properties/<id>?tab=facilities` or `?tab=houseRules` open the page on the right tab. Used by the Guestbook "Edit in Properties →" links.

---

## Guestbook — `/admin/guestbook`

Vertical-tab layout like Settings. Sticky sidebar on the left, content card on the right. Top bar has a **property selector** + an **Open preview** button that opens the guest page (`xenia.app/stay/<slug>`) in a new tab.

| Tab | What's in it | Editable? |
|---|---|---|
| **Welcome** | Host display name, welcome message, host photo, brand color — falls back to the Settings profile when empty | ✅ editable |
| **Local area** | Nearest beach / supermarket / pharmacy / hospital / ATM, distance to airport, distance to city center | ✅ editable |
| **Facilities** | Amenity cards with "Edit facilities in Properties →" link | 👁 read-only preview |
| **House rules** | Structured policy badges (colored by value) + quiet hours + check-in/out + free-text rules + "Edit rules in Properties →" link | 👁 read-only preview |
| **Contacts** | Emergency / medical / transport / food / services / pharmacy contacts with quick-add chips for Greek emergency numbers | ✅ editable |
| **AI knowledge** | Knowledge entries (Q/A) with category filter, quick-start chips, unanswered-questions banner | ✅ editable |
| **Share** | Guest page URL + copy link + QR code + download PNG / print | — |

Tab clicks smooth-scroll the page to the top. Sidebar stays pinned while you scroll the content.

---

## Mental model

> "If it affects what the **host sells**, it's in **Properties**.
> If it affects what the **guest sees during their stay**, it's in **Guestbook**."

Facilities and House Rules **affect both**, so they are editable in **Properties** (because they're part of the listing) and shown as **read-only previews** in Guestbook with a deep link back.

Properties: photos, facilities, house rules, pricing, booking rules → the listing.
Guestbook: welcome message, local area, contacts, AI knowledge, QR code → the stay experience the host personally curates.

---

## Components

**New / used in this split:**
- `components/admin/location-tabs/amenities-tab.tsx` — editable Facilities tab
- `components/admin/location-tabs/rules-tab.tsx` — editable House Rules tab (composes `PoliciesSection`)
- `components/admin/guestbook/facilities-preview.tsx` — Guestbook read-only Facilities panel
- `components/admin/guestbook/house-rules-preview.tsx` — Guestbook read-only House Rules panel

**No database changes** — all fields still live on the Location model. The split is purely UI.
