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

const targets = [
  {
    propertyId: "cmo2wai1a000150uvk9i067y3", // Studio 3 — arriving today
    guestName: "Pierre Martin",
    guestEmail: "pierre@example.com",
    guestNationality: "FR",
    numberOfGuests: 2,
    checkIn: d(0),
    checkOut: d(4),
    source: "direct",
  },
  {
    propertyId: "cmo2wvchn000350uvhzwxi3he", // Apartment1 — occupied
    guestName: "Olga Petrova",
    guestEmail: "olga@example.com",
    guestNationality: "GR",
    numberOfGuests: 3,
    checkIn: d(-3),
    checkOut: d(2),
    source: "booking.com",
  },
  {
    propertyId: "cmo2yluaw0007tsuvy3wq9v59", // Suite Apollo — arriving soon
    guestName: "Tom Jensen",
    guestEmail: "tom@example.com",
    guestNationality: "DK",
    numberOfGuests: 2,
    checkIn: d(2),
    checkOut: d(7),
    source: "airbnb",
  },
  {
    propertyId: "cmo2ylud1000qtsuvxd81a61b", // Seaside Studio — departing today
    guestName: "Carla Rossi",
    guestEmail: "carla@example.com",
    guestNationality: "IT",
    numberOfGuests: 2,
    checkIn: d(-5),
    checkOut: d(0),
    source: "booking.com",
  },
];

for (const t of targets) {
  const r = await prisma.reservation.create({
    data: { ...t, status: "confirmed" },
  });
  console.log(`Created reservation ${r.id} → ${t.guestName}`);
}

await prisma.$disconnect();
console.log("\nDone — 4 reservations added.");
