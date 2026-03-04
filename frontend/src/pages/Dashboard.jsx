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
import { PieChart, Pie, Cell } from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const PIPELINE_META = {
  new:        { color: "#60a5fa", label: "New" },
  contacted:  { color: "#a78bfa", label: "Contacted" },
  qualified:  { color: "#34d399", label: "Qualified" },
  closed:     { color: "#fb923c", label: "Closed" },
  lost:       { color: "#f87171", label: "Lost" },
};

const STATUS_BADGE = {
  active:       "bg-emerald-400/10 text-emerald-400",
  "in progress":"bg-blue-400/10 text-blue-400",
  "on hold":    "bg-amber-400/10 text-amber-400",
  completed:    "bg-violet-400/10 text-violet-400",
  new:          "bg-blue-400/10 text-blue-400",
  contacted:    "bg-purple-400/10 text-purple-400",
  qualified:    "bg-emerald-400/10 text-emerald-400",
  closed:       "bg-amber-400/10 text-amber-400",
  lost:         "bg-red-400/10 text-red-400",
};

const STATUS_DOT = {
  active: "bg-emerald-400", "in progress": "bg-blue-400", "on hold": "bg-amber-400",
  completed: "bg-violet-400", new: "bg-blue-400", contacted: "bg-purple-400",
  qualified: "bg-emerald-400", closed: "bg-amber-400", lost: "bg-red-400",
};

function fmtINR(n) {
  return new Intl.NumberFormat("en-IN").format(Number(n));
}

function fmtMonth(ym) {
  const [y, m] = ym.split("-");
  return new Date(y, m - 1).toLocaleString("en", { month: "short" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = memo(({ status }) => {
  const key = status?.toLowerCase();
  const cls = STATUS_BADGE[key] || "bg-slate-400/10 text-slate-400";
  const dot = STATUS_DOT[key] || "bg-slate-400";
  const label = PIPELINE_META[key]?.label || (key ? key.charAt(0).toUpperCase() + key.slice(1) : "—");
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
});

// ─── Revenue Chart ────────────────────────────────────────────────────────────

const RevenueChart = memo(({ revenueOverview }) => {
  const chartData = useMemo(
    () => revenueOverview.map((r) => ({ month: fmtMonth(r.month), revenue: Number(r.total) })),
    [revenueOverview]
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#475569", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip
          contentStyle={{ background: "#0d1117", border: "1px solid #ffffff10", borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: "#64748b" }}
          itemStyle={{ color: "#818cf8" }}
          formatter={(v) => [`₹ ${fmtINR(v)}`, "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#revGrad)"
          dot={{ fill: "#6366f1", r: 3.5, strokeWidth: 0 }}
          activeDot={{ r: 5.5, fill: "#818cf8" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = memo(({ icon, label, value, sub, accent }) => (
  <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-1 shadow-xl shadow-black/20 hover:border-white/[0.12] transition-all duration-200">
    <div className="flex items-center justify-between mb-1">
      <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${accent}`}>{icon}</span>
    </div>
    <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
    <div className="text-slate-600 text-xs mt-0.5">{sub}</div>
  </div>
));

// ─── Card wrapper ─────────────────────────────────────────────────────────────

const Card = memo(({ children, className = "" }) => (
  <div className={`bg-[#0d1117] border border-white/[0.07] rounded-xl p-5 shadow-xl shadow-black/20 ${className}`}>
    {children}
  </div>
));

// ─── Service Donut ────────────────────────────────────────────────────────────

const DONUT_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const ServiceDonut = memo(({ data }) => {
  const cleaned = data
    .filter((item) => item.service_type)
    .map((item) => ({ name: item.service_type, value: Number(item.total_revenue) }))
    .sort((a, b) => b.value - a.value);

  const topFive = cleaned.slice(0, 5);
  const othersTotal = cleaned.slice(5).reduce((sum, item) => sum + item.value, 0);
  let finalData = [...topFive];
  if (othersTotal > 0) finalData.push({ name: "Others", value: othersTotal });
  const formatted = finalData.map((item, i) => ({ ...item, fill: DONUT_COLORS[i % DONUT_COLORS.length] }));
  const totalRevenue = formatted.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex items-center gap-6 w-full">
      <div className="w-[160px] h-[160px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0].payload;
                  const pct = ((d.value / totalRevenue) * 100).toFixed(1);
                  return (
                    <div className="bg-[#0d1117] border border-white/[0.08] rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-slate-400 text-xs">{d.name}</p>
                      <p className="text-white text-sm font-semibold">₹ {fmtINR(d.value)} <span className="text-slate-500 font-normal">({pct}%)</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie data={formatted} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={3} isAnimationActive={false}>
              {formatted.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {formatted.map((item, i) => {
          const pct = totalRevenue ? ((item.value / totalRevenue) * 100).toFixed(1) : 0;
          return (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                <span className="text-slate-400 text-xs truncate">{item.name}</span>
              </div>
              <span className="text-slate-500 text-xs flex-shrink-0">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Growth helpers ───────────────────────────────────────────────────────────

function formatGrowth(growth) {
  const sign = growth > 0 ? "+" : "";
  return `${sign}${growth}% vs last month`;
}

function growthStyles(growth) {
  if (growth > 0) return "text-emerald-400";
  if (growth < 0) return "text-red-400";
  return "text-slate-500";
}

function growthIcon(growth) {
  if (growth > 0) return "▲";
  if (growth < 0) return "▼";
  return "•";
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

const DashboardContent = memo(({ data }) => {
  const { summary, revenueOverview, topClients, overdueProjects, upcomingProjects, monthServiceDistribution } = data;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#080c12] px-6 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Overview of business performance</p>
          </div>
          <div className="text-xs text-slate-600 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-lg">
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="👤"
            label="Last Month Leads"
            value={summary.monthLeads}
            sub={<span className={`${growthStyles(summary.monthLeadsGrowth)} flex items-center gap-1`}>{growthIcon(summary.monthLeadsGrowth)} {formatGrowth(summary.monthLeadsGrowth)}</span>}
            accent="bg-blue-400/10 text-blue-400"
          />
          <StatCard
            icon="🏢"
            label="Last Month Clients"
            value={summary.monthClients}
            sub={<span className={`${growthStyles(summary.monthClientsGrowth)} flex items-center gap-1`}>{growthIcon(summary.monthClientsGrowth)} {formatGrowth(summary.monthClientsGrowth)}</span>}
            accent="bg-violet-400/10 text-violet-400"
          />
          <StatCard
            icon="📁"
            label="Active Projects"
            value={summary.activeProjects}
            sub={<span className="text-slate-600">{summary.completedProjects} completed</span>}
            accent="bg-emerald-400/10 text-emerald-400"
          />
          <StatCard
            icon="₹"
            label="Last Month Revenue"
            value={`₹ ${fmtINR(summary.monthRevenue)}`}
            sub={<span className={`${growthStyles(summary.monthRevenueGrowth)} flex items-center gap-1`}>{growthIcon(summary.monthRevenueGrowth)} {formatGrowth(summary.monthRevenueGrowth)}</span>}
            accent="bg-amber-400/10 text-amber-400"
          />
        </div>

        {/* ── Mid Row: Donut + Revenue Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Service Distribution */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Service Distribution</h2>
                <p className="text-xs text-slate-500 mt-0.5">Revenue split by service</p>
              </div>
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                <span className="text-slate-500 text-xs">Total</span>
                <span className="text-slate-300 text-xs font-medium">₹ {fmtINR(summary.monthRevenue)}</span>
              </div>
            </div>
            <div className="flex-1 flex items-center min-h-[180px]">
              <ServiceDonut data={monthServiceDistribution || []} />
            </div>
          </Card>

          {/* Revenue Chart */}
          <Card className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Revenue Overview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Payments collected over time</p>
              </div>
              <span className="text-xs text-slate-600 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-lg">Last 6 months</span>
            </div>
            <div className="flex-1 min-h-[200px]">
              <RevenueChart revenueOverview={revenueOverview} />
            </div>
          </Card>
        </div>

        {/* ── Bottom Row: Clients + Overdue + Upcoming ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Top Paying Clients */}
          <Card>
            <h2 className="text-sm font-semibold text-white mb-4">Top Paying Clients</h2>
            <div className="space-y-1">
              {(topClients || []).map((client, index) => (
                <div key={client.id} className="flex justify-between items-center px-3 py-2.5 rounded-lg hover:bg-white/[0.025] transition-colors duration-150">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-slate-600 w-4 flex-shrink-0">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">{client.name}</p>
                      <p className="text-xs text-slate-600">
                        {client.total_projects} project{client.total_projects !== 1 ? "s" : ""} · since {new Date(client.client_since).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <p className="text-emerald-400 text-sm font-semibold flex-shrink-0 ml-3">₹ {fmtINR(client.total_value)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Overdue Projects */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Overdue Projects</h2>
              <span className="text-xs bg-red-400/10 text-red-400 px-2 py-0.5 rounded-full font-medium">
                {overdueProjects?.length || 0}
              </span>
            </div>
            {(overdueProjects || []).length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-slate-600">
                <span className="text-2xl">🎉</span>
                <p className="text-xs">No overdue projects</p>
              </div>
            ) : (
              <div className="space-y-0">
                {overdueProjects.map((proj) => {
                  const daysOverdue = Math.ceil((new Date() - new Date(proj.deadline)) / 86400000);
                  return (
                    <div key={proj.id} className="flex justify-between items-center py-2.5 border-b border-white/[0.05] last:border-0">
                      <div className="min-w-0 pr-3">
                        <p className="text-sm text-slate-200 truncate">{proj.name}</p>
                        <p className="text-xs text-red-400 mt-0.5">{daysOverdue}d overdue</p>
                      </div>
                      <StatusBadge status={proj.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Due in Next 7 Days */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Due in 7 Days</h2>
              <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                {upcomingProjects?.length || 0}
              </span>
            </div>
            {(upcomingProjects || []).length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-slate-600">
                <span className="text-2xl">✅</span>
                <p className="text-xs">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-0">
                {upcomingProjects.map((proj) => {
                  const daysLeft = Math.ceil((new Date(proj.deadline) - new Date()) / 86400000);
                  return (
                    <div key={proj.id} className="flex justify-between items-center py-2.5 border-b border-white/[0.05] last:border-0">
                      <div className="min-w-0 pr-3">
                        <p className="text-sm text-slate-200 truncate">{proj.name}</p>
                        <p className="text-xs text-amber-400 mt-0.5">{daysLeft}d left</p>
                      </div>
                      <StatusBadge status={proj.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-5 animate-pulse">
    <div className="h-2.5 bg-white/[0.05] rounded w-1/3 mb-4" />
    <div className="h-8 bg-white/[0.05] rounded w-1/2 mb-3" />
    <div className="h-2 bg-white/[0.05] rounded w-1/4" />
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#080c12] p-6 space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className={`bg-[#0d1117] border border-white/[0.07] rounded-xl p-5 animate-pulse h-64 ${i === 1 ? "lg:col-span-2" : ""}`} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-5 animate-pulse h-52" />
      ))}
    </div>
  </div>
);

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/full");
      setData(res.data);
    } catch (err) {
      setError("Failed to load dashboard data.");
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error)
    return (
      <div className="min-h-screen bg-[#080c12] flex items-center justify-center">
        <div className="bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl px-6 py-4 text-sm">
          {error}
        </div>
      </div>
    );

  if (!data) return <DashboardSkeleton />;

  return <DashboardContent data={data} />;
}