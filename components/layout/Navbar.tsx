"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto border-b border-white/5">
      <Link href="/dashboard">
        <Image src="/logo-publyq.jpeg" alt="PUBLYQ" width={120} height={32} className="h-8 w-auto" />
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <UserButton />
      </div>
    </nav>
  );
}
