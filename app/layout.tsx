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
  title: "PUBLYQ — 7 dias de conteúdo. Uma manhã.",
  description: "O método que transforma uma manhã por semana em conteúdo publicado para toda a semana — na tua voz, não na de um robô.",
  keywords: ["conteúdo", "IA", "marca pessoal", "brand DNA", "voice DNA", "kaizen", "solopreneur", "Instagram"],
  openGraph: {
    title: "PUBLYQ — 7 dias de conteúdo. Uma manhã.",
    description: "O método que transforma uma manhã por semana em conteúdo publicado para toda a semana.",
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
