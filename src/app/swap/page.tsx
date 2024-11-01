import React from "react";

const Swap = () => {
  return (
    <div className="w-full min-h-screen h-full relative bg-[#fafafa] flex items-center justify-center">
      <div className="bg-white p-4 rounded-3xl shadow-lg w-full max-w-2xl">
        {/* Tab buttons */}
        <div className="flex gap-4 mb-6">
          <button className="font-semibold text-black">Buy</button>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <span>0.30% slippage</span>
            <button className="text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Input fields */}
        <div className="space-y-2">
          <div className="bg-[#f7f7f7] p-4 rounded-2xl">
            <input
              type="text"
              defaultValue="100"
              className="bg-transparent text-4xl w-full outline-none"
            />
            <div className="flex items-center mt-2">
              <button className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <img src="/us-flag.png" alt="USD" className="w-5 h-5" />
                <span>USDC</span>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-[#f7f7f7] p-4 rounded-2xl">
            <input
              type="text"
              defaultValue="0.12342"
              className="bg-transparent text-4xl w-full outline-none"
            />
            <div className="flex items-center mt-2">
              <button className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <img src="/eth-logo.png" alt="ETH" className="w-5 h-5" />
                <span>ETH</span>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Buy button */}
        <button className="w-full bg-[#6366F1] text-white py-4 rounded-xl mt-6 font-medium">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default Swap;
