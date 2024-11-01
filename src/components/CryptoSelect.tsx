import { TokenInfo } from "@/lib/types";

const CryptoSelect = ({
  selectedInputToken,
  tokens,
  setSelectedInputToken,
  handleGetQuote,
}: {
  selectedInputToken: TokenInfo;
  tokens: TokenInfo[];
  setSelectedInputToken: (token: TokenInfo) => void;
  handleGetQuote: () => void;
}) => {
  return (
    <div className="relative inline-block">
      <button
        className="flex items-center gap-2 bg-white px-8 py-2 rounded-full shadow-sm hover:bg-gray-50"
        onClick={() => {
          const select = document.getElementById("tokenSelect");
          if (select) {
            select.click();
          }
        }}
      >
        <img
          src={selectedInputToken.logo}
          alt={selectedInputToken.symbol}
          className="w-6 h-6"
        />
        <span className="font-medium">{selectedInputToken.symbol}</span>
        <svg
          className="w-4 h-4 text-gray-600"
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
        <select
          id="tokenSelect"
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          value={selectedInputToken.address}
          onChange={(e) => {
            const selectedToken = tokens.find(
              (token) => token.address === e.target.value
            );
            if (selectedToken) {
              setSelectedInputToken(selectedToken);
              handleGetQuote();
            }
          }}
        >
          {tokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol}
            </option>
          ))}
        </select>
      </button>
    </div>
  );
};

export default CryptoSelect;
