import { Sidebar } from "@/components/admin/sidebar"; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Page content will be injected here */}
        {children}
      </main>
    </div>
  );
}