import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PUBLYQ — 7 dias de conteúdo em 1 hora",
  description: "O método que transforma 1 hora por semana em 7 dias de conteúdo publicado. Brand Voice AI + Batch Creation + Kaizen Loop. Junta-te à lista de espera.",
  keywords: ["content creation", "AI content", "batch content", "brand voice", "kaizen", "solopreneur"],
  openGraph: {
    title: "PUBLYQ — 7 dias de conteúdo em 1 hora",
    description: "O método que transforma 1 hora por semana em 7 dias de conteúdo publicado.",
    type: "website",
    url: "https://publyq.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "PUBLYQ — 7 dias de conteúdo em 1 hora",
    description: "O método que transforma 1 hora por semana em 7 dias de conteúdo publicado.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
