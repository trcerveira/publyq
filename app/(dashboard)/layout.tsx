import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasBetaAccess } from "@/lib/config/admins";
import Navbar from "@/components/layout/Navbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Beta whitelist check — runs in Node.js runtime (not edge)
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!hasBetaAccess(email)) {
    redirect("/#waitlist");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
