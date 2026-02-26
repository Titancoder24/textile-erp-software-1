import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TextileOS - Sign In",
  description: "The Textile Industry's Operating System",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
