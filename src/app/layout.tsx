import type { Metadata } from "next";
import { Cinzel, DM_Sans, Great_Vibes } from "next/font/google";
import "./globals.css";

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "KUKI'S KRAKERS & FIREWORKS | Safe & Sparkling Fun — Order Online",
  description:
    "Order Diwali crackers online from KUKI'S KRAKERS & FIREWORKS. Free home delivery from Dahisar to Andheri. Safe & sparkling fun — Festival of Lights.",
  openGraph: {
    title: "KUKI'S KRAKERS & FIREWORKS | Happy Diwali",
    description:
      "Safe & Sparkling Fun. Free delivery Dahisar to Andheri. Order crackers online.",
    images: ["/pampletposter.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} ${script.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
