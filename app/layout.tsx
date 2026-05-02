import type { Metadata, Viewport } from "next";
import { AppShell } from "./components/AppShell";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Mess Master - Management System",
  description: "Manage your mess expenses, meals, and member payments efficiently",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Viewport meta tag is automatically injected by Next.js from the viewport export above */}
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}