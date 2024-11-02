"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";

// Define the shape of the context
interface GlobalContextType {
  isLoading: boolean;
  sendTransaction: (transaction: any) => Promise<void>;
}
// Define the initial state for the context
const initialState: GlobalContextType = {
  isLoading: false, // Initial loading state
  sendTransaction: () => Promise.resolve(),
};

// Create the context with the initial state
const GlobalContext = createContext<GlobalContextType>(initialState);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { address }: any = useAccount();

  const { sendTransaction: wagmiSendTransaction } = useSendTransaction();

  const handleSendTransaction = async (transaction: any) => {
    try {
      await wagmiSendTransaction(transaction);
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const value: GlobalContextType = {
    isLoading,
    sendTransaction: handleSendTransaction,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

// Create a custom hook to use the context
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
