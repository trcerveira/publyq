import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PUBLYQ — 7 days of content in 1 hour",
  description: "The method that turns 1 hour per week into 7 days of published content. Brand Voice AI + Batch Creation + Kaizen Loop. Join the waitlist.",
  keywords: ["content creation", "AI content", "batch content", "brand voice", "kaizen", "solopreneur"],
  openGraph: {
    title: "PUBLYQ — 7 days of content in 1 hour",
    description: "The method that turns 1 hour per week into 7 days of published content.",
    type: "website",
    url: "https://publyq.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "PUBLYQ — 7 days of content in 1 hour",
    description: "The method that turns 1 hour per week into 7 days of published content.",
  },
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
