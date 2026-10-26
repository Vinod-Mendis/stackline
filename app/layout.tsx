import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppNav } from "../components/nav/AppNav";
import { SaveErrorToast } from "../components/shared/SaveErrorToast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stackline – Project Timeline",
  description: "Internal project timeline planner and phase tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col md:flex-row overflow-hidden">
        <AppNav />
        <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">
          {children}
        </div>
        <SaveErrorToast />
      </body>
    </html>
  );
}
