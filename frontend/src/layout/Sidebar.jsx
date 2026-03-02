import {
  LayoutDashboard,
  Users,
  Building2,
  Component,
  Settings,
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Leads",     icon: Users,           path: "/leads" },
    { name: "Clients",   icon: Building2,        path: "/clients" },
    { name: "Projects",  icon: Component,        path: "/projects" },
  ];

  const bottomItems = [
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const navCls = ({ isActive }) =>
    `group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${
      isActive
        ? "bg-indigo-600/20 text-indigo-400 shadow-inner shadow-indigo-500/10"
        : "text-slate-600 hover:text-slate-200 hover:bg-white/[0.06]"
    }`;

  const Tooltip = ({ label }) => (
    <span className="absolute left-full ml-3.5 px-2.5 py-1.5 bg-[#0d1117] border border-white/[0.08] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-xl z-50">
      {label}
    </span>
  );

  return (
    <div className="w-[60px] h-screen bg-[#080c12] border-r border-white/[0.06] text-slate-400 flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/[0.06]">
        <Link to="/dashboard">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform duration-150">
            <span className="text-white text-xs font-bold">A</span>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <div className="flex-1 flex flex-col items-center py-5 gap-1.5">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={navCls}>
            <item.icon size={18} strokeWidth={1.8} />
            <Tooltip label={item.name} />
          </NavLink>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="flex flex-col items-center pb-5 gap-1.5 border-t border-white/[0.06] pt-4">
        {bottomItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={navCls}>
            <item.icon size={18} strokeWidth={1.8} />
            <Tooltip label={item.name} />
          </NavLink>
        ))}
      </div>

    </div>
  );
}

export default Sidebar;