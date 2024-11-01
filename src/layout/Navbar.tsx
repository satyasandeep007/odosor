"use client";

import { useAccount } from "wagmi";
import Image from "next/image";

const Navbar = () => {
  const { isConnected } = useAccount();

  return (
    <nav className=" fixed w-full  top-0 left-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center">
          <Image src="/logo.svg" alt="ODO SWAP" width={24} height={24} />
          <span className="ml-2 text-[#ff5100] text-3xl font-bold font-[Montserrat]">
            ODOS
          </span>{" "}
          {""}
          <span className="text-[#666666] text-3xl font-semibold font-[Poppins]">
            OR
          </span>
        </div>

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
