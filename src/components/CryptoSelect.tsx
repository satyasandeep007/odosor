import { TokenInfo } from "@/lib/types";
import { IconChevronDown } from "@tabler/icons-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface CryptoSelectProps {
  selectedToken: TokenInfo | null;
  tokens: TokenInfo[];
  setSelectedToken: (token: TokenInfo) => void;
}

const CryptoSelect: React.FC<CryptoSelectProps> = ({
  selectedToken,
  tokens,
  setSelectedToken,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg hover:bg-gray-50"
      >
        {selectedToken ? (
          <>
            <Image
              src={`https://assets.odos.xyz/tokens/${selectedToken.symbol}.webp`}
              alt={selectedToken.symbol}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-medium">{selectedToken.symbol}</span>
          </>
        ) : (
          <span>Select Token</span>
        )}
        <IconChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          {tokens.map((token) => (
            <button
              key={token.address}
              onClick={() => handleTokenSelect(token)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
            >
              <Image
                src={`https://assets.odos.xyz/tokens/${token.symbol}.webp`}
                alt={token.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div className="flex flex-col items-start">
                <span className="font-medium">{token.symbol}</span>
                <span className="text-xs text-gray-500">{token.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoSelect;
