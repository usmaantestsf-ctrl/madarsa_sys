import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Madrasa Management System",
  description: "Manage timetables, attendance, and academic records",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
