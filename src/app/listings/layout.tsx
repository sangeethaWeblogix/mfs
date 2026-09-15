import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Motorhomes for Sale in Victoria | MotorhomesForSale.com.au",
  description: "Browse new and used motorhomes for sale in Victoria from dealers and private sellers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
