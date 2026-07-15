import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Jackpot Wall | Stacks",
  description: "Post to the wall, trigger the jackpot.",
  other: {
    "talentapp:project_verification": "4ab7e8289f1784078cb14cfc1735d2531fdde6aef6fbf1c6beac499a6be8ac144586d80a51528dd84b64f5400b15203ee4e0eabc037ae3ed8e427e1d9bb69801"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} ${jetbrainsMono.variable}`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#5546FF] focus:text-white focus:rounded-lg">
          Skip to content
        </a>
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
