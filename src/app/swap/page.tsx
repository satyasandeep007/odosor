import React from "react";

const Swap = () => {
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
              defaultValue="1"
              className="bg-transparent text-4xl w-full outline-none text-[#FF6B6B]"
            />
            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <img src="/eth-logo.png" alt="ETH" className="w-6 h-6" />
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
          <div className="text-gray-500 mt-1">$2,516.85</div>
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
              0 ETH
            </span>
            <span className="text-gray-400">Max</span>
          </div>
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <button className="bg-white p-2 rounded-lg shadow-md">
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
              defaultValue="2503.23"
              className="bg-transparent text-4xl w-full outline-none"
            />
            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <img src="/usdt-logo.png" alt="USDT" className="w-6 h-6" />
              <span>USDT</span>
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
          <div className="text-gray-500 mt-1">$2,503.90</div>
        </div>

        {/* Error message */}
        <div className="text-center text-red-500 mt-4">Insufficient ETH</div>

        {/* Exchange rate */}
        <div className="mt-4 text-gray-500 text-sm">
          1 USDT = 0.00039013 ETH ($0.999)
        </div>

        {/* Network swap banner */}
        <div className="mt-4 flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
          <div className="flex gap-1">
            <img src="/eth-logo.png" alt="" className="w-6 h-6" />
            <img src="/polygon-logo.png" alt="" className="w-6 h-6 -ml-2" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Swapping across networks</span>
              <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                New
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Move ETH, USDC, and more across 8+ networks.
            </div>
          </div>
          <button className="ml-auto">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Swap;
