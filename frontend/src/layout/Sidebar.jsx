import {
  LayoutDashboard,
  Users,
  Building2,
  Component,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar({ expanded, setExpanded }) {

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Leads", icon: Users, path: "/leads" },
    { name: "Clients", icon: Building2, path: "/clients" },
    { name: "Projects", icon: Component, path: "/projects" }
  ];

  const bottomItems = [
    { name: "Settings", icon: Settings, path: "/settings" }
  ];

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`
        transition-all duration-300
        ${expanded ? "w-64" : "w-20"}
        bg-[#0b111c]
        border-r border-white/5
        text-slate-400
        min-h-screen
        flex flex-col
      `}
    >

      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-neutral-800">
        {expanded ? (
          <span className="text-white font-semibold text-lg">CRM</span>
        ) : (
          <span className="text-white font-bold text-lg">C</span>
        )}
      </div>

      <div className="flex-1 px-2 py-6 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white/5 text-white"
                  : "hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon size={20} />
            {expanded && <span className="text-sm">{item.name}</span>}
          </NavLink>
        ))}
      </div>

      <div className="px-2 pb-6 space-y-2 border-t border-neutral-800 pt-4">
        {bottomItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition"
          >
            <item.icon size={20} />
            {expanded && <span className="text-sm">{item.name}</span>}
          </NavLink>
        ))}
      </div>

    </div>
  );
}

export default Sidebar;