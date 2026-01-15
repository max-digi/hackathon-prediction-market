import type { Metadata } from "next";
import { Space_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "HACKATHON BETS",
  description: "Bet on which projects will win the hackathon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceMono.variable} ${instrumentSerif.variable} font-mono antialiased bg-black text-white min-h-screen selection:bg-white selection:text-black`}
      >
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
