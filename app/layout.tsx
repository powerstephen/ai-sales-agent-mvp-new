import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Sales Agent MVP",
  description: "Dormant pipeline recovery dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
