import { useState } from "react";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-200">

      <Sidebar expanded={expanded} setExpanded={setExpanded} />

      <main
        className={`
          flex-1
          transition-[margin] duration-300
          ${expanded ? "ml-64" : "ml-20"}
        `}
      >
        <div className="px-10 py-10">
          {children}
        </div>
      </main>

    </div>
  );
}

export default DashboardLayout;