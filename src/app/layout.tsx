import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "一草園扭蛋出清",
  description: "一草園扭蛋及扭蛋機出清購買意向書",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-TW" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
