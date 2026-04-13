import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AiChat } from "@/components/stay/AiChat";
import { AmenitiesGrid } from "@/components/stay/AmenitiesGrid";
import { ContactsList } from "@/components/stay/ContactsList";
import { HeroHeader } from "@/components/stay/HeroHeader";
import { HouseGuide } from "@/components/stay/HouseGuide";
import { LocalTips } from "@/components/stay/LocalTips";
import { MessageHostButton } from "@/components/stay/MessageHostButton";
import { NavigationPills } from "@/components/stay/NavigationPills";
import { QuickInfoStrip } from "@/components/stay/QuickInfoStrip";
import { StayFooter } from "@/components/stay/StayFooter";
import { WifiCard } from "@/components/stay/WifiCard";
import { loadStayByToken } from "@/lib/stay/loader";

interface StayPageProps {
  params: Promise<{ locale: string; token: string }>;
}

export async function generateMetadata({
  params,
}: StayPageProps): Promise<Metadata> {
  const { token } = await params;
  const stay = await loadStayByToken(token);
  if (!stay) return { title: "Xenia" };

  const { reservation } = stay;
  return {
    title: `Your stay at ${reservation.property.name}`,
    description: `Your personal guide for your stay at ${reservation.property.name}`,
    robots: "noindex",
  };
}

const StayPage = async ({ params }: StayPageProps) => {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const stay = await loadStayByToken(token);
  if (!stay) notFound();

  const { reservation, amenities } = stay;
  const { property } = reservation;
  const { location, host } = property;
  const contacts = location?.contacts ?? [];
  const hostName = host.displayName ?? host.name ?? null;

  return (
    <div className="min-h-svh bg-xenia-surface">
      <div className="mx-auto max-w-md bg-background shadow-[0_0_64px_rgba(10,46,79,0.06)]">
        <HeroHeader
          propertyName={property.name}
          city={location?.city ?? property.city ?? null}
          guestName={reservation.guestName}
          checkIn={reservation.checkIn}
          checkOut={reservation.checkOut}
          numberOfGuests={reservation.numberOfGuests}
        />

        <QuickInfoStrip
          checkInTime={location?.checkInTime ?? property.checkInTime ?? "15:00"}
          checkOutTime={location?.checkOutTime ?? property.checkOutTime ?? "11:00"}
          checkIn={reservation.checkIn}
          checkOut={reservation.checkOut}
        />

        <WifiCard name={property.wifiName} password={property.wifiPassword} />

        <NavigationPills
          hasAmenities={amenities.length > 0}
          hasTips={!!property.localTips?.trim()}
          hasContacts={contacts.length > 0}
        />

        <HouseGuide
          address={location?.address ?? property.address}
          checkInTime={location?.checkInTime ?? property.checkInTime}
          checkOutTime={location?.checkOutTime ?? property.checkOutTime}
          houseRules={property.houseRules}
          description={property.description}
          gateCode={location?.gateCode ?? null}
          parkingInfo={location?.parkingInfo ?? null}
          buildingAccess={location?.buildingAccess ?? null}
          quietHoursStart={location?.quietHoursStart ?? null}
          quietHoursEnd={location?.quietHoursEnd ?? null}
        />

        {amenities.length > 0 && <AmenitiesGrid amenities={amenities} />}

        {(location?.localTips?.trim() || property.localTips?.trim()) && (
          <LocalTips
            tips={(location?.localTips || property.localTips) ?? ""}
            hostName={hostName}
            hostImage={host.avatarUrl ?? host.image ?? null}
          />
        )}

        {contacts.length > 0 && <ContactsList contacts={contacts} />}

        <AiChat token={token} />

        <StayFooter />
      </div>

      <MessageHostButton
        hostName={hostName}
        hostPhone={host.phone ?? location?.emergencyPhone ?? property.emergencyPhone}
        propertyName={property.name}
        guestName={reservation.guestName}
        checkIn={reservation.checkIn}
        checkOut={reservation.checkOut}
      />
    </div>
  );
};

export default StayPage;
