
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../services/api";
import DashboardLayout from "../layout/DashboardLayout";
import { PieChart, Pie,Cell } from "recharts";


// ─── constants ────────────────────────────────────────────────────────────────

const PIPELINE_META = {
  new:        { color: "#60a5fa", label: "New" },
  contacted:  { color: "#a78bfa", label: "Contacted" },
  qualified:  { color: "#34d399", label: "Qualified" },
  closed:     { color: "#fb923c", label: "Closed" },
  lost:       { color: "#f87171", label: "Lost" },
};

const STATUS_BADGE = {
  active:      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  "in progress":"bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "on hold":   "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  completed:   "bg-violet-500/20 text-violet-400 border border-violet-500/30",
  new:         "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  contacted:   "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  qualified:   "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  closed:      "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  lost:        "bg-red-500/20 text-red-400 border border-red-500/30",
};

// ─── pure helpers (no re-creation on render) ──────────────────────────────────



function fmtINR(n) {
  return new Intl.NumberFormat("en-IN").format(Number(n));
}

function fmtMonth(ym) {
  const [y, m] = ym.split("-");
  return new Date(y, m - 1).toLocaleString("en", { month: "short" });
}


// ─── tiny sub-components (memo so they don't re-render unless props change) ───

const StatusBadge = memo(({ status }) => {
  const key = status?.toLowerCase();
  const cls = STATUS_BADGE[key] || "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  const label = PIPELINE_META[key]?.label || (key ? key.charAt(0).toUpperCase() + key.slice(1) : "—");
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
});

// ─── Revenue chart ─────────────────────────────────────────────────────────────

const RevenueChart = memo(({ revenueOverview }) => {
  const chartData = useMemo(
    () =>
      revenueOverview.map((r) => ({
        month: fmtMonth(r.month),
        revenue: Number(r.total),
      })),
    [revenueOverview]
  );

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#94a3b8" }}
          itemStyle={{ color: "#60a5fa" }}
          formatter={(v) => [`₹ ${fmtINR(v)}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#revGrad)"
          dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#60a5fa" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = memo(({ icon, label, value, sub, accent, extra }) => (
  <div className="bg-[#0f1929] rounded-xl p-5 flex flex-col gap-1 border border-slate-800 hover:border-slate-700 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-base ${accent}`}>{icon}</span>
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      {extra}
    </div>
    <div className="text-4xl font-bold text-white mt-1 tracking-tight">{value}</div>
    <div className="text-slate-500 text-xs">{sub}</div>
  </div>
));

// ─── Section card wrapper ──────────────────────────────────────────────────────

const Card = memo(({ children, className = "" }) => (
  <div className={`bg-[#0f1929] rounded-xl border border-slate-800 p-3 ${className}`}>
    {children}
  </div>
));

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const DashboardContent = memo(({ data }) => {
  const {
    summary,
    revenueOverview,
    topClients,
    overdueProjects,
    upcomingProjects,
    monthServiceDistribution
  } = data;


  function formatGrowth(growth) {
    const sign = growth > 0 ? "+" : "";
    return `${sign}${growth}% vs previous month`;
  }
  
  function growthStyles(growth) {
    if (growth > 0) {
      return "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]";
    }
    if (growth < 0) {
      return "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]";
    }
    return "text-slate-400";
  }
  
  function growthIcon(growth) {
    if (growth > 0) return "▲";
    if (growth < 0) return "▼";
    return "•";
  }

  const ServiceDonut = memo(({ data }) => {

    const COLORS = [
      "#3b82f6",
      "#8b5cf6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
    ];
  
        const cleaned = data
      .filter(item => item.service_type) // remove null
      .map(item => ({
        name: item.service_type,
        value: Number(item.total_revenue),
      }))
      .sort((a, b) => b.value - a.value);

    // 🔹 Take top 5
    const topFive = cleaned.slice(0, 5);

    // 🔹 Sum remaining as "Others"
    const others = cleaned.slice(5);
    const othersTotal = others.reduce((sum, item) => sum + item.value, 0);

    // 🔹 Final data
    let finalData = [...topFive];

    if (othersTotal > 0) {
      finalData.push({
        name: "Others",
        value: othersTotal,
      });
    }

    // 🔹 Add colors
    const formatted = finalData.map((item, index) => ({
      ...item,
      fill: COLORS[index % COLORS.length],
    }));
    
    const totalRevenue = formatted.reduce(
      (sum, item) => sum + item.value,
      0
    );
  
    return (
      <div className="flex items-center gap-6">
        
        {/* Donut */}
        <div className="w-[180px] h-[180px]">
          <ResponsiveContainer>
          <PieChart>

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percent = (
                  (data.value / totalRevenue) *
                  100
                ).toFixed(1);

                return (
                  <div className="bg-[#0b1220] border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-slate-300 text-xs font-medium">
                      {data.name}
                    </p>
                    <p className="text-white text-sm font-semibold">
                      ₹ {fmtINR(data.value)} ({percent}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

            <Pie
              data={formatted}
              dataKey="value"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              isAnimationActive={false}
            >
                {formatted.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
  
        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1">
          {formatted.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.fill }}
                />
                <span className="text-slate-300 text-sm truncate">
                  {item.name}
                </span>
              </div>
             
            </div>
          ))}
        </div>
  
      </div>
    );
  });

  return (
    <DashboardLayout>
      <div className="px-6 py-6 space-y-10">
        {/* ── Dashboard Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Overview of business performance
            </p>
          </div>
        </div>

          {/* ── TOP STAT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

          <StatCard
            icon="👤"
            label="Last Month Leads"
            value={summary.monthLeads}
            sub={
              <span className={`${growthStyles(summary.monthLeadsGrowth)} flex items-center gap-1`}>
                {growthIcon(summary.monthLeadsGrowth)}
                {formatGrowth(summary.monthLeadsGrowth)}
              </span>
            }
            accent="bg-blue-900 text-blue-400"
          />

          <StatCard
            icon="🏢"
            label="Last Month Clients"
            value={summary.monthClients}
            sub={
              <span className={`${growthStyles(summary.monthClientsGrowth)} flex items-center gap-1`}>
                {growthIcon(summary.monthClientsGrowth)}
                {formatGrowth(summary.monthClientsGrowth)}
              </span>
            }
            accent="bg-violet-900 text-violet-400"
          />

          <StatCard
            icon="📁"
            label="Active Projects"
            value={summary.activeProjects}
            sub={`${summary.completedProjects} completed`}
            accent="bg-emerald-900 text-emerald-400"
          />

          <StatCard
            icon="₹"
            label="Last Month Revenue"
            value={`₹ ${fmtINR(summary.monthRevenue)}`}
            sub={
              <span className={`${growthStyles(summary.monthRevenueGrowth)} flex items-center gap-1`}>
                {growthIcon(summary.monthRevenueGrowth)}
                {formatGrowth(summary.monthRevenueGrowth)}
              </span>
            }
            accent="bg-amber-900 text-amber-400"
          />

          </div>

        {/* ── MID ROW: Pipeline + Revenue ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 items-stretch">

         {/* Service Distribution — 1/3 */}
            <div className="flex">
              <Card className="flex flex-col w-full h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-semibold text-sm">
                      Service Revenue Distribution
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Revenue split by service type
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
                    <span className="text-slate-400 text-xs">₹</span>
                    <span className="text-slate-300 text-xs">
                      Total ₹ {fmtINR(summary.monthRevenue)}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex items-center">
                  <div className="w-full h-[260px] flex items-center">
                    <ServiceDonut data={monthServiceDistribution || []} />
                  </div>
                </div>
              </Card>
            </div>
          {/* Revenue — 2/3 */}
          <div className="lg:col-span-2 flex">
            <Card className="flex flex-col w-full h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold text-sm">
                    Revenue Overview
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Payments collected over time
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">
                    Last 6 months 📅
                  </span>
                  
                </div>
              </div>

              <div className="flex-1">
                <div className="h-[260px]">
                  <RevenueChart revenueOverview={revenueOverview} />
                </div>
              </div>
            </Card>
          </div>

        </div>
          {/* ── INSIGHT ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 items-stretch">

          {/* 🥇 Top Paying Clients */}
          <Card className="bg-gradient-to-br from-[#0f1929] to-[#0c1624]">
            <h2 className="text-white font-semibold text-sm mb-5 tracking-wide">
              Top Paying Clients
            </h2>

            <div className="space-y-6">
              {(topClients || []).map((client, index) => (
                <div
                  key={client.id}
                  className="flex justify-between items-start p-3 rounded-lg hover:bg-slate-800/40 transition"
                >
                  <div className="flex gap-3">
                    <span className="text-slate-500 text-xs w-5 mt-1">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="text-slate-200 text-sm font-medium">
                        {client.name}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {client.total_projects} projects • Since{" "}
                        {new Date(client.client_since).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-emerald-400 text-base font-bold">
                    ₹ {fmtINR(client.total_paid)}
                  </p>
                </div>
              ))}
            </div>
          </Card>


          <Card>
          <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm mb-5 tracking-wide">
              Overdue Projects
            </h2>
            <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
              {overdueProjects?.length || 0}
            </span>
          </div>

          {(overdueProjects || []).length === 0 ? (
            <p className="text-slate-500 text-sm">No overdue projects 🎉</p>
          ) : (
            overdueProjects.map((proj) => {
              const daysOverdue = Math.ceil(
                (new Date() - new Date(proj.deadline)) /
                (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={proj.id}
                  className="flex justify-between items-start py-2 border-b border-slate-800 last:border-0"
                >
                  <div>
                    <p className="text-slate-200 text-sm truncate">
                      {proj.name}
                    </p>
                    <p className="text-red-400 text-xs">
                      {daysOverdue} days overdue
                    </p>
                  </div>
                  <StatusBadge status={proj.status} />
                </div>
              );
            })
          )}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-sm mb-5 tracking-wide">
              Due in Next 7 Days
            </h2>
            <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">
              {upcomingProjects?.length || 0}
            </span>
          </div>

          {(upcomingProjects || []).length === 0 ? (
            <p className="text-slate-500 text-sm">No upcoming deadlines</p>
          ) : (
            upcomingProjects.map((proj) => {
              const daysLeft = Math.ceil(
                (new Date(proj.deadline) - new Date()) /
                (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={proj.id}
                  className="flex justify-between items-start py-2 border-b border-slate-800 last:border-0"
                >
                  <div>
                    <p className="text-slate-200 text-sm truncate">
                      {proj.name}
                    </p>
                    <p className="text-amber-400 text-xs">
                      {daysLeft} days left
                    </p>
                  </div>
                  <StatusBadge status={proj.status} />
                </div>
              );
            })
          )}
        </Card>



      </div>
    </div>
    </DashboardLayout>
  );
});

// ─── Skeleton loader ───────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-[#0f1929] rounded-xl border border-slate-800 p-5 animate-pulse">
    <div className="h-3 bg-slate-800 rounded w-1/3 mb-3" />
    <div className="h-8 bg-slate-800 rounded w-1/2 mb-2" />
    <div className="h-2 bg-slate-800 rounded w-1/4" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#070f1a] p-5 space-y-5">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-[#0f1929] rounded-xl border border-slate-800 p-5 animate-pulse h-64" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-[#0f1929] rounded-xl border border-slate-800 p-5 animate-pulse h-48" />
      ))}
    </div>
  </div>
);

// ─── Root export — drop inside <DashboardLayout> ───────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Stable fetch — runs once on mount
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/full");
      setData(res.data);
    } catch (err) {
      setError("Failed to load dashboard data.");
    }
  }, []); // empty deps → created once

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error)
    return (
      <div className="min-h-screen bg-[#070f1a] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-700/40 text-red-400 rounded-xl px-6 py-4 text-sm">
          {error}
        </div>
      </div>
    );

  if (!data) return <DashboardSkeleton />;

  return <DashboardContent data={data} />;
  }

