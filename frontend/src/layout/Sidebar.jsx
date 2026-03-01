import {
  LayoutDashboard,
  Users,
  Building2,
  Component,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";

function Sidebar() {
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
    <div className="
      w-15
      h-screen
      bg-[#0b111c]
      border-r border-white/5
      text-slate-400
      flex flex-col
    ">

      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-neutral-800">
      <Link to="/dashboard">CRM</Link>
      </div>

      {/* Main Menu */}
      <div className="flex-1 px-2 py-6 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center justify-center px-3 py-3 rounded-lg transition ${
                isActive
                  ? "bg-white/5 text-white"
                  : "hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon size={20} />

            {/* Tooltip */}
            <span
              className="
                absolute left-full ml-3
                px-3 py-1.5
                bg-[#111827]
                text-white text-xs
                rounded-md
                opacity-0
                group-hover:opacity-100
                translate-x-2
                group-hover:translate-x-0
                transition-all duration-200
                whitespace-nowrap
                pointer-events-none
                shadow-lg
                z-50
              "
            >
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="px-2 pb-6 space-y-2 border-t border-neutral-800 pt-4">
        {bottomItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="group relative flex items-center justify-center px-3 py-3 rounded-lg hover:bg-white/5 hover:text-white transition"
          >
            <item.icon size={20} />

            {/* Tooltip */}
            <span
              className="
                absolute left-full ml-3
                px-3 py-1.5
                bg-[#111827]
                text-white text-xs
                rounded-md
                opacity-0
                group-hover:opacity-100
                translate-x-2
                group-hover:translate-x-0
                transition-all duration-200
                whitespace-nowrap
                pointer-events-none
                shadow-lg
                z-50
              "
            >
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>

    </div>
  );
}

export default Sidebar;