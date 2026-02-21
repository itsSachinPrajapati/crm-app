import { Search, User } from "lucide-react";

function TopHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      
      <h1 className="text-2xl font-semibold text-white">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search..."
            className="bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-neutral-700"
          />
        </div>

        <div className="w-9 h-9 bg-neutral-800 rounded-full flex items-center justify-center">
          <User size={16} />
        </div>

      </div>
    </div>
  );
}

export default TopHeader;