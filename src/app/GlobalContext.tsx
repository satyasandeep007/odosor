"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";

// Define the shape of the context
interface GlobalContextType {
  isLoading: boolean;
}
// Define the initial state for the context
const initialState: GlobalContextType = {
  isLoading: false,
};

// Create the context with the initial state
const GlobalContext = createContext<GlobalContextType>(initialState);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // const { address }: any = useAccount();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const value: GlobalContextType = {
    isLoading,
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
