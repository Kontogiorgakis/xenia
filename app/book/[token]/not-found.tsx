import Link from "next/link";

export default function BookingNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          xenia
        </p>
        <h1 className="text-2xl font-bold">This booking page is not available</h1>
        <p className="text-sm text-muted-foreground">
          The link may have expired or the host has disabled direct bookings.
          Contact the host directly for availability and pricing.
        </p>
        <Link
          href="/"
          className="inline-block text-sm font-medium underline"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
