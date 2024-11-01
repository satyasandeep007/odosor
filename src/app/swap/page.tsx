"use client";

import React, { useEffect, useState } from "react";
import { OdosService } from "@/lib/services/odos";
import { TokenInfo } from "@/lib/types";
import CryptoSelect from "@/components/CryptoSelect";
import { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLoader2,
  IconRefresh,
  IconSettings,
  IconArrowsUpDown,
} from "@tabler/icons-react";
import { sendTransaction } from "@/lib/blockchainUtils/sendTransaction";
import { getPrice } from "@/lib/services/quicknode";

const odosService = new OdosService();

const Swap = () => {
  const [inputAmount, setInputAmount] = useState<string>("1");
  const [outputAmount, setOutputAmount] = useState<string>("2503.23");
  const [selectedInputToken, setSelectedInputToken]: any =
    useState<TokenInfo>();
  const [selectedOutputToken, setSelectedOutputToken]: any =
    useState<TokenInfo>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<string>("0");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [selectedChain, setSelectedChain] = useState<number>(137); // Polygon mainnet
  const [tokens, setTokens] = useState<any[]>([]);
  const [refreshCounter, setRefreshCounter] = useState<number>(10);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [inputTokenPrice, setInputTokenPrice] = useState<number | null>(null);
  const [outputTokenPrice, setOutputTokenPrice] = useState<number | null>(null);

  // Add auto-refresh functionality
  const startAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    setRefreshCounter(10);
    refreshIntervalRef.current = setInterval(() => {
      setRefreshCounter((prev) => {
        if (prev <= 1) {
          handleGetQuote();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  //   useEffect(() => {
  //     if (isAutoRefreshing) {
  //       startAutoRefresh();
  //     }
  //     return () => {
  //       if (refreshIntervalRef.current) {
  //         clearInterval(refreshIntervalRef.current);
  //       }
  //     };
  //   }, [isAutoRefreshing, startAutoRefresh]);

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
      setSelectedInputToken(tokensData.find((token) => token.symbol === "UNI"));
      setSelectedOutputToken(
        tokensData.find((token) => token.symbol === "USDT")
      );
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
    const init = async () => {
      if (selectedChain) {
        await loadTokens();
      }
    };

    init();
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

  function sendEthereumTransaction(transaction: any) {
    // send transaction to ethereum
    sendTransaction(transaction).then((res) => {
      console.log(res, "res");
      // send succes toasti
      // stop loading
    });
  }

  function handleSmartOrderRouter() {
    console.log("handleSmartOrderRouter");

    // assembleTransaction
    const assembleRequestBody = {
      userAddr: "0x5B4d77e199FE8e5090009C72d2a5581C74FEbE89",
      pathId: quote.pathId,
      simulate: true,
    };
    odosService.assembleTransaction(assembleRequestBody).then((res) => {
      sendEthereumTransaction(res.data.transaction);
    });
  }

  const fetchTokenPrices = async () => {
    try {
      if (!selectedInputToken || !selectedOutputToken) return;
      const [inputPrice, outputPrice] = await Promise.all([
        getPrice(selectedInputToken.address),
        getPrice(selectedOutputToken.address),
      ]);
      setInputTokenPrice(inputPrice);
      setOutputTokenPrice(outputPrice);
    } catch (error) {
      console.error("Failed to fetch token prices:", error);
    }
  };

  // Add this useEffect
  useEffect(() => {
    fetchTokenPrices();
  }, [selectedInputToken?.address, selectedOutputToken?.address]);

  // if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full min-h-screen h-full relative bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl relative"
      >
        {/* Add overlay when loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 rounded-3xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <IconLoader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-gray-600 font-medium">
                Getting Best Price...
              </span>
            </div>
          </div>
        )}

        {/* Update header buttons to be disabled during loading */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              Swap
            </motion.button>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              onClick={() =>
                !isLoading && setIsAutoRefreshing(!isAutoRefreshing)
              }
              className={`flex items-center gap-2 text-gray-500 hover:text-gray-700 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              <IconRefresh
                className={`w-4 h-4 ${isAutoRefreshing ? "animate-spin" : ""}`}
              />
              <span className="text-sm">{refreshCounter}s</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              <IconSettings className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Swap Container */}
        <div className="relative">
          {/* Input Token */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 font-medium">You Pay</span>
              <span className="text-gray-500">
                Balance: {userBalance} {selectedInputToken?.symbol}
              </span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <input
                type="text"
                value={inputAmount}
                onChange={(e) => handleInputChange(e.target.value)}
                className="bg-transparent text-4xl w-full outline-none font-medium"
                placeholder="0.0"
                disabled={isLoading}
              />
              <CryptoSelect
                selectedToken={selectedInputToken}
                tokens={tokens}
                setSelectedToken={setSelectedInputToken}
                disabled={isLoading}
              />
            </div>

            {quote?.inValues && (
              <div className="text-gray-500 mt-2">
                ≈ ${Number(quote.inValues[0]).toFixed(2)}
              </div>
            )}

            {inputTokenPrice && (
              <div className="text-gray-500 mt-2 flex items-center gap-2">
                <span>Price: ${inputTokenPrice.toFixed(2)}</span>
                {quote?.inValues && (
                  <span>• Value: ${Number(quote.inValues[0]).toFixed(2)}</span>
                )}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <button className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <IconArrowsUpDown className="w-5 h-5 text-blue-500" />
          </button>

          {/* Output Token */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            {/* <motion.div
            initial={false}
            animate={{ scale: isLoading ? 0.98 : 1 }}
            className="bg-gray-50 p-6 rounded-2xl"
          > */}
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 font-medium">You Receive</span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={outputAmount}
                  readOnly
                  className="bg-transparent text-4xl w-full outline-none font-medium"
                  placeholder="0.0"
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                    <IconLoader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              <CryptoSelect
                selectedToken={selectedOutputToken}
                tokens={tokens}
                setSelectedToken={setSelectedOutputToken}
                disabled={isLoading}
              />
            </div>

            {quote?.outValues && (
              <div className="text-gray-500 mt-2">
                ≈ ${Number(quote.outValues[0]).toFixed(2)}
              </div>
            )}
            {outputTokenPrice && (
              <div className="text-gray-500 mt-2 flex items-center gap-2">
                <span>Price: ${outputTokenPrice.toFixed(2)}</span>
                {quote?.outValues && (
                  <span>• Value: ${Number(quote.outValues[0]).toFixed(2)}</span>
                )}
              </div>
            )}
            {/* </motion.div> */}
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-red-500 mt-4 p-3 bg-red-50 rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Details */}
        <AnimatePresence>
          {quote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-3 text-sm border-t pt-4"
            >
              <div className="flex justify-between text-gray-600">
                <span>Exchange Rate</span>
                <span className="font-medium">
                  1 {selectedInputToken?.symbol} = {exchangeRate.toFixed(4)}{" "}
                  {selectedOutputToken?.symbol}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Price Impact</span>
                <span
                  className={`font-medium ${
                    Number(quote.priceImpact) > 0.05
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {(Number(quote.priceImpact) * 100).toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Network Fee</span>
                <span className="font-medium">
                  ${quote.gasEstimateValue?.toFixed(4)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 bg-blue-500 text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !!error}
          onClick={handleSmartOrderRouter}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <IconLoader2 className="w-5 h-5 animate-spin" />
              Getting Best Price
            </span>
          ) : error ? (
            "Try Again"
          ) : (
            "Swap Tokens"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Swap;
