export interface PriceInput {
  nightlyRate: number | null;
  cleaningFee: number | null;
  cityTax: number | null;
  securityDeposit: number | null;
  nights: number;
  guests: number;
}

export interface PriceBreakdown {
  nightlyRate: number | null;
  nights: number;
  nightsCost: number;
  cleaning: number;
  cityTaxTotal: number;
  deposit: number;
  total: number;
  hasRate: boolean;
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const rate = input.nightlyRate ?? 0;
  const nights = Math.max(0, input.nights);
  const nightsCost = rate * nights;
  const cleaning = input.cleaningFee ?? 0;
  const cityTaxPerPersonNight = input.cityTax ?? 0;
  const cityTaxTotal = cityTaxPerPersonNight * Math.max(1, input.guests) * nights;
  const deposit = input.securityDeposit ?? 0;
  const total = nightsCost + cleaning + cityTaxTotal;
  return {
    nightlyRate: input.nightlyRate ?? null,
    nights,
    nightsCost,
    cleaning,
    cityTaxTotal,
    deposit,
    total,
    hasRate: input.nightlyRate != null && input.nightlyRate > 0,
  };
}

export function nightCount(checkIn: Date | string, checkOut: Date | string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}
