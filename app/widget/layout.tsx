import { PublicProviders } from "@/components/public-providers";

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicProviders>{children}</PublicProviders>;
}
