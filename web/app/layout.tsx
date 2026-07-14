import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
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
        {children}
      </body>
    </html>
  );
}
