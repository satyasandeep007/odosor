import { TokenInfo } from "@/lib/types";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const CryptoSelect = ({
  selectedToken,
  tokens,
  setSelectedToken,
}: {
  selectedToken: TokenInfo;
  tokens: TokenInfo[];
  setSelectedToken: (token: TokenInfo) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Add this line

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Token Button */}
      <button
        className="flex items-center gap-2 bg-white px-8 py-2 rounded-full shadow-sm hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src={`https://assets.odos.xyz/tokens/${selectedToken?.symbol}.webp`}
          alt={selectedToken?.symbol}
          className="w-6 h-6"
          width={24}
          height={24}
        />
        <span className="font-medium">{selectedToken?.symbol}</span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 z-50 w-[320px] rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={{
              maxHeight: "400px",
              marginTop: "8px",
            }}
          >
            {/* Search Input */}
            <div className="sticky top-0 p-3 border-b border-gray-100 bg-white rounded-t-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tokens..."
                  className="w-full px-4 py-2 pl-10 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Token List */}
            <div className="overflow-auto" style={{ maxHeight: "300px" }}>
              {filteredTokens.map((token) => (
                <button
                  key={token.address}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    selectedToken?.address === token.address ? "bg-gray-50" : ""
                  }`}
                  onClick={() => {
                    setSelectedToken(token);
                    setIsOpen(false);
                  }}
                >
                  <Image
                    src={`https://assets.odos.xyz/tokens/${token.symbol}.webp`}
                    alt={token.symbol}
                    className="w-8 h-8"
                    width={32}
                    height={32}
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-xs text-gray-500">
                      {token.symbol}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CryptoSelect;
