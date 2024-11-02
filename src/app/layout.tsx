import "./globals.css";
import type { Metadata } from "next";
import { Loading } from "@/layout/Loading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { headers } from "next/headers";
import ContextProvider from "./ProviderContext";
import { Montserrat, Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "Build on 2024",
  description: "Build on 2024.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get("cookie");

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Loading>
            <ContextProvider cookies={cookies}>
              {children}
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
              />
            </ContextProvider>
          </Loading>
        </main>
      </body>
    </html>
  );
}
