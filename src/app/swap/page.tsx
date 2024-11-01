"use client";

import React, { useEffect, useState } from "react";
import { OdosService } from "@/lib/services/odos";
import { TokenInfo } from "@/lib/types";
import CryptoSelect from "@/components/CryptoSelect";

const odosService = new OdosService();

const getTokenLogo = (symbol: string, address: string) => {
  const sources = [
    // Try cryptocurrency-icons first
    `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`,
    // Fallback to TrustWallet assets
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`,
    // Default fallback image
    "/default-token-logo.png",
  ];

  // Function to check if image exists
  const checkImage = (url: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  // Return the first working image URL
  return Promise.any(sources.map(checkImage)).then(
    (url) => url || sources[sources.length - 1]
  );
};

const Swap = () => {
  const [inputAmount, setInputAmount] = useState<string>("1");
  const [outputAmount, setOutputAmount] = useState<string>("2503.23");
  const [selectedInputToken, setSelectedInputToken] = useState<TokenInfo>({
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // ETH
    symbol: "UNI",
    logo: "/uni-logo.png",
    decimals: 18,
  });
  const [selectedOutputToken, setSelectedOutputToken] = useState<TokenInfo>({
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    symbol: "USDT",
    logo: "/usdt-logo.png",
    decimals: 6,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<string>("0");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [selectedChain, setSelectedChain] = useState<number>(1); // Ethereum mainnet
  const [tokens, setTokens] = useState<any[]>([]);

  const handleInputChange = async (value: string) => {
    setInputAmount(value);
    if (value && !isNaN(Number(value))) {
      await handleGetQuote(value);
    }
  };

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const tokensData = await odosService.getChainTokens(selectedChain);
      console.log(tokensData, "tokensData");
      setTokens(Array.isArray(tokensData) ? tokensData : []);
    } catch (err) {
      setError("Failed to load tokens");
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get quote from Odos
  const handleGetQuote = async (amount?: string) => {
    if (!selectedInputToken || !selectedOutputToken) return;

    setIsLoading(true);
    setError(null);
    const amountToUse = amount || inputAmount;
    const amountInDecimals = (
      Number(amountToUse) * Math.pow(10, selectedInputToken.decimals)
    ).toString();

    try {
      const payload = {
        chainId: selectedChain,
        compact: true,
        gasPrice: 20,
        inputTokens: [
          {
            amount: amountInDecimals,
            tokenAddress: selectedInputToken.address,
          },
        ],
        outputTokens: [
          {
            proportion: 1,
            tokenAddress: selectedOutputToken.address,
          },
        ],
        referralCode: 0,
        slippageLimitPercent: 0.3,
        sourceBlacklist: [],
        sourceWhitelist: [],
        userAddr: "0x5B4d77e199FE8e5090009C72d2a5581C74FEbE89", // Add user address here
      };
      console.log(payload, "payload");
      const quoteData: any = await odosService.getQuote(payload);
      setQuote(quoteData);

      // Calculate and format the output amount
      const rawAmount = quoteData?.outAmounts[0] || "0";
      const formattedAmount = (
        Number(rawAmount) / Math.pow(10, selectedOutputToken.decimals)
      ).toString();

      const exchangeRate = calculateDynamicExchangeRate(
        quoteData.inAmounts[0],
        quoteData.outAmounts[0],
        quoteData.inValues[0],
        quoteData.outValues[0],
        selectedInputToken.decimals,
        selectedOutputToken.decimals
      );
      setExchangeRate(exchangeRate);
      setOutputAmount(formattedAmount);
    } catch (err) {
      setError("Failed to get quote");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle max button click
  const handleMaxClick = () => {
    setInputAmount(userBalance);
    handleGetQuote(userBalance);
  };

  // Handle swap tokens
  const handleSwapTokens = () => {
    const tempToken = selectedInputToken;
    setSelectedInputToken(selectedOutputToken);
    setSelectedOutputToken(tempToken);
    handleGetQuote();
  };

  useEffect(() => {
    if (selectedChain) {
      loadTokens();
    }
  }, [selectedChain]);

  useEffect(() => {
    if (!selectedInputToken || !selectedOutputToken) return;

    handleGetQuote();
  }, [inputAmount, selectedInputToken, selectedOutputToken]);

  function calculateDynamicExchangeRate(
    inAmount: string,
    outAmount: string,
    inValueUSD: string,
    outValueUSD: string,
    inDecimals: number,
    outDecimals: number
  ) {
    // Convert inAmount and outAmount based on their respective decimals
    const inAmountNormalized = Number(inAmount) / 10 ** inDecimals;
    const outAmountNormalized = Number(outAmount) / 10 ** outDecimals;

    // Calculate exchange rate as USDT per 1 UNI (outAmount per 1 inAmount)
    const exchangeRate = outAmountNormalized / inAmountNormalized;

    // Log details for verification
    console.log(`Calculated Exchange Rate (USDT per 1 UNI): ${exchangeRate}`);
    console.log(`Input Value in USD: ${inValueUSD}`);
    console.log(`Output Value in USD: ${outValueUSD}`);

    return exchangeRate;
  }

  return (
    <div className="w-full min-h-screen h-full relative bg-[#fafafa] flex items-center justify-center">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-full max-w-2xl">
        {/* Navigation tabs */}
        <div className="flex gap-6 mb-8">
          <button className="bg-gray-100 px-4 py-2 rounded-full font-medium">
            Swap
          </button>

          <button className="ml-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* First input section */}
        <div className="bg-gray-50 p-4 rounded-2xl mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Sell</span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              value={inputAmount}
              onChange={(e) => handleInputChange(e.target.value)}
              className="bg-transparent text-4xl w-full outline-none text-[#FF6B6B]"
            />
            <CryptoSelect
              selectedToken={selectedInputToken}
              tokens={tokens}
              setSelectedToken={setSelectedInputToken}
            />
          </div>
          <div className="text-gray-500 mt-1">
            {/* ${quote?.outputTokens[0]?.usdValue || "0.00"} */}
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-500 flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {userBalance} {selectedInputToken.symbol}
            </span>
            <button
              className="text-gray-400"
              //  onClick={handleMaxClick}
            >
              Max
            </button>
          </div>
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            className="bg-white p-2 rounded-lg shadow-md"
            onClick={handleSwapTokens}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>

        {/* Second input section */}
        <div className="bg-gray-50 p-4 rounded-2xl">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Buy</span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="text"
              value={outputAmount}
              readOnly
              className="bg-transparent text-4xl w-full outline-none"
            />
            <CryptoSelect
              selectedToken={selectedOutputToken}
              tokens={tokens}
              setSelectedToken={setSelectedOutputToken}
            />
          </div>
          <div className="text-gray-500 mt-1">
            0 {selectedOutputToken.symbol}
          </div>
        </div>

        {/* Error message */}
        {error && <div className="text-center text-red-500 mt-4">{error}</div>}

        {/* Exchange rate and additional info */}
        {quote && (
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Exchange Rate</span>
              <span>
                1 {selectedInputToken.symbol} = {exchangeRate.toFixed(3)}{" "}
                {selectedOutputToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Output Value</span>
              <span>
                $
                {quote?.outValues
                  ? Math.abs(quote.outValues[0]).toFixed(3)
                  : "0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Gas Fee</span>
              <span>${quote.gasEstimateValue?.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Swap;
