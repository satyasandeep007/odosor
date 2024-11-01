import "./globals.css";
import type { Metadata } from "next";
import AppKitProvider from "@/app/providers";
import { Loading } from "@/layout/Loading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cookieToInitialState } from "wagmi";
import { config } from "@/lib/wagmiConfig";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Build on 2024",
  description: "Build on 2024.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Loading>
            <AppKitProvider initialState={initialState}>
              {children}
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
              />
            </AppKitProvider>
          </Loading>
        </main>
      </body>
    </html>
  );
}
