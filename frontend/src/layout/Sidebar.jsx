import {
    LayoutDashboard,
    Bell,
    FileText,
    CheckSquare,
    Mail,
    Calendar,
    BarChart3,
    Users,
    Building2,
    Plug,
    Component ,
    Settings
  } from "lucide-react";
  import { NavLink } from "react-router-dom";
  import { useState } from "react";
  
  function Sidebar({ expanded, setExpanded }) {
  
    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Leads", icon: Users, path: "/leads" },
        { name: "Clients", icon: Building2, path: "/clients" },
        { name: "Projects", icon: Component, path: "/Projects" }
      ];
  
    {/* const databaseItems = [
      { name: "Analytics", icon: BarChart3, path: "#" },
      { name: "Contacts", icon: Users, path: "/clients" },
      { name: "Companies", icon: Building2, path: "#" },
    ]; */}
  
    const bottomItems = [
      { name: "Settings", icon: Settings, path: "/settings" }
    ];
  
    return (
      <div
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={`
            fixed left-0 top-0 h-screen
            bg-[#0b111c]
            border-r border-white/5
            text-slate-400
            transition-all duration-300
            ${expanded ? "w-64" : "w-20"}
            flex flex-col
          `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-neutral-800">
          {/* Subtle side glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-32 w-[300px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>
          {expanded ? (
            <span className="text-white font-semibold text-lg">CRM</span>
          ) : (
            <span className="text-white font-bold text-lg">C</span>
          )}
        </div>
  
        <div className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
  
          {menuItems.map((item, index) => (
            <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white/5 text-white border border-white/10"
                  : "hover:bg-white/5 hover:text-white"
              }`
            }
          >
              <item.icon size={20} />
              {expanded && <span className="text-sm">{item.name}</span>}
            </NavLink>
          ))}
  
          {/* {expanded && (
            <div className="pt-6 text-xs uppercase text-gray-600 px-3">
              Database
            </div>
          )} 
  
          {databaseItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 hover:text-white transition"
            >
              <item.icon size={20} />
              {expanded && <span className="text-sm">{item.name}</span>}
            </NavLink>
          ))} */}
        </div>
  
        <div className="px-2 pb-6 space-y-2 border-t border-neutral-800 pt-4">
  {bottomItems.map((item, index) => (
    <NavLink
      key={index}
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
          isActive
            ? "text-white"
            : "text-slate-400 hover:text-white"
        }`
      }
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