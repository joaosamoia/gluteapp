import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { APP_CONFIG } from "@/config";
import { SwRegister } from "@/components/SwRegister";
import "./globals.css";

const display = Outfit({ variable: "--font-display-face", subsets: ["latin"], weight: ["600", "700", "800"] });
const body = Plus_Jakarta_Sans({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} · Desafio de glúteo em casa`,
  description: APP_CONFIG.tagline,
  appleWebApp: { capable: true, title: APP_CONFIG.shortName, statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f6f3fd",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="font-sans">
        <div className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-hidden bg-bg sm:shadow-2xl sm:shadow-primary/10">
          {children}
        </div>
        <SwRegister />
      </body>
    </html>
  );
}
