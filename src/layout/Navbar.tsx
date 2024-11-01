"use client";

import { useAccount } from "wagmi";

const Navbar = () => {
  const { isConnected } = useAccount();

  return (
    <nav className="bg-[#0aa6ec] fixed w-full  top-0 left-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center">
          <span className="self-center text-2xl font-semibold text-white">
            ODO X
          </span>
        </a>

        <div className="w-full md:block md:w-auto">
          <div className="w-full flex justify-end">
            <div className="flex justify-center items-center">
              {!isConnected ? (
                <w3m-connect-button size="sm" />
              ) : (
                <div className="flex items-center gap-2">
                  <w3m-network-button />
                  <w3m-account-button balance={"show"} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
