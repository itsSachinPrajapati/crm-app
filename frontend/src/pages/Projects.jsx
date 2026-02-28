import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import Input from "../components/ui/Input";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

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

const formatCurrency = (val) => {
  const n = parseFloat(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(n);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    client_id: "",
    total_amount: "",
    start_date: "",
    deadline: "",
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.client_id ||
      !form.total_amount ||
      !form.start_date ||
      !form.deadline
    )
      return;

    setSubmitting(true);
    try {
      await api.post("/projects", {
        ...form,
        total_amount: Number(form.total_amount),
      });

      dialogRef.current?.close();

      setForm({
        name: "",
        client_id: "",
        total_amount: "",
        start_date: "",
        deadline: "",
      });

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

  // ─── Stats ─────────────────────────────

  const totalProjects = projects.length;

  const activeProjects = projects.filter(
    (p) => p.status === "active"
  ).length;

  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;

  const totalRevenue = projects.reduce(
    (sum, p) => sum + (parseFloat(p.total_paid) || 0),
    0
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">
          Projects
        </h1>
        <Button onClick={() => dialogRef.current?.showModal()}>
          + Add Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          Icon={WorkOutlineIcon}
          color="text-blue-400"
        />
        <StatCard
          label="Active"
          value={activeProjects}
          Icon={CheckCircleOutlineIcon}
          color="text-emerald-400"
        />
        <StatCard
          label="Completed"
          value={completedProjects}
          Icon={TaskAltIcon}
          color="text-violet-400"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${formatCurrency(totalRevenue)}`}
          Icon={CurrencyRupeeIcon}
          color="text-amber-400"
        />
      </div>

      {/* Table */}
      <div className="border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5 text-slate-400 uppercase text-xs">
                <TableHead className="px-6 py-4">Project</TableHead>
                <TableHead className="px-6 py-4">Client</TableHead>
                <TableHead className="px-6 py-4">Total</TableHead>
                <TableHead className="px-6 py-4">Paid</TableHead>
                <TableHead className="px-6 py-4">Remaining</TableHead>
                <TableHead className="px-6 py-4">Deadline</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
                <TableHead className="px-6 py-4 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  onClick={() =>
                    navigate(`/projects/${project.id}`)
                  }
                  className="border-t border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <TableCell className="px-6 py-4 text-white font-medium">
                    {project.name}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-400">
                    {project.client_name || "—"}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-emerald-400 font-semibold">
                    ₹{formatCurrency(project.total_amount)}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                   ₹{formatCurrency(project.total_paid)}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-amber-400 font-semibold">
                    ₹{formatCurrency(project.remaining_amount)}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-400">
                    {formatDate(project.deadline)}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-400">
                    {project.status}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && projects.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-16 text-slate-400"
                  >
                    No projects yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Dialog */}
      <dialog
        ref={dialogRef}
        className="rounded-2xl bg-[#0f1623] text-white p-8 w-full max-w-lg border border-white/10"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">
            Create Project
          </h2>

          <Input
            placeholder="Project Name *"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input
            placeholder="Client ID *"
            type="number"
            value={form.client_id}
            onChange={(e) =>
              setForm({
                ...form,
                client_id: e.target.value,
              })
            }
          />

          <Input
            placeholder="Total Amount (₹) *"
            type="number"
            value={form.total_amount}
            onChange={(e) =>
              setForm({
                ...form,
                total_amount: e.target.value,
              })
            }
          />

          <Input
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm({
                ...form,
                start_date: e.target.value,
              })
            }
          />

          <Input
            type="date"
            value={form.deadline}
            onChange={(e) =>
              setForm({
                ...form,
                deadline: e.target.value,
              })
            }
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating..."
                : "Create Project"}
            </Button>
          </div>
        </form>
      </dialog>
    </DashboardLayout>
  );
}

// ─── Stat Card ─────────────────────────

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="bg-[#0c1320] border border-white/5 rounded-2xl px-6 py-6 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 mb-1">
          {label}
        </p>
        <p className="text-2xl font-semibold text-white">
          {value}
        </p>
      </div>

      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        <Icon className={color} sx={{ fontSize: 18 }} />
      </div>
    </div>
  );
}

export default Projects;