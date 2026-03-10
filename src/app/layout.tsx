import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inz Resume",
  description: "Interactive RPG-style resume",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
