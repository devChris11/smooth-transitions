import type { Metadata } from "next";
import { Lexend, Lexend_Exa } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const lexendExa = Lexend_Exa({
  variable: "--font-lexend-exa",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smooth Transitions",
  description: "Smooth Transitions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable} ${lexendExa.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
