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
    Settings
  } from "lucide-react";
  import { NavLink } from "react-router-dom";
  import { useState } from "react";
  
  function Sidebar() {
    const [expanded, setExpanded] = useState(false);
  
    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Leads", icon: Users, path: "/leads" },
        { name: "Clients", icon: Building2, path: "/clients" },
        { name: "Tasks", icon: CheckSquare, path: "/tasks" },
      ];
  
    const databaseItems = [
      { name: "Analytics", icon: BarChart3, path: "#" },
      { name: "Contacts", icon: Users, path: "/clients" },
      { name: "Companies", icon: Building2, path: "#" },
    ];
  
    const bottomItems = [
      { name: "Settings", icon: Settings, path: "#" }
    ];
  
    return (
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`h-screen bg-neutral-950 border-r border-neutral-800 text-gray-400 transition-all duration-300 ${
          expanded ? "w-64" : "w-20"
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-neutral-800">
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
                    ? "bg-neutral-800 text-white"
                    : "hover:bg-neutral-800 hover:text-white"
                }`
              }
            >
              <item.icon size={20} />
              {expanded && <span className="text-sm">{item.name}</span>}
            </NavLink>
          ))}
  
          {expanded && (
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
          ))}
        </div>
  
        <div className="px-2 pb-6 space-y-2 border-t border-neutral-800 pt-4">
          {bottomItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 hover:text-white transition"
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