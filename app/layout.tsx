import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Complete AI Model History (2022-2025)",
  description: "A timeline of major AI model releases from 2022 to 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#0A0A0A] text-white m-0">
        {children}
      </body>
    </html>
  );
}
