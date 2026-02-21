import { ArrowUpRight } from "lucide-react";

function StatCard({ title, value, change }) {
  return (
    <div className="bg-neutral-900/70 backdrop-blur border border-neutral-800 rounded-2xl p-6 hover:scale-[1.02] hover:border-neutral-700 transition-all duration-300 shadow-sm">

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">{title}</p>
        <ArrowUpRight size={16} className="text-green-500" />
      </div>

      <h2 className="text-3xl font-semibold mt-4 tracking-tight">
        {value}
      </h2>

      <p className="text-xs text-green-500 mt-2">
        {change}
      </p>

    </div>
  );
}

export default StatCard;