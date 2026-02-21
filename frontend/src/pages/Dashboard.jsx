import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import StatCard from "../components/StatCard";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    leads: 0,
    clients: 0,
    revenue: 0,
    openTasks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>

      <div className="mb-10">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Live overview of your CRM
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Leads" value={stats.leads} change="" />
        <StatCard title="Clients" value={stats.clients} change="" />
        <StatCard title="Open Tasks" value={stats.openTasks} change="" />
        <StatCard title="Revenue" value={`₹${stats.revenue}`} change="" />
      </div>

    </DashboardLayout>
  );
}

export default Dashboard;