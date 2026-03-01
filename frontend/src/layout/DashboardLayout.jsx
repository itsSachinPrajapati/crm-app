import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#070f1a]">

      {/* Sidebar */}
      <div className="h-screen">
        <Sidebar />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </main>

      </div>
    </div>
  );
}