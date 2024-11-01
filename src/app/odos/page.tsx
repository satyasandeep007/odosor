"use client";

import { useState, useEffect } from "react";
import { OdosService } from "@/lib/services/odos";

const odosService = new OdosService();

export default function OdosPage() {
  const [chains, setChains] = useState<any[]>([]);
  const [selectedChain, setSelectedChain] = useState<number>(1);
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedInputToken, setSelectedInputToken] = useState<string>("");
  const [selectedOutputToken, setSelectedOutputToken] = useState<string>("");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Add this

  useEffect(() => {
    loadChains();
  }, []);

  useEffect(() => {
    if (selectedChain) {
      loadTokens();
    }
  }, [selectedChain]);

  const loadChains = async () => {
    setIsInitialLoading(true);
    try {
      const chainsData = await odosService.getChains();
      console.log(chainsData, "chainsData");
      setChains(Array.isArray(chainsData) ? chainsData : []);
    } catch (err) {
      setError("Failed to load chains");
      setChains([]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadTokens = async () => {
    setIsInitialLoading(true);
    try {
      const tokensData = await odosService.getChainTokens(selectedChain);
      console.log(tokensData, "tokensData");
      setTokens(Array.isArray(tokensData) ? tokensData : []);
    } catch (err) {
      setError("Failed to load tokens");
      setTokens([]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleGetQuote = async () => {
    if (!selectedInputToken || !selectedOutputToken || !inputAmount) return;

    setIsLoading(true);
    setError(null);

    try {
      const quoteData = await odosService.getQuote({
        chainId: selectedChain,
        compact: true,
        gasPrice: 20,
        inputTokens: [
          {
            amount: inputAmount,
            tokenAddress: selectedInputToken,
          },
        ],
        outputTokens: [
          {
            proportion: 1,
            tokenAddress: selectedOutputToken,
          },
        ],
        referralCode: 0,
        slippageLimitPercent: 0.3,
        sourceBlacklist: [],
        sourceWhitelist: [],
        userAddr: "0x", // Add user address here
      });
      setQuote(quoteData);
    } catch (err) {
      setError("Failed to get quote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Odos Swap Interface
          </h1>
          <p className="mt-2 text-gray-600">
            Swap tokens across multiple chains
          </p>
        </div>

        {/* Loading State */}
        {isInitialLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Main Card - Only show when not in initial loading state */}
        {!isInitialLoading && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Chain Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Chain
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={selectedChain}
                onChange={(e) => setSelectedChain(Number(e.target.value))}
              >
                <option value="">Select a chain</option>
                {chains.map((chain) => (
                  <option key={chain} value={chain}>
                    {chain}
                  </option>
                ))}
              </select>
            </div>

            {/* Token Selection Fields */}
            <div className="space-y-4">
              {/* Input Token */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  You Pay
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="0.0"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                  />
                  <select
                    className="w-1/3 p-2 border border-gray-300 rounded-md"
                    value={selectedInputToken}
                    onChange={(e) => setSelectedInputToken(e.target.value)}
                  >
                    <option value="">Select token</option>
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ... rest of the component remains the same ... */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
