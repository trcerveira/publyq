import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// ClerkProvider needs request context — force dynamic rendering
export const dynamic = "force-dynamic";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "PUBLYQ — Cria o conteúdo de uma semana numa manhã",
  description: "A equipa de conteúdo IA para PMEs portuguesas. Brand DNA + Voice DNA + Carrosséis Instagram.",
  keywords: ["conteúdo", "IA", "marca pessoal", "brand DNA", "voice DNA", "kaizen", "solopreneur", "Instagram", "carrossel"],
  openGraph: {
    title: "PUBLYQ",
    description: "Cria o conteúdo de uma semana numa manhã.",
    type: "website",
    url: "https://publyq.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
