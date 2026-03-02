import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import Input from "../components/ui/Input";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Helpers ─────────────────────────────
const user = JSON.parse(localStorage.getItem("user"));

const formatCurrency = (val) => {
  const n = parseFloat(val) || 0;
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusConfig = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
  completed: { label: "Completed", color: "text-violet-400", bg: "bg-violet-400/10", dot: "bg-violet-400" },
  "on-hold": { label: "On Hold", color: "text-amber-400", bg: "bg-amber-400/10", dot: "bg-amber-400" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { label: status, color: "text-slate-400", bg: "bg-slate-400/10", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all duration-200";

const selectCls =
  "px-2 py-1.5 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all duration-200 appearance-none";

// ─── Stat Card ─────────────────────────
function StatCard({ label, value, Icon, color, accent }) {
  return (
    <div className={`bg-[#0d1117] border border-white/[0.07] rounded-xl px-5 py-5 flex items-center justify-between shadow-xl shadow-black/20`}>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center`}>
        <Icon className={color} sx={{ fontSize: 20 }} />
      </div>
    </div>
  );
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [form, setForm] = useState({
    name: "",
    client_id: "",
    total_amount: "",
    start_date: "",
    deadline: "",
  });

  const handleEdit = (project) => {
    setEditingId(Number(project.id));
    setEditData({
      name: project.name,
      status: project.status,
      deadline: project.deadline?.split("T")[0],
    });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/projects/${id}`, editData);
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects?search=${search}&page=${page}&limit=10`);
      setProjects(res.data.projects || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
      setTotalActive(res.data.totalActive);
      setTotalCompleted(res.data.totalCompleted);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.client_id || !form.total_amount || !form.start_date || !form.deadline) return;
    setSubmitting(true);
    try {
      await api.post("/projects", { ...form, total_amount: Number(form.total_amount) });
      dialogRef.current?.close();
      setForm({ name: "", client_id: "", total_amount: "", start_date: "", deadline: "" });
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue = projects.reduce((sum, p) => sum + (parseFloat(p.total_paid) || 0), 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#080c12] p-6 text-white">

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
            <p className="text-xs text-slate-500 mt-1">{totalCount} total projects</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                sx={{ fontSize: 14 }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="bg-[#0d1117] border border-white/[0.07] rounded-lg text-slate-300 text-sm pl-9 pr-4 py-2 w-56 focus:outline-none focus:border-indigo-500/40 transition-all duration-200 placeholder-slate-600"
              />
            </div>

            <button
              onClick={() => dialogRef.current?.showModal()}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <StatCard label="Total Projects" value={totalCount} Icon={WorkOutlineIcon} color="text-blue-400" accent="bg-blue-400/10" />
          <StatCard label="Active" value={totalActive} Icon={CheckCircleOutlineIcon} color="text-emerald-400" accent="bg-emerald-400/10" />
          <StatCard label="Completed" value={totalCompleted} Icon={TaskAltIcon} color="text-violet-400" accent="bg-violet-400/10" />
          <StatCard label="Total Revenue" value={`₹${formatCurrency(totalRevenue)}`} Icon={CurrencyRupeeIcon} color="text-amber-400" accent="bg-amber-400/10" />
        </div>

        {/* ── Table ── */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl overflow-hidden shadow-xl shadow-black/30">
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader className="[&_tr:hover]:bg-transparent">
                <TableRow className="border-b border-white/[0.07]">
                  {["Project", "Client", "Total", "Remaining", "Deadline", "Status", "Action"].map((h) => (
                    <TableHead
                      key={h}
                      className={`px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-widest bg-white/[0.02] ${h === "Action" ? "text-right" : ""}`}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    className="border-t border-white/[0.05] hover:bg-white/[0.025] cursor-pointer transition-colors duration-150"
                  >
                    {/* Name */}
                    <TableCell className="px-5 py-3.5 font-medium text-white">
                      {editingId == project.id ? (
                        <input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500/50 w-full"
                        />
                      ) : (
                        <span
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="cursor-pointer hover:text-indigo-400 transition-colors duration-150"
                        >
                          {project.name}
                        </span>
                      )}
                    </TableCell>

                    {/* Client */}
                    <TableCell className="px-5 py-3.5 text-slate-400 text-sm">
                      {project.client_name || "—"}
                    </TableCell>

                    {/* Total */}
                    <TableCell className="px-5 py-3.5 text-emerald-400 font-semibold text-sm">
                      ₹{formatCurrency(project.total_amount)}
                    </TableCell>

                    {/* Remaining */}
                    <TableCell className="px-5 py-3.5 text-amber-400 font-semibold text-sm">
                      ₹{formatCurrency(project.remaining_amount)}
                    </TableCell>

                    {/* Deadline */}
                    <TableCell className="px-5 py-3.5 text-slate-400 text-sm">
                      {editingId == project.id ? (
                        <input
                          type="date"
                          value={editData.deadline}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                          className="bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500/50"
                        />
                      ) : (
                        formatDate(project.deadline)
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-5 py-3.5">
                      {editingId == project.id ? (
                        <select
                          value={editData.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          className={selectCls}
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      ) : (
                        <StatusBadge status={project.status} />
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-3.5 text-right">
                      {(user?.role === "admin" || user?.role === "employee") && (
                        <>
                          {editingId == project.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpdate(project.id); }}
                                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-2.5 py-1 rounded-lg transition-all duration-150"
                              >
                                Save
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                                className="text-xs text-slate-500 hover:text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg transition-all duration-150"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                                className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-2.5 py-1 rounded-lg transition-all duration-150"
                              >
                                Edit
                              </button>
                              {user?.role === "admin" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                                  className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2.5 py-1 rounded-lg transition-all duration-150"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && projects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-slate-600">
                      <div className="flex flex-col items-center gap-2">
                        <WorkOutlineIcon sx={{ fontSize: 32 }} className="text-slate-700" />
                        <span className="text-sm">No projects yet</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Loading projects...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Pagination ── */}
        <div className="flex justify-between items-center mt-5">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            ← Previous
          </button>

          <span className="text-xs text-slate-500">
            Page <span className="text-slate-300 font-medium">{page}</span> of{" "}
            <span className="text-slate-300 font-medium">{totalPages}</span>
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next →
          </button>
        </div>

        {/* ── Create Dialog ── */}
        <dialog
          ref={dialogRef}
          className="rounded-2xl bg-[#0d1117] text-white p-7 w-full max-w-lg border border-white/[0.08] shadow-2xl shadow-black/60 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">Create New Project</h2>
              <p className="text-xs text-slate-500 mt-1">Fill in the details to get started</p>
            </div>

            <div className="h-px bg-white/[0.06] mb-4" />

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Project Name *</label>
                <input
                  placeholder="e.g. E-commerce Redesign"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Client ID *</label>
                <input
                  placeholder="Client ID"
                  type="number"
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Total Amount (₹) *</label>
                <input
                  placeholder="e.g. 150000"
                  type="number"
                  value={form.total_amount}
                  onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Start Date *</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Deadline *</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06] mt-5">
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : "Create Project"}
              </button>
            </div>
          </form>
        </dialog>

      </div>
    </DashboardLayout>
  );
}

export default Projects;