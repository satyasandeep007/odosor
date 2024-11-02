"use client";

import React, { useEffect, useState, useCallback } from "react";
import { OdosService } from "@/lib/services/odos";
import { TokenInfo } from "@/lib/types";
import CryptoSelect from "@/components/CryptoSelect";
import { useRef } from "react";
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
  IconX,
} from "@tabler/icons-react";
import { sendTransaction } from "@/lib/blockchainUtils/sendTransaction";
import { getPrice } from "@/lib/services/quicknode";
import Image from "next/image";
import { useAccount } from "wagmi";
import Modal from "@/components/Modal";

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
  const [selectedTokens, setSelectedTokens] = useState<
    {
      token: TokenInfo;
      percentage: number;
    }[]
  >([]);
  const [targetPercentages, setTargetPercentages] = useState<number[]>([]);
  const [isMultiSwapMode, setIsMultiSwapMode] = useState<boolean>(false);
  const [gasPreference, setGasPreference] = useState<"speed" | "savings">(
    "savings"
  );
  const [isSelectingToken, setIsSelectingToken] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Add new state for managing token selection mode
  const [tokenSelectionMode, setTokenSelectionMode] = useState<
    "single" | "multi"
  >("single");

  // Add new state for pending tokens
  const [pendingTokens, setPendingTokens] = useState<
    {
      token: TokenInfo;
      percentage: number;
    }[]
  >([]);

  // Add confirmation modal state
  const [showConfirmSplit, setShowConfirmSplit] = useState(false);

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
  const handleGetQuote = useCallback(
    async (amount?: string) => {
      if (
        !selectedInputToken ||
        (isMultiSwapMode && selectedTokens.length === 0) ||
        (!isMultiSwapMode && !selectedOutputToken)
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const amountToUse = amount || inputAmount;
      const amountInDecimals = (
        Number(amountToUse) * Math.pow(10, selectedInputToken.decimals)
      ).toString();

      try {
        // Validate total percentage in multi mode
        if (isMultiSwapMode) {
          const totalPercentage = selectedTokens.reduce(
            (sum, t) => sum + t.percentage,
            0
          );
          if (Math.abs(totalPercentage - 100) > 0.01) {
            setError("Total percentage must equal 100%");
            return;
          }
        }

        const payload = {
          chainId: selectedChain,
          compact: true,
          gasPrice: gasPreference === "savings" ? 0.01125 : 0.01234,
          inputTokens: [
            {
              amount: amountInDecimals,
              tokenAddress: selectedInputToken.address,
            },
          ],
          outputTokens: isMultiSwapMode
            ? selectedTokens.map((tokenData) => ({
                proportion: tokenData.percentage / 100,
                tokenAddress: tokenData.token.address,
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

        // Calculate and format output amounts
        if (isMultiSwapMode && quoteData.outAmounts) {
          const outputs = quoteData.outAmounts.map(
            (amount: string, index: number) => {
              const token = selectedTokens[index].token;
              return Number(amount) / Math.pow(10, token.decimals);
            }
          );

          // Update the total output amount
          setOutputAmount(outputs.reduce((a, b) => a + b, 0).toString());

          // Update individual token outputs
          setSelectedTokens((prevTokens) =>
            prevTokens.map((token, index) => ({
              ...token,
              estimatedOutput: outputs[index],
            }))
          );
        } else if (quoteData.outAmounts?.[0]) {
          const formattedAmount = (
            Number(quoteData.outAmounts[0]) /
            Math.pow(10, selectedOutputToken.decimals)
          ).toString();
          setOutputAmount(formattedAmount);

          // Calculate exchange rate for single token mode
          const exchangeRate = calculateDynamicExchangeRate(
            quoteData.inAmounts[0],
            quoteData.outAmounts[0],
            quoteData.inValues[0],
            quoteData.outValues[0],
            selectedInputToken.decimals,
            selectedOutputToken.decimals
          );
          setExchangeRate(exchangeRate);
        }
      } catch (err) {
        setError("Failed to get quote");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedInputToken,
      selectedOutputToken,
      selectedTokens,
      inputAmount,
      selectedChain,
      gasPreference,
      address,
      isMultiSwapMode,
    ]
  );

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
  }, [handleGetQuote]);

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

  useEffect(() => {
    const init = async () => {
      if (selectedChain) {
        await loadTokens();
      }
    };

    init();
  }, [selectedChain]);

  useEffect(() => {
    if (!selectedInputToken || !selectedOutputToken || isMultiSwapMode) return;

    handleGetQuote();
  }, [inputAmount, selectedInputToken, selectedOutputToken, isMultiSwapMode]);

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

  // if (isLoading) return <div>Loading...</div>;

  // Add helper functions for token management
  const addTokenToSplit = (token: TokenInfo) => {
    if (pendingTokens.length >= 4) {
      setError("Maximum 4 tokens allowed for split");
      return;
    }

    const remainingPercentage =
      100 - pendingTokens.reduce((sum, t) => sum + t.percentage, 0);
    setPendingTokens([
      ...pendingTokens,
      { token, percentage: remainingPercentage },
    ]);
  };

  const removeTokenFromSplit = (index: number) => {
    const newTokens = selectedTokens.filter((_, i) => i !== index);
    // Redistribute percentages
    const totalPercentage = newTokens.reduce((sum, t) => sum + t.percentage, 0);
    if (totalPercentage < 100 && newTokens.length > 0) {
      const distribution = (100 - totalPercentage) / newTokens.length;
      newTokens.forEach((t) => (t.percentage += distribution));
    }
    setSelectedTokens(newTokens);
  };

  const updateTokenPercentage = (index: number, percentage: number) => {
    const newTokens = [...selectedTokens];
    const oldPercentage = newTokens[index].percentage;
    const difference = percentage - oldPercentage;

    // Adjust other tokens' percentages proportionally
    const remainingTokens = newTokens.filter((_, i) => i !== index);
    const totalRemainingPercentage = remainingTokens.reduce(
      (sum, t) => sum + t.percentage,
      0
    );

    remainingTokens.forEach((token) => {
      token.percentage -=
        difference * (token.percentage / totalRemainingPercentage);
    });

    newTokens[index].percentage = percentage;
    setSelectedTokens(newTokens);
  };

  const AutoRefreshToggle = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          isAutoRefreshing
            ? "bg-[#0aa6ec] text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <IconRefresh
          className={`w-4 h-4 ${isAutoRefreshing ? "animate-spin" : ""}`}
        />
        {isAutoRefreshing ? refreshCounter : "Auto Refresh"}
      </button>
    </div>
  );

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Add function to clear multi-token selection
  const clearMultiTokenSelection = () => {
    setSelectedTokens([]);
    setTokenSelectionMode("single");
    setIsMultiSwapMode(false);
  };

  // Modify the token selection and confirmation logic
  const confirmTokenSplit = () => {
    if (pendingTokens.length === 0) return;

    // Validate total percentage
    const totalPercentage = pendingTokens.reduce(
      (sum, t) => sum + t.percentage,
      0
    );
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError("Total percentage must equal 100%");
      return;
    }

    setSelectedTokens(pendingTokens);
    setShowConfirmSplit(false);
    setIsSelectingToken(false);

    // Trigger quote update with new tokens
    handleGetQuote();
  };

  // Add useEffect to initialize pendingTokens when entering multi mode
  useEffect(() => {
    if (isMultiSwapMode && selectedTokens.length === 0) {
      setPendingTokens([]);
    } else if (!isMultiSwapMode) {
      setPendingTokens([]);
    }
  }, [isMultiSwapMode]);

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
              <AutoRefreshToggle />

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

            {/* Swap Button - hide in multi mode */}
            {!isMultiSwapMode && (
              <div className="flex justify-center -my-1">
                <button
                  onClick={handleSwapTokens}
                  className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <IconArrowsUpDown className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            )}

            {/* Output Token - show only in single mode */}
            {!isMultiSwapMode && (
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
            )}
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
                onClick={() => {
                  const newMode = !isMultiSwapMode;
                  setIsMultiSwapMode(newMode);
                  setTokenSelectionMode(newMode ? "multi" : "single");
                  if (!newMode) {
                    setSelectedTokens([]);
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isMultiSwapMode
                    ? "bg-[#0aa6ec] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <IconLayoutGrid className="w-4 h-4" />
                  <span>Multi-Token Split</span>
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
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        Gas Preference
                      </span>
                      <span className="text-xs text-gray-500">
                        Optimize for speed or cost savings
                      </span>
                    </div>
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
              </div>
            </div>

            {/* Multi-Token Split UI */}
            {isMultiSwapMode && (
              <div className="bg-gray-50 rounded-xl overflow-hidden mt-4">
                <div className="px-4 py-3 bg-gray-100/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Token Split
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedTokens.length > 0 && (
                      <button
                        onClick={clearMultiTokenSelection}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Clear Split
                      </button>
                    )}
                    {selectedTokens.length < 4 && (
                      <button
                        onClick={() => {
                          setIsSelectingToken(true);
                          setPendingTokens([...selectedTokens]);
                        }}
                        className="text-xs text-[#0aa6ec] hover:text-[#0aa6ec]/80 font-medium"
                      >
                        + Add Token
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {selectedTokens.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      Add tokens to create a split swap
                    </div>
                  ) : (
                    selectedTokens.map((tokenData, index) => (
                      <div
                        key={tokenData.token.address}
                        className="bg-white rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Image
                              src={`https://assets.odos.xyz/tokens/${tokenData.token.symbol}.webp`}
                              alt={tokenData.token.symbol}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span className="font-medium text-sm">
                              {tokenData.token.symbol}
                            </span>
                          </div>
                          <button
                            onClick={() => removeTokenFromSplit(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input
                              type="range"
                              value={tokenData.percentage}
                              onChange={(e) =>
                                updateTokenPercentage(
                                  index,
                                  Number(e.target.value)
                                )
                              }
                              min="1"
                              max={
                                100 -
                                selectedTokens.reduce(
                                  (sum, t, i) =>
                                    i !== index ? sum + t.percentage : sum,
                                  0
                                )
                              }
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0aa6ec]"
                            />
                          </div>
                          <div className="w-16">
                            <input
                              type="number"
                              value={tokenData.percentage.toFixed(0)}
                              onChange={(e) => {
                                const value = Math.min(
                                  100,
                                  Math.max(1, Number(e.target.value))
                                );
                                updateTokenPercentage(index, value);
                              }}
                              className="w-full px-2 py-1 text-sm text-right border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0aa6ec]/20"
                            />
                          </div>
                          <span className="text-sm text-gray-500">%</span>
                        </div>

                        {/* Estimated Output */}
                        <div className="text-sm text-gray-500">
                          ≈{" "}
                          {(
                            (Number(outputAmount) * tokenData.percentage) /
                            100
                          ).toFixed(4)}{" "}
                          {tokenData.token.symbol}
                        </div>
                      </div>
                    ))
                  )}

                  {selectedTokens.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Percentage:</span>
                        <span
                          className={`font-medium ${
                            Math.abs(
                              selectedTokens.reduce(
                                (sum, t) => sum + t.percentage,
                                0
                              ) - 100
                            ) < 0.01
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {selectedTokens
                            .reduce((sum, t) => sum + t.percentage, 0)
                            .toFixed(0)}
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Token Selection Modal with Confirmation */}
            {isSelectingToken && (
              <Modal
                onClose={() => {
                  setIsSelectingToken(false);
                  setPendingTokens([...selectedTokens]);
                }}
              >
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Select Tokens for Split
                    </h3>
                    <input
                      type="text"
                      placeholder="Search tokens..."
                      className="w-full px-3 py-2 border rounded-lg"
                      onChange={(e) => {
                        /* Implement token search */
                      }}
                    />
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {tokens
                      .filter(
                        (token) =>
                          !pendingTokens.some(
                            (t) => t.token.address === token.address
                          )
                      )
                      .map((token) => (
                        <button
                          key={token.address}
                          onClick={() => addTokenToSplit(token)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                        >
                          <Image
                            src={`https://assets.odos.xyz/tokens/${token.symbol}.webp`}
                            alt={token.symbol}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{token.symbol}</span>
                            <span className="text-sm text-gray-500">
                              {token.name}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsSelectingToken(false);
                        setPendingTokens([...selectedTokens]);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmTokenSplit}
                      disabled={pendingTokens.length === 0}
                      className="px-4 py-2 text-sm bg-[#0aa6ec] text-white rounded-lg disabled:opacity-50"
                    >
                      Confirm Split
                    </button>
                  </div>
                </div>
              </Modal>
            )}
          </div>

          {/* Swap Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full mt-4 bg-[#0aa6ec] text-white py-3 rounded-xl font-medium text-sm"
            onClick={handleSmartOrderRouter}
          >
            {isLoading ? "Getting Best Price..." : "Swap Tokens"}
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
