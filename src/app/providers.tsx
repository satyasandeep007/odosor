"use client";

import React, { ReactNode } from "react";
import { config, projectId, metadata } from "@/lib/wagmiConfig";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { SessionProvider } from "next-auth/react";
import { GlobalProvider } from "@/app/GlobalContext";
const queryClient = new QueryClient();

if (!projectId) throw new Error("Project ID is not defined");

createWeb3Modal({
  metadata,
  allWallets: "HIDE",
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableSwaps: true,
  enableOnramp: true,
  themeMode: "light",
  themeVariables: {
    "--w3m-font-family": "Manrope",
    "--w3m-accent": "#222",
    "--w3m-border-radius-master": "1px",
  },
});

export default function AppKitProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <GlobalProvider>{children}</GlobalProvider>
        </SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
