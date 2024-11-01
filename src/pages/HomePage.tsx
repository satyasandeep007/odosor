"use client";

import { useAccount } from "wagmi";

import Header from "@/layout/HomeHeader";

const HomePage: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <main className="h-screen bg-[#f0f0f0]">
      <Header isConnected={isConnected} />
    </main>
  );
};

export default HomePage;
