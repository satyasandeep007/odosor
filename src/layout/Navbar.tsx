"use client";

import { useAccount } from "wagmi";
import Image from "next/image";

const Navbar = () => {
  const { isConnected }: any = useAccount();

  return (
    <nav className=" fixed w-full  top-0 left-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center">
          <Image
            src="/ODOSOR_NEW.png"
            alt="ODO SWAP"
            width={140}
            height={140}
          />
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
