import { BottomNav } from "@/components/client/bottom-nav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
