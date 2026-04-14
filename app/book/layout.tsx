import { PublicProviders } from "@/components/public-providers";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicProviders>{children}</PublicProviders>;
}
