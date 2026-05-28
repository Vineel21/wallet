import { WalletApp } from "@/components/wallet-app";

type PageProps = {
  params: Promise<{
    route?: string[];
  }>;
};

export default async function Page({ params }: PageProps) {
  const { route = [] } = await params;
  return <WalletApp initialRoute={route} />;
}
