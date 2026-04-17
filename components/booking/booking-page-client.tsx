"use client";

import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  ExternalLink,
  Loader2,
  MapPin,
  Moon,
  Ruler,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { calculatePrice, nightCount } from "@/lib/booking/calculate-price";
import type { BookingPageData } from "@/lib/booking/get-booking-page-data";
import { getInitials, parseJsonArray } from "@/lib/general/utils";
import { cn } from "@/lib/utils";
import type { XeniaAmenity } from "@/types/xenia";

interface BlockedRange {
  start: Date | string;
  end: Date | string;
  reason: "reservation" | "manual";
}

interface UnitLite {
  id: string;
  name: string;
  coverPhoto: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareMeters: number | null;
  maxGuests: number | null;
  nightlyRate: number | null;
  description: string | null;
}

interface BookingPageClientProps {
  data: BookingPageData;
  blockedDates: BlockedRange[];
  token: string;
  isCompact?: boolean;
  isWidget?: boolean;
}

type Step = "dates" | "details";
type View = "landing" | "book";

const STRINGS = {
  en: {
    from: "From",
    perNight: "night",
    selectDatesHint: "Add your dates to see the total",
    hostedBy: "Hosted by",
    checkIn: "Check-in",
    checkOut: "Check-out",
    guests: "Guests",
    nights: "nights",
    night: "night",
    priceBreakdown: "Price details",
    cleaningFee: "Cleaning fee",
    cityTax: "City tax",
    total: "Total",
    deposit: "Refundable deposit",
    depositNote: "Returned after checkout",
    yourDetails: "Your details",
    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    phone: "Phone number",
    nationality: "Nationality",
    specialRequests: "Message to host",
    specialRequestsPlaceholder:
      "Anything we should know? e.g. anniversary, dietary needs, arrival time…",
    agreeRules: "I have read and agree to the house rules",
    confirmBooking: "Confirm booking",
    back: "Back",
    continueToDetails: "Continue",
    bookingConfirmed: "Booking confirmed",
    thankYou: "Thank you",
    openGuestPage: "Open your guest page",
    notAvailable: "These dates aren't available",
    contactForPricing: "Contact the host for pricing",
    chooseApartment: "Choose your apartment",
    paymentNote: "You'll receive payment instructions by email.",
    unitsAvailable: "units available for these dates",
    checking: "Checking availability…",
    confirmedMessage:
      "Your stay is locked in. A confirmation email is on its way.",
    bookAnother: "Book another stay",
    aboutHost: "Meet your host",
    checkAvailabilityCta: "Check availability & book",
    bookingTitle: "Check availability",
  },
  el: {
    from: "Από",
    perNight: "βράδυ",
    selectDatesHint: "Επιλέξτε ημερομηνίες για το σύνολο",
    hostedBy: "Οικοδεσπότης",
    checkIn: "Άφιξη",
    checkOut: "Αναχώρηση",
    guests: "Επισκέπτες",
    nights: "βράδια",
    night: "βράδυ",
    priceBreakdown: "Ανάλυση τιμής",
    cleaningFee: "Χρέωση καθαρισμού",
    cityTax: "Δημοτικός φόρος",
    total: "Σύνολο",
    deposit: "Επιστρεπτέα εγγύηση",
    depositNote: "Επιστρέφεται μετά την αναχώρηση",
    yourDetails: "Τα στοιχεία σας",
    firstName: "Όνομα",
    lastName: "Επώνυμο",
    email: "Email",
    phone: "Τηλέφωνο",
    nationality: "Εθνικότητα",
    specialRequests: "Μήνυμα στον οικοδεσπότη",
    specialRequestsPlaceholder:
      "Θέλετε να μας πείτε κάτι; π.χ. επέτειος, διατροφικές ανάγκες, ώρα άφιξης…",
    agreeRules: "Διάβασα και συμφωνώ με τους κανόνες",
    confirmBooking: "Επιβεβαίωση κράτησης",
    back: "Πίσω",
    continueToDetails: "Συνέχεια",
    bookingConfirmed: "Η κράτηση επιβεβαιώθηκε",
    thankYou: "Ευχαριστούμε",
    openGuestPage: "Άνοιγμα σελίδας επισκέπτη",
    notAvailable: "Αυτές οι ημερομηνίες δεν είναι διαθέσιμες",
    contactForPricing: "Επικοινωνήστε για τιμολόγηση",
    chooseApartment: "Επιλέξτε διαμέρισμα",
    paymentNote: "Θα λάβετε οδηγίες πληρωμής μέσω email.",
    unitsAvailable: "διαθέσιμα διαμερίσματα",
    checking: "Έλεγχος διαθεσιμότητας…",
    confirmedMessage: "Η διαμονή σας είναι κλεισμένη. Θα λάβετε email επιβεβαίωσης.",
    bookAnother: "Νέα κράτηση",
    aboutHost: "Γνωρίστε τον οικοδεσπότη",
    checkAvailabilityCta: "Έλεγχος διαθεσιμότητας & κράτηση",
    bookingTitle: "Έλεγχος διαθεσιμότητας",
  },
};

type Lang = keyof typeof STRINGS;

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const code = navigator.language.slice(0, 2).toLowerCase();
  return code === "el" ? "el" : "en";
}

export function BookingPageClient({
  data,
  blockedDates,
  token,
  isCompact = false,
  isWidget = false,
}: BookingPageClientProps) {
  // Always render "en" on the server + first client render to avoid hydration
  // mismatch, then detect the user's language in an effect.
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const detected = detectLang();
    if (detected !== "en") setLang(detected);
  }, []);
  const t = STRINGS[lang];

  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [availableUnits, setAvailableUnits] = useState<UnitLite[] | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreeRules, setAgreeRules] = useState(false);

  const [step, setStep] = useState<Step>("dates");
  const [view, setView] = useState<View>("landing");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    guestToken?: string;
  } | null>(null);
  const brandColor = data.brandColor ?? "#1B4D6E";
  const amenities = useMemo(
    () => parseJsonArray<XeniaAmenity>(data.amenities),
    [data.amenities]
  );

  const disabledMatcher = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const advance = data.advanceNotice ?? 0;
    const minDate = new Date(now);
    minDate.setDate(minDate.getDate() + advance);
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + (data.bookingWindow ?? 365));

    const ranges = blockedDates.map((b) => ({
      from: new Date(b.start),
      to: new Date(b.end),
    }));

    return [{ before: minDate }, { after: maxDate }, ...ranges];
  }, [blockedDates, data.advanceNotice, data.bookingWindow]);

  const nights = range?.from && range?.to ? nightCount(range.from, range.to) : 0;

  const effectiveRate = (() => {
    if (selectedUnitId) {
      const u = data.properties.find((p) => p.id === selectedUnitId);
      if (u?.nightlyRate != null) return u.nightlyRate;
    }
    return data.baseNightlyRate;
  })();

  const price = useMemo(
    () =>
      calculatePrice({
        nightlyRate: effectiveRate,
        cleaningFee: data.cleaningFee,
        cityTax: data.cityTax,
        securityDeposit: data.securityDeposit,
        nights,
        guests,
      }),
    [effectiveRate, data.cleaningFee, data.cityTax, data.securityDeposit, nights, guests]
  );

  const availabilityAbortRef = useRef<AbortController | null>(null);
  const lastCheckedRangeRef = useRef<string | null>(null);

  const handleRangeChange = async (r: DateRange | undefined) => {
    setRange(r);
    setSelectedUnitId(null);
    setSubmitError(null);

    if (!r?.from || !r?.to) {
      setAvailableUnits(null);
      return;
    }

    // Skip if the new range is identical to the last one we already checked.
    const key = `${r.from.toISOString()}|${r.to.toISOString()}`;
    if (lastCheckedRangeRef.current === key) return;
    lastCheckedRangeRef.current = key;

    // Cancel any in-flight request so a stale response can't overwrite newer state.
    availabilityAbortRef.current?.abort();
    const controller = new AbortController();
    availabilityAbortRef.current = controller;

    setAvailableUnits(null);
    setCheckingAvailability(true);
    try {
      const res = await fetch(`/api/book/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_availability",
          checkIn: r.from.toISOString(),
          checkOut: r.to.toISOString(),
        }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      const json = await res.json();
      if (res.ok) {
        setAvailableUnits(json.units ?? []);
        if (data.unitSelectionMode === "auto_assign" && json.units?.[0]) {
          setSelectedUnitId(json.units[0].id);
        }
      } else {
        setSubmitError(json.error ?? "Failed");
        setAvailableUnits([]);
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      setSubmitError("Network error");
    } finally {
      if (!controller.signal.aborted) setCheckingAvailability(false);
    }
  };

  const canProceedToDetails =
    nights > 0 &&
    availableUnits !== null &&
    availableUnits.length > 0 &&
    (data.unitSelectionMode !== "guest_chooses" || selectedUnitId !== null);

  const canSubmit =
    canProceedToDetails &&
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    agreeRules;

  const handleSubmit = async () => {
    if (!canSubmit || !range?.from || !range?.to) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        action: "instant_book",
        checkIn: range.from.toISOString(),
        checkOut: range.to.toISOString(),
        guestName: `${firstName.trim()} ${lastName.trim()}`,
        guestEmail: email.trim(),
        guestPhone: phone.trim() || undefined,
        guestNationality: nationality.trim() || undefined,
        numberOfGuests: guests,
        specialRequests: specialRequests.trim() || undefined,
        unitId: selectedUnitId ?? undefined,
      };

      const res = await fetch(`/api/book/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error ?? "Failed");
        return;
      }

      setConfirmation({
        guestToken: json.guestToken,
      });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  // ══════════════════ Confirmation ══════════════════
  if (confirmation) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
        <div className="mx-auto max-w-xl px-4 py-16 sm:py-24">
          <div className="rounded-3xl border border-border/40 bg-card p-8 text-center shadow-xl sm:p-12">
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: brandColor }}
            >
              <Check className="size-8" strokeWidth={3} />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              {t.bookingConfirmed}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {t.thankYou}, <span className="font-medium text-foreground">{firstName}</span>.
              {` ${t.confirmedMessage}`}
            </p>

            {range?.from && range?.to && (
              <div className="mx-auto mt-8 flex max-w-sm items-center justify-between rounded-2xl bg-muted/40 px-5 py-4 text-left">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.checkIn}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {range.from.toLocaleDateString(lang, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-center text-[10px] font-semibold text-muted-foreground">
                  {nights} {nights === 1 ? t.night : t.nights}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t.checkOut}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {range.to.toLocaleDateString(lang, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {confirmation.guestToken && (
              <div className="mt-8 space-y-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full cursor-pointer text-base"
                  style={{ backgroundColor: brandColor }}
                >
                  <a
                    href={`/stay/${confirmation.guestToken}`}
                    target={isWidget ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    {t.openGuestPage}
                    <ExternalLink className="ml-1 size-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">{t.paymentNote}</p>
              </div>
            )}

            {!isWidget && (
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirmation(null);
                  setStep("dates");
                  setRange(undefined);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPhone("");
                  setNationality("");
                  setSpecialRequests("");
                  setAgreeRules(false);
                }}
                className="mt-4 cursor-pointer text-xs"
              >
                {t.bookAnother}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════ Compact / widget layout ══════════════════
  if (isCompact) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="px-1">
          <h1 className="text-xl font-bold leading-tight">{data.name}</h1>
          {data.city && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {data.city}
              {data.country ? `, ${data.country}` : ""}
            </p>
          )}
        </div>
        <BookingCard
          data={data}
          t={t}
          lang={lang}
          brandColor={brandColor}
          range={range}
          onRangeChange={handleRangeChange}
          guests={guests}
          setGuests={setGuests}
          disabledMatcher={disabledMatcher}
          checkingAvailability={checkingAvailability}
          availableUnits={availableUnits}
          selectedUnitId={selectedUnitId}
          setSelectedUnitId={setSelectedUnitId}
          nights={nights}
          price={price}
          step={step}
          setStep={setStep}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          nationality={nationality}
          setNationality={setNationality}
          specialRequests={specialRequests}
          setSpecialRequests={setSpecialRequests}
          agreeRules={agreeRules}
          setAgreeRules={setAgreeRules}

          canProceedToDetails={canProceedToDetails}
          canSubmit={!!canSubmit}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  // ══════════════════ Full layout ══════════════════
  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              xenia
            </p>
            {data.hostDisplayName && (
              <p className="hidden text-xs text-muted-foreground sm:block">
                {t.hostedBy}{" "}
                <span className="font-medium text-foreground">
                  {data.hostDisplayName}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} onChange={setLang} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        {view === "landing" && (
          <div className="space-y-6">
            {/* Hero cover photo */}
            {data.coverPhoto && (
              <div className="relative overflow-hidden rounded-3xl shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.coverPhoto}
                  alt={data.name}
                  className="h-64 w-full object-cover sm:h-80"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/20 to-transparent p-5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-white/90">
                    <MapPin className="size-3.5" />
                    {[data.city, data.country].filter(Boolean).join(", ")}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {data.name}
                  </h1>
                </div>
              </div>
            )}

            {!data.coverPhoto && (
              <div>
                <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {data.name}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {[data.city, data.country].filter(Boolean).join(", ")}
                </p>
              </div>
            )}

            {/* Price tag */}
            {data.baseNightlyRate != null && (
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-sm text-muted-foreground">{t.from}</span>
                <span className="text-3xl font-bold tracking-tight">
                  €{data.baseNightlyRate}
                </span>
                <span className="text-sm text-muted-foreground">/ {t.night}</span>
              </div>
            )}

            {/* Description */}
            {data.description && (
              <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                {data.description}
              </p>
            )}

            {/* Host intro card */}
            {(data.hostDisplayName || data.hostBio) && (
              <div className="rounded-3xl border border-border/40 bg-card p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {data.hostPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.hostPhoto}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      getInitials(data.hostDisplayName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.hostedBy}
                    </p>
                    {data.hostDisplayName && (
                      <p className="mt-0.5 text-base font-semibold">
                        {data.hostDisplayName}
                      </p>
                    )}
                  </div>
                </div>
                {data.hostBio && (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {data.hostBio}
                  </p>
                )}
              </div>
            )}

            {/* Facilities pills */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs"
                  >
                    <Sparkles className="size-3 text-muted-foreground" />
                    {a.name}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="pt-2">
              <Button
                onClick={() => setView("book")}
                size="lg"
                className="w-full cursor-pointer rounded-2xl py-6 text-base font-semibold shadow-lg"
                style={{ backgroundColor: brandColor }}
              >
                <CalendarDays className="mr-2 size-5" />
                {t.checkAvailabilityCta}
              </Button>
            </div>
          </div>
        )}

        {view === "book" && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setView("landing")}
              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {data.name}
            </button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t.bookingTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.selectDatesHint}
              </p>
            </div>
            <BookingCard
              data={data}
              t={t}
              lang={lang}
              brandColor={brandColor}
              range={range}
              onRangeChange={handleRangeChange}
              guests={guests}
              setGuests={setGuests}
              disabledMatcher={disabledMatcher}
              checkingAvailability={checkingAvailability}
              availableUnits={availableUnits}
              selectedUnitId={selectedUnitId}
              setSelectedUnitId={setSelectedUnitId}
              nights={nights}
              price={price}
              step={step}
              setStep={setStep}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              nationality={nationality}
              setNationality={setNationality}
              specialRequests={specialRequests}
              setSpecialRequests={setSpecialRequests}
              agreeRules={agreeRules}
              setAgreeRules={setAgreeRules}
    
              canProceedToDetails={canProceedToDetails}
              canSubmit={!!canSubmit}
              submitting={submitting}
              submitError={submitError}
              onSubmit={handleSubmit}
            />
          </div>
        )}

      </main>
    </div>
  );
}

// ══════════════════ BookingCard ══════════════════
interface BookingCardProps {
  data: BookingPageData;
  t: (typeof STRINGS)[Lang];
  lang: Lang;
  brandColor: string;
  range: DateRange | undefined;
  onRangeChange: (r: DateRange | undefined) => void;
  guests: number;
  setGuests: (n: number) => void;
  disabledMatcher: unknown;
  checkingAvailability: boolean;
  availableUnits: UnitLite[] | null;
  selectedUnitId: string | null;
  setSelectedUnitId: (id: string | null) => void;
  nights: number;
  price: ReturnType<typeof calculatePrice>;
  step: Step;
  setStep: (s: Step) => void;
  firstName: string;
  setFirstName: (s: string) => void;
  lastName: string;
  setLastName: (s: string) => void;
  email: string;
  setEmail: (s: string) => void;
  phone: string;
  setPhone: (s: string) => void;
  nationality: string;
  setNationality: (s: string) => void;
  specialRequests: string;
  setSpecialRequests: (s: string) => void;
  agreeRules: boolean;
  setAgreeRules: (b: boolean) => void;
  canProceedToDetails: boolean;
  canSubmit: boolean;
  submitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
}

function BookingCard(props: BookingCardProps) {
  const {
    data,
    t,
    lang,
    brandColor,
    range,
    onRangeChange,
    guests,
    setGuests,
    disabledMatcher,
    checkingAvailability,
    availableUnits,
    selectedUnitId,
    setSelectedUnitId,
    nights,
    price,
    step,
    setStep,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    nationality,
    setNationality,
    specialRequests,
    setSpecialRequests,
    agreeRules,
    setAgreeRules,
    canProceedToDetails,
    canSubmit,
    submitting,
    submitError,
    onSubmit,
  } = props;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-2xl">
      {/* Price header */}
      <div className="border-b border-border/40 p-6">
        {data.baseNightlyRate != null ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">{t.from}</span>
            <span className="text-3xl font-bold tracking-tight">
              €{data.baseNightlyRate}
            </span>
            <span className="text-sm text-muted-foreground">/ {t.night}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.contactForPricing}</p>
        )}
        {nights === 0 && (
          <p className="mt-1 text-xs text-muted-foreground">{t.selectDatesHint}</p>
        )}
      </div>

      <div className="space-y-5 p-6">
        {/* Date range picker shell */}
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <div className="grid grid-cols-2">
            <button
              type="button"
              className="border-r border-border/60 p-3 text-left transition hover:bg-muted/40"
              onClick={() => {
                const el = document.getElementById("booking-calendar");
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.checkIn}
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                {range?.from
                  ? range.from.toLocaleDateString(lang, {
                      day: "numeric",
                      month: "short",
                    })
                  : "—"}
              </p>
            </button>
            <button
              type="button"
              className="p-3 text-left transition hover:bg-muted/40"
              onClick={() => {
                const el = document.getElementById("booking-calendar");
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.checkOut}
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                {range?.to
                  ? range.to.toLocaleDateString(lang, {
                      day: "numeric",
                      month: "short",
                    })
                  : "—"}
              </p>
            </button>
          </div>
          <div className="border-t border-border/60 p-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Users className="size-3" />
                {t.guests}
              </Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-border/60 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold">{guests}</span>
                <button
                  type="button"
                  onClick={() =>
                    setGuests(Math.min(data.maxGuests ?? 20, guests + 1))
                  }
                  disabled={guests >= (data.maxGuests ?? 20)}
                  className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-border/60 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="booking-calendar" className="flex justify-center rounded-2xl border border-border/60 p-2">
          <Calendar
            mode="range"
            selected={range}
            onSelect={onRangeChange}
            disabled={disabledMatcher as never}
            numberOfMonths={1}
            showOutsideDays={false}
          />
        </div>

        {checkingAvailability && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/40 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            {t.checking}
          </div>
        )}

        {availableUnits !== null &&
          availableUnits.length === 0 &&
          nights > 0 &&
          !checkingAvailability && (
            <div className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400">
              {t.notAvailable}
            </div>
          )}

        {data.unitSelectionMode === "guest_chooses" &&
          availableUnits !== null &&
          availableUnits.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.chooseApartment}
              </p>
              <div className="space-y-2">
                {availableUnits.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnitId(u.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition",
                      selectedUnitId === u.id
                        ? "border-2"
                        : "border-border/60 hover:bg-muted/30"
                    )}
                    style={
                      selectedUnitId === u.id
                        ? { borderColor: brandColor, backgroundColor: `${brandColor}08` }
                        : undefined
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{u.name}</p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                        {u.bedrooms != null && (
                          <span className="flex items-center gap-0.5">
                            <BedDouble className="size-3" />
                            {u.bedrooms}
                          </span>
                        )}
                        {u.bathrooms != null && (
                          <span className="flex items-center gap-0.5">
                            <Bath className="size-3" />
                            {u.bathrooms}
                          </span>
                        )}
                        {u.squareMeters != null && (
                          <span className="flex items-center gap-0.5">
                            <Ruler className="size-3" />
                            {u.squareMeters}m²
                          </span>
                        )}
                        {u.maxGuests != null && (
                          <span className="flex items-center gap-0.5">
                            <Users className="size-3" />
                            {u.maxGuests}
                          </span>
                        )}
                      </div>
                    </div>
                    {u.nightlyRate != null && (
                      <p className="shrink-0 text-sm font-semibold">€{u.nightlyRate}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

        {data.unitSelectionMode === "auto_assign" &&
          availableUnits !== null &&
          availableUnits.length > 0 &&
          nights > 0 && (
            <p className="text-center text-[11px] text-muted-foreground">
              {availableUnits.length} {t.unitsAvailable}
            </p>
          )}

        {/* Price breakdown */}
        {nights > 0 && price.hasRate && (
          <div className="space-y-2 rounded-2xl bg-muted/30 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.priceBreakdown}
            </p>
            <div className="flex justify-between text-sm">
              <span>
                €{price.nightlyRate} × {nights} {nights === 1 ? t.night : t.nights}
              </span>
              <span>€{price.nightsCost.toFixed(2)}</span>
            </div>
            {price.cleaning > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t.cleaningFee}</span>
                <span>€{price.cleaning.toFixed(2)}</span>
              </div>
            )}
            {price.cityTaxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t.cityTax}</span>
                <span>€{price.cityTaxTotal.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-bold">
              <span>{t.total}</span>
              <span>€{price.total.toFixed(2)}</span>
            </div>
            {price.deposit > 0 && (
              <p className="pt-1 text-[10px] text-muted-foreground">
                + €{price.deposit.toFixed(2)} {t.deposit} · {t.depositNote}
              </p>
            )}
          </div>
        )}

        {/* Action — step=dates */}
        {step === "dates" && (
          <Button
            onClick={() => setStep("details")}
            disabled={!canProceedToDetails}
            size="lg"
            className="w-full cursor-pointer text-base font-semibold"
            style={
              canProceedToDetails
                ? { backgroundColor: brandColor }
                : undefined
            }
          >
            {t.continueToDetails}
          </Button>
        )}

        {/* Step=details */}
        {step === "details" && (
          <div className="space-y-4 border-t border-border/40 pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.yourDetails}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t.firstName} *</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t.lastName} *</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.email} *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t.phone}</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t.nationality}</Label>
                <Input
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.specialRequests}</Label>
              <Textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder={t.specialRequestsPlaceholder}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border/60 bg-muted/20 p-3">
              <Checkbox
                checked={agreeRules}
                onCheckedChange={(v) => setAgreeRules(v === true)}
                className="mt-0.5"
              />
              <span className="text-xs leading-snug">{t.agreeRules}</span>
            </label>

            {submitError && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400">
                {submitError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("dates")}
                className="cursor-pointer"
              >
                {t.back}
              </Button>
              <Button
                onClick={onSubmit}
                disabled={!canSubmit || submitting}
                size="lg"
                className="flex-1 cursor-pointer text-base font-semibold"
                style={canSubmit ? { backgroundColor: brandColor } : undefined}
              >
                {submitting && <Loader2 className="mr-1 size-4 animate-spin" />}
                {t.confirmBooking}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════ LanguageToggle ══════════════════
function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border/60 p-0.5">
      {(["en", "el"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition",
            lang === code
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

// ══════════════════ ThemeToggle ══════════════════
function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Canonical next-themes hydration-safe pattern — render a placeholder on the
  // server, then mark as mounted once the client knows the resolved theme.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="size-8" />;
  }

  const current = theme === "system" ? resolvedTheme : theme;
  const toggle = () => setTheme(current === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:text-foreground"
    >
      {current === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
