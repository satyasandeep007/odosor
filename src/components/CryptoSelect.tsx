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
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Selected Token Button */}
      <button
        className="flex items-center gap-2 bg-white px-8 py-2 rounded-full shadow-sm hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${selectedToken.symbol.toLowerCase()}.png`}
          alt={selectedToken.symbol}
          className="w-6 h-6"
          width={24}
          height={24}
        />
        <span className="font-medium">{selectedToken.symbol}</span>
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
        <div className="absolute z-10 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-2 max-h-60 overflow-auto">
            {tokens.map((token) => (
              <button
                key={token.address}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                  selectedToken.address === token.address ? "bg-gray-50" : ""
                }`}
                onClick={() => {
                  setSelectedToken(token);
                  setIsOpen(false);
                }}
              >
                <Image
                  src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${token.symbol.toLowerCase()}.png`}
                  alt={token.symbol}
                  className="w-6 h-6"
                  width={24}
                  height={24}
                />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-xs text-gray-500">{token.symbol}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoSelect;
