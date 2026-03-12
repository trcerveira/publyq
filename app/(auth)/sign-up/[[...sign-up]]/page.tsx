import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#0A0E1A]">
      <div className="text-center mb-8">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-[#BFD64B]">P</span>UBLYQ
        </span>
        <p className="text-[#8892a4] text-sm mt-2">Cria a tua conta</p>
      </div>
      <SignUp />
    </main>
  );
}
