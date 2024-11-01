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
  IconLayoutGrid,
  IconArrowsExchange,
  IconGasStation,
  IconChevronDown,
  IconShieldCheck,
} from "@tabler/icons-react";
import { sendTransaction } from "@/lib/blockchainUtils/sendTransaction";
import { getPrice } from "@/lib/services/quicknode";
import Image from "next/image";
import { useAccount } from "wagmi";

const odosService = new OdosService();

const HomePage = () => {
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
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [inputTokenPrice, setInputTokenPrice] = useState<number | null>(null);
  const [outputTokenPrice, setOutputTokenPrice] = useState<number | null>(null);
  const { address } = useAccount();

  // New state for multi-token swaps
  const [isMultiSwapMode, setIsMultiSwapMode] = useState<boolean>(false);
  const [selectedTokens, setSelectedTokens] = useState<TokenInfo[]>([]);
  const [targetPercentages, setTargetPercentages] = useState<number[]>([]);

  // New state for gas and MEV protection
  const [gasPreference, setGasPreference] = useState<"speed" | "savings">(
    "savings"
  );
  const [mevProtection, setMevProtection] = useState<boolean>(false);

  // New state for cross-chain
  const [targetChain, setTargetChain] = useState<number>(137);
  const [isCrossChainMode, setIsCrossChainMode] = useState<boolean>(false);

  // Add auto-refresh functionality
  const startAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    setRefreshCounter(10);
    refreshIntervalRef.current = setInterval(() => {
      setRefreshCounter((prev) => {
        if (prev <= 0) {
          // Changed from prev <= 1
          handleGetQuote();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (isAutoRefreshing) {
      startAutoRefresh();
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefreshing, startAutoRefresh]);

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
        outputTokens: isMultiSwapMode
          ? selectedTokens.map((token, index) => ({
              proportion: targetPercentages[index] / 100,
              tokenAddress: token.address,
            }))
          : [
              {
                proportion: 1,
                tokenAddress: selectedOutputToken.address,
              },
            ],
        referralCode: 0,
        slippageLimitPercent: 0.3,
        sourceBlacklist: [],
        sourceWhitelist: [],
        userAddr: address || "0x5B4d77e199FE8e5090009C72d2a5581C74FEbE89",
        gasOptimization:
          gasPreference === "savings"
            ? {
                maxGasPrice: 100,
                minSavings: 5,
              }
            : undefined,
        mevProtection: mevProtection,
      };

      const quoteData: any = await odosService.getQuote(payload);
      setQuote(quoteData);

      // Price impact protection
      if (Number(quoteData.priceImpact) > 0.02) {
        setError(
          `High price impact warning: ${(
            Number(quoteData.priceImpact) * 100
          ).toFixed(2)}%`
        );
      }

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
    if (!address || !quote) return;

    setIsLoading(true);

    const assembleRequestBody = {
      userAddr: address,
      pathId: quote.pathId,
      simulate: true,
      mevProtection,
      crossChain: isCrossChainMode
        ? {
            targetChain,
            bridgeData: quote.bridgeData,
          }
        : undefined,
    };

    odosService
      .assembleTransaction(assembleRequestBody)
      .then((res) => {
        sendEthereumTransaction(res.data.transaction);
      })
      .catch((err) => {
        setError("Failed to assemble transaction");
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
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

  const handleCrossChainSwap = async () => {
    if (!selectedInputToken || !selectedOutputToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // First get quote for source chain
      const sourceQuote = await handleGetQuote();

      // Then prepare cross-chain payload
      const crossChainPayload = {
        sourceChain: selectedChain,
        targetChain: targetChain,
        inputTokens: [
          {
            amount: quote.inAmounts[0],
            tokenAddress: selectedInputToken.address,
          },
        ],
        outputTokens: [
          {
            proportion: 1,
            tokenAddress: selectedOutputToken.address,
          },
        ],
        userAddr: address,
      };

      // Get cross-chain quote
      const crossChainQuote = await odosService.getCrossChainQuote(
        crossChainPayload
      );
      setQuote(crossChainQuote);
    } catch (err) {
      setError("Failed to get cross-chain quote");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4">
      <div className="w-full max-w-xl flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md relative"
        >
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
          {/* Simplified Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#0aa6ec] text-white px-4 py-1.5 rounded-full text-sm font-medium"
            >
              Swap
            </motion.button>

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
                  className={`w-4 h-4 ${
                    isAutoRefreshing ? "animate-spin" : ""
                  }`}
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
          <div className="space-y-2">
            {/* Input Token */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">You Pay</span>
                <span className="text-sm text-gray-500">
                  Balance: {userBalance} {selectedInputToken?.symbol}
                </span>
              </div>

              <div className="flex justify-between items-center gap-3">
                <input
                  type="text"
                  value={inputAmount}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="bg-transparent text-2xl w-full outline-none font-medium"
                  placeholder="0.0"
                />
                <CryptoSelect
                  selectedToken={selectedInputToken}
                  tokens={tokens}
                  setSelectedToken={setSelectedInputToken}
                />
              </div>

              {inputTokenPrice && (
                <div className="text-xs text-gray-500 mt-1">
                  ≈ ${(Number(inputAmount) * inputTokenPrice).toFixed(2)}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                onClick={handleSwapTokens}
                className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <IconArrowsUpDown className="w-4 h-4 text-blue-500" />
              </button>
            </div>

            {/* Output Token */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500">You Receive</span>
              </div>

              <div className="flex justify-between items-center gap-3">
                <input
                  type="text"
                  value={outputAmount}
                  readOnly
                  className="bg-transparent text-2xl w-full outline-none font-medium"
                  placeholder="0.0"
                />
                <CryptoSelect
                  selectedToken={selectedOutputToken}
                  tokens={tokens}
                  setSelectedToken={setSelectedOutputToken}
                />
              </div>

              {outputTokenPrice && (
                <div className="text-xs text-gray-500 mt-1">
                  ≈ ${(Number(outputAmount) * outputTokenPrice).toFixed(2)}
                </div>
              )}
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
          {quote && (
            <div className="mt-4 space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Rate</span>
                <span>
                  1 {selectedInputToken?.symbol} = {exchangeRate.toFixed(4)}{" "}
                  {selectedOutputToken?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Impact</span>
                <span
                  className={
                    Number(quote.priceImpact) > 0.05
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {(Number(quote.priceImpact) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Fee</span>
                <span>${quote.gasEstimateValue?.toFixed(4)}</span>
              </div>
            </div>
          )}

          {/* Mode Selection and Settings Panel */}
          <div className="space-y-4 mt-4 mb-6">
            {/* Mode Toggles */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
              <button
                onClick={() => setIsMultiSwapMode(!isMultiSwapMode)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isMultiSwapMode
                    ? "bg-[#0aa6ec] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <IconLayoutGrid className="w-4 h-4" />
                  <span>Multi-Swap</span>
                </div>
              </button>
              <button
                onClick={() => setIsCrossChainMode(!isCrossChainMode)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isCrossChainMode
                    ? "bg-[#0aa6ec] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <IconArrowsExchange className="w-4 h-4" />
                  <span>Cross-Chain</span>
                </div>
              </button>
            </div>

            {/* Settings Panel */}
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-100/50">
                <span className="text-sm font-semibold text-gray-700">
                  Advanced Settings
                </span>
              </div>

              <div className="p-4 space-y-4">
                {/* Gas Preference */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconGasStation className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Gas Preference
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={gasPreference}
                      onChange={(e) =>
                        setGasPreference(e.target.value as "speed" | "savings")
                      }
                      className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0aa6ec]/20 focus:border-[#0aa6ec] transition-all"
                    >
                      <option value="speed">Speed</option>
                      <option value="savings">Savings</option>
                    </select>
                    <IconChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* MEV Protection */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconShieldCheck className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        MEV Protection
                      </span>
                      <span className="text-xs text-gray-500">
                        Protect against front-running
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mevProtection}
                      onChange={(e) => setMevProtection(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0aa6ec]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0aa6ec]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Cross-Chain UI */}
          {isCrossChainMode && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium">Target Chain</span>
              <select
                value={targetChain}
                onChange={(e) => setTargetChain(Number(e.target.value))}
                className="w-full mt-1 bg-white rounded-lg px-2 py-1"
              >
                <option value="137">Polygon</option>
                <option value="1">Ethereum</option>
                {/* Add other supported chains */}
              </select>
            </div>
          )}

          {/* Swap Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full mt-4 bg-[#0aa6ec] text-white py-3 rounded-xl font-medium text-sm"
            onClick={
              isCrossChainMode ? handleCrossChainSwap : handleSmartOrderRouter
            }
          >
            {isLoading
              ? "Getting Best Price..."
              : isCrossChainMode
              ? "Cross-Chain Swap"
              : "Swap Tokens"}
          </motion.button>
        </motion.div>

        {/* Powered By Section */}
        <div className="flex items-center max-w-md justify-between p-4 mt-6">
          <span className="text-xs font-medium text-gray-400">Powered by</span>
          <div className="flex items-center gap-6">
            <a
              href="https://odos.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/odos.svg"
                alt="Odos Protocol"
                className="h-5 w-auto rounded-full"
                width={32}
                height={32}
                priority
              />
            </a>
            <a
              href="https://quicknode.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/quicknode.svg"
                alt="QuickNode"
                className="h-5 w-auto rounded-full"
                width={32}
                height={32}
                priority
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
