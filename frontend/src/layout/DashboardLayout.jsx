import { useState } from "react";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-200">

      {/* Sidebar */}
      <Sidebar expanded={expanded} setExpanded={setExpanded} />

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-10 py-6">
          {children}
        </div>
      </main>

    </div>
  );
}

export default DashboardLayout;