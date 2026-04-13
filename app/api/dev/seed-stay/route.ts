import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

// GET /api/dev/seed-stay — enriches the first reservation with rich test data
// so you can see all stay-page sections populated.
// This is a dev helper — delete or protect before shipping.

const SAMPLE_AMENITIES = [
  {
    id: "am-1",
    category: "pool",
    name: "Rooftop infinity pool",
    hours: "08:00 – 22:00",
    notes: "Towels provided at reception. No diving. Children must be supervised.",
  },
  {
    id: "am-2",
    category: "parking",
    name: "Private parking",
    hours: "24 hours",
    notes: "2 spots per apartment. Gate code 4521. Turn right after entrance.",
  },
  {
    id: "am-3",
    category: "bbq",
    name: "Outdoor BBQ area",
    hours: "10:00 – 23:00",
    notes: "Book with host 4 hours ahead. Charcoal provided.",
  },
  {
    id: "am-4",
    category: "garden",
    name: "Mediterranean garden",
    hours: "All day",
    notes: "Please do not pick the herbs — our neighbour Maria uses them for cooking!",
  },
  {
    id: "am-5",
    category: "laundry",
    name: "Laundry room",
    hours: "07:00 – 21:00",
    notes: "Washer and dryer. Detergent in the cupboard, free to use.",
  },
  {
    id: "am-6",
    category: "spa",
    name: "Outdoor jacuzzi",
    hours: "09:00 – 21:00",
    notes: "Shower before use. Maximum 4 people.",
  },
];

const SAMPLE_RULES = [
  { id: "r-1", category: "noise", text: "Quiet hours from 23:00 to 08:00 — please respect neighbours" },
  { id: "r-2", category: "smoking", text: "No smoking inside the apartment (outdoor areas are fine)" },
  { id: "r-3", category: "pets", text: "No pets, please" },
  { id: "r-4", category: "visitors", text: "Additional visitors must be approved by the host" },
  { id: "r-5", category: "pool", text: "No diving in the pool — depth is 1.40m" },
];

const SAMPLE_CONTACTS = [
  { category: "emergency", name: "Emergency (general)", phone: "112", notes: "Works for police, fire, and ambulance" },
  { category: "medical", name: "Ambulance", phone: "166", notes: "Direct line for medical emergencies" },
  { category: "emergency", name: "Police", phone: "100", notes: null },
  { category: "medical", name: "Dr. Maria Petraki", phone: "+30 28410 12345", notes: "English-speaking GP, 10 min drive" },
  { category: "pharmacy", name: "Sitia Central Pharmacy", phone: "+30 28430 22122", notes: "Open 08:00 – 22:00, Sundays until 14:00" },
  { category: "transport", name: "Petros Taxi", phone: "+30 6972 123456", notes: "Local driver, speaks English, always reliable" },
  { category: "transport", name: "Airport shuttle", phone: "+30 6944 987654", notes: "Book 24h ahead. Heraklion airport transfer: €85" },
  { category: "food", name: "Taverna Giorgos", phone: "+30 28430 28877", notes: "Best local food. Order for delivery after 19:00" },
  { category: "services", name: "Yannis Plumber", phone: "+30 6974 555123", notes: "Only for emergencies outside office hours" },
];

const SAMPLE_LOCAL_TIPS = `Καλώς ήρθατε! I'm Nikos and I've lived in Sitia my whole life. Here's what I want you to experience:

🏖️ BEACHES
- Vai Beach (40 min drive) — the famous palm forest, go early morning to avoid crowds
- Kouremenos — windsurfer paradise but also beautiful for swimming
- Xerokampos — remote turquoise coves, bring a picnic

🍴 WHERE TO EAT
- Taverna Oasis in Palekastro — the best grilled octopus on the island, ask for Manolis
- Balcony Restaurant in Sitia — book a sunset table, ask for the lamb kleftiko
- Bakery Mavrakakis — come for breakfast, try the bougatsa with honey

🏛️ HIDDEN GEMS
- Toplou Monastery — stunning 15th century, they make amazing olive oil
- Richtis Waterfall — 1h hike through a ravine, bring swimwear
- Kato Zakros archaeological site — Minoan ruins right by the sea

🚗 DRIVING TIPS
- Gas station closes at 22:00 in Sitia, fill up early
- The mountain road to Lasithi Plateau is stunning but slow — allow 2 hours
- Free parking behind the port

Need anything? Message me on WhatsApp — I reply fast!`;

export async function GET() {
  try {
    const reservation = await prisma.reservation.findFirst({
      include: { property: { include: { location: true } } },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "No reservation found. Create one first in /admin/reservations/new" },
        { status: 404 }
      );
    }

    const property = reservation.property;

    // Create or reuse location
    const locationData = {
      amenities: JSON.stringify(SAMPLE_AMENITIES),
      rules: JSON.stringify(SAMPLE_RULES),
      gateCode: "4521#",
      parkingInfo: "2 reserved spots. Gate code 4521#. First right after entrance.",
      buildingAccess:
        "Main entrance on the left side of the building. Use code 7812 on the keypad. If you arrive late, the night bell is the middle button.",
      quietHoursStart: "23:00",
      quietHoursEnd: "08:00",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      localTips: SAMPLE_LOCAL_TIPS,
      emergencyPhone: "+30 6972 111222",
    };

    let locationId = property.locationId;
    if (!locationId) {
      const location = await prisma.location.create({
        data: {
          name: "Nikos Estate",
          slug: `nikos-estate-${Date.now().toString(36)}`,
          address: "Odos Kazantzaki 42",
          city: "Sitia",
          country: "Greece",
          ...locationData,
          hostId: property.hostId,
        },
      });
      locationId = location.id;

      await prisma.property.update({
        where: { id: property.id },
        data: { locationId },
      });
    } else {
      await prisma.location.update({
        where: { id: locationId },
        data: locationData,
      });
    }

    await prisma.contact.deleteMany({ where: { locationId } });
    await prisma.contact.createMany({
      data: SAMPLE_CONTACTS.map((c, i) => ({
        ...c,
        locationId,
        displayOrder: i,
      })),
    });

    // Enrich property (apartment-specific info only)
    await prisma.property.update({
      where: { id: property.id },
      data: {
        wifiName: property.wifiName ?? "NikosEstate_3",
        wifiPassword: property.wifiPassword ?? "SunnyCrete2026",
        description:
          property.description ??
          "A bright two-bedroom apartment on the third floor with a private balcony overlooking the sea. Fully renovated in 2024 with a new kitchen, king-size bed, and everything you need for a relaxing stay.",
        houseRules:
          property.houseRules ??
          "Please no smoking inside. Shoes off when entering (slippers by the door). The washing machine is in the bathroom — manual is on the fridge. Please take the bins out before you leave (Mondays, Wednesdays, Fridays). Thank you!",
        squareMeters: 85,
        bedrooms: 2,
        bathrooms: 1,
        beds: 3,
        maxGuests: 4,
      },
    });

    // Enrich host
    await prisma.user.update({
      where: { id: property.hostId },
      data: {
        displayName: "Nikos",
        phone: "+30 6972 111222",
        bio: "Born and raised in Sitia. I love helping guests discover the real Crete.",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stay data enriched",
      stayUrl: `/en/stay/${reservation.guestToken}`,
      token: reservation.guestToken,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed" },
      { status: 500 }
    );
  }
}
