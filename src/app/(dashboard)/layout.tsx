import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="ml-20 lg:ml-64 flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
}
