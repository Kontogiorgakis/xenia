// Seed script: creates test locations, properties, and reservations
// Run: node scripts/seed-properties.mjs

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { PrismaLibSql } = require("@prisma/adapter-libsql");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:dev.db" });
const prisma = new PrismaClient({ adapter });

function d(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(12, 0, 0, 0);
  return date;
}

async function main() {
  // Find or create user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Demo Host",
        email: "demo@xenia.app",
      },
    });
  }
  console.log("Using host:", user.id, user.name);

  // --- LOCATION 1: Multi-unit hotel with amenities ---
  const loc1 = await prisma.location.create({
    data: {
      name: "Aegean Breeze Suites",
      slug: "aegean-breeze-" + Date.now(),
      city: "Chania",
      country: "Greece",
      isSingleUnit: false,
      hostId: user.id,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      bookingEnabled: true,
      bookingToken: "bk-aegean-" + Date.now(),
      amenities: JSON.stringify([
        { id: "a1", category: "pool", name: "Infinity Pool", hours: "08:00-20:00" },
        { id: "a2", category: "parking", name: "Free Parking" },
        { id: "a3", category: "bbq", name: "BBQ Area" },
        { id: "a4", category: "garden", name: "Rooftop Garden" },
        { id: "a5", category: "spa", name: "Spa & Sauna", hours: "10:00-18:00" },
        { id: "a6", category: "laundry", name: "Laundry Room" },
        { id: "a7", category: "restaurant", name: "Breakfast Buffet", hours: "07:00-10:30" },
      ]),
    },
  });
  console.log("Created location:", loc1.name);

  // Unit 1: currently occupied
  const unit1 = await prisma.property.create({
    data: {
      name: "Suite Poseidon",
      slug: "poseidon-" + Date.now(),
      hostId: user.id,
      locationId: loc1.id,
      squareMeters: 55,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 3,
      nightlyRate: 120,
      wifiName: "AegeanBreeze-5G",
    },
  });
  await prisma.reservation.create({
    data: {
      propertyId: unit1.id,
      guestName: "Maria Schmidt",
      guestEmail: "maria@example.com",
      guestNationality: "DE",
      numberOfGuests: 2,
      checkIn: d(-2),
      checkOut: d(3),
      source: "booking.com",
      status: "confirmed",
    },
  });

  // Unit 2: arriving today
  const unit2 = await prisma.property.create({
    data: {
      name: "Suite Athena",
      slug: "athena-" + Date.now(),
      hostId: user.id,
      locationId: loc1.id,
      squareMeters: 42,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      nightlyRate: 95,
      wifiName: "AegeanBreeze-5G",
    },
  });
  await prisma.reservation.create({
    data: {
      propertyId: unit2.id,
      guestName: "Jean Dupont",
      guestEmail: "jean@example.com",
      guestNationality: "FR",
      numberOfGuests: 2,
      checkIn: d(0),
      checkOut: d(5),
      source: "direct",
      status: "confirmed",
    },
  });

  // Unit 3: available (no reservations)
  await prisma.property.create({
    data: {
      name: "Suite Apollo",
      slug: "apollo-" + Date.now(),
      hostId: user.id,
      locationId: loc1.id,
      squareMeters: 60,
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      nightlyRate: 150,
      wifiName: "AegeanBreeze-5G",
    },
  });

  // Unit 4: departing today
  const unit4 = await prisma.property.create({
    data: {
      name: "Suite Artemis",
      slug: "artemis-" + Date.now(),
      hostId: user.id,
      locationId: loc1.id,
      squareMeters: 38,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      nightlyRate: 85,
    },
  });
  await prisma.reservation.create({
    data: {
      propertyId: unit4.id,
      guestName: "James Wilson",
      guestEmail: "james@example.com",
      guestNationality: "GB",
      numberOfGuests: 1,
      checkIn: d(-4),
      checkOut: d(0),
      source: "airbnb",
      status: "confirmed",
    },
  });

  // Unit 5: back-to-back (checkout + checkin same day)
  const unit5 = await prisma.property.create({
    data: {
      name: "Suite Hermes",
      slug: "hermes-" + Date.now(),
      hostId: user.id,
      locationId: loc1.id,
      squareMeters: 45,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      nightlyRate: 100,
    },
  });
  // First reservation ending today
  await prisma.reservation.create({
    data: {
      propertyId: unit5.id,
      guestName: "Anna Kowalski",
      guestEmail: "anna@example.com",
      guestNationality: "PL",
      numberOfGuests: 2,
      checkIn: d(-3),
      checkOut: d(0),
      source: "booking.com",
      status: "confirmed",
    },
  });
  // Second reservation starting today
  await prisma.reservation.create({
    data: {
      propertyId: unit5.id,
      guestName: "Luca Rossi",
      guestEmail: "luca@example.com",
      guestNationality: "IT",
      numberOfGuests: 2,
      checkIn: d(0),
      checkOut: d(4),
      source: "direct",
      status: "confirmed",
    },
  });

  // Unit 6: arriving soon (in 2 days)
  const unit6 = await prisma.property.create({
    data: {
      name: "Suite Dionysus",
      slug: "dionysus-" + Date.now(),
      hostId: user.id,
      locationId: loc1.id,
      squareMeters: 50,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 3,
      nightlyRate: 110,
    },
  });
  await prisma.reservation.create({
    data: {
      propertyId: unit6.id,
      guestName: "Sofia Andersson",
      guestEmail: "sofia@example.com",
      guestNationality: "SE",
      numberOfGuests: 2,
      checkIn: d(2),
      checkOut: d(7),
      source: "direct",
      status: "confirmed",
    },
  });

  // --- LOCATION 2: Single-unit villa, occupied ---
  const loc2 = await prisma.location.create({
    data: {
      name: "Villa Eleni",
      slug: "villa-eleni-" + Date.now(),
      city: "Rethymno",
      country: "Greece",
      isSingleUnit: true,
      hostId: user.id,
      checkInTime: "16:00",
      checkOutTime: "10:00",
      bookingEnabled: true,
      bookingToken: "bk-eleni-" + Date.now(),
      amenities: JSON.stringify([
        { id: "b1", category: "pool", name: "Private Pool" },
        { id: "b2", category: "parking", name: "Covered Parking" },
        { id: "b3", category: "garden", name: "Olive Garden" },
      ]),
    },
  });
  const villa = await prisma.property.create({
    data: {
      name: "Villa Eleni",
      slug: "villa-eleni-unit-" + Date.now(),
      hostId: user.id,
      locationId: loc2.id,
      squareMeters: 120,
      bedrooms: 3,
      bathrooms: 2,
      maxGuests: 6,
      nightlyRate: 250,
      wifiName: "VillaEleni_WiFi",
    },
  });
  await prisma.reservation.create({
    data: {
      propertyId: villa.id,
      guestName: "Hans Mueller",
      guestEmail: "hans@example.com",
      guestNationality: "DE",
      numberOfGuests: 4,
      checkIn: d(-1),
      checkOut: d(5),
      source: "booking.com",
      status: "confirmed",
    },
  });
  await prisma.reservation.create({
    data: {
      propertyId: villa.id,
      guestName: "Emily Chen",
      guestEmail: "emily@example.com",
      guestNationality: "US",
      numberOfGuests: 3,
      checkIn: d(8),
      checkOut: d(14),
      source: "direct",
      status: "confirmed",
    },
  });

  // --- LOCATION 3: Single-unit, available (no reservations) ---
  const loc3 = await prisma.location.create({
    data: {
      name: "Seaside Studio",
      slug: "seaside-studio-" + Date.now(),
      city: "Heraklion",
      country: "Greece",
      isSingleUnit: true,
      hostId: user.id,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      bookingEnabled: false,
      amenities: JSON.stringify([
        { id: "c1", category: "parking", name: "Street Parking" },
      ]),
    },
  });
  await prisma.property.create({
    data: {
      name: "Seaside Studio",
      slug: "seaside-studio-unit-" + Date.now(),
      hostId: user.id,
      locationId: loc3.id,
      squareMeters: 35,
      bedrooms: 0,
      bathrooms: 1,
      maxGuests: 2,
      nightlyRate: 65,
      wifiName: "Seaside_Guest",
    },
  });

  // --- LOCATION 4: Multi-unit, empty (no units yet) ---
  await prisma.location.create({
    data: {
      name: "Mountain Retreat",
      slug: "mountain-retreat-" + Date.now(),
      city: "Arachova",
      country: "Greece",
      isSingleUnit: false,
      hostId: user.id,
    },
  });

  console.log("\nSeed complete! Created:");
  console.log("  - Aegean Breeze Suites (multi-unit, 6 units, mixed statuses)");
  console.log("  - Villa Eleni (single-unit, occupied)");
  console.log("  - Seaside Studio (single-unit, available)");
  console.log("  - Mountain Retreat (multi-unit, no units — empty state)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
