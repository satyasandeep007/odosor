"use client";

import { wagmiAdapter, projectId } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import {
  mainnet,
  arbitrum,
  avalanche,
  base,
  optimism,
  polygon,
} from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider } from "wagmi";

import { SessionProvider } from "next-auth/react";
import { GlobalProvider } from "@/app/GlobalContext";
// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "ODOSOR",
  description: "ODOSOR",
  url: "https://odosor.vercel.app",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, avalanche, base, optimism, polygon],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    email: false, // default to true
    socials: ["google"],
    emailShowWallets: false, // default to true
  },
  allWallets: "HIDE",
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as any,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as any}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <GlobalProvider>{children}</GlobalProvider>
        </SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
