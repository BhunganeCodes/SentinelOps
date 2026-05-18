import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "./components/layout-shell";

export const metadata: Metadata = {
  title: "SentinelOPS",
  description: "AI-powered procurement intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
