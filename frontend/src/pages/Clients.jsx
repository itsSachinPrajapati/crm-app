import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import Modal from "../components/Modal";
import { Button } from "@/components/ui/button";
import Input from "../components/ui/Input";
import api from "../services/api";
import SearchIcon from "@mui/icons-material/Search";

import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const avatarColors = [
  "from-violet-500 to-purple-700",
  "from-indigo-500 to-blue-700",
  "from-sky-500 to-cyan-700",
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-red-700",
  "from-amber-500 to-orange-700",
  "from-pink-500 to-fuchsia-700",
  "from-teal-500 to-green-700",
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

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

const STAT_CARDS = [
  { key: "totalClients", label: "Total Clients", Icon: GroupsIcon, iconCls: "text-blue-400", bgCls: "bg-blue-400/10" },
  { key: "activeClients", label: "Active Clients", Icon: CheckCircleOutlineIcon, iconCls: "text-emerald-400", bgCls: "bg-emerald-400/10" },
  { key: "inactiveClients", label: "Inactive Clients", Icon: PauseCircleOutlineIcon, iconCls: "text-amber-400", bgCls: "bg-amber-400/10" },
  { key: "activeProjects", label: "Active Projects", Icon: WorkOutlineIcon, iconCls: "text-violet-400", bgCls: "bg-violet-400/10" },
  { key: "completeProject", label: "Completed", Icon: TaskAltIcon, iconCls: "text-rose-400", bgCls: "bg-rose-400/10" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-400/10 text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Inactive
    </span>
  );
}

function LoadingRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i} className="border-t border-white/[0.05]">
      {Array.from({ length: 8 }).map((__, j) => (
        <TableCell key={j} className="px-5 py-4">
          <div className="h-3.5 bg-white/[0.05] rounded animate-pulse w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

const editInputCls =
  "bg-white/[0.04] border border-white/10 text-white px-2.5 py-1.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 transition-all duration-200 w-full";

const modalInputCls =
  "w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all duration-200";

// ─── Main Component ───────────────────────────────────────────────────────────

function Clients() {
  const [clients, setClients] = useState([]);
  const [visible, setVisible] = useState(10);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [user, setUser] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    contact_person: "",
    total_value: "",
    status: "active",
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clients");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setClients(data);
    } catch (err) {
      console.error(err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchUser();
  }, []);

  useEffect(() => {
    console.log("Logged in user:", user);
  }, [user]);

  const handleInlineSave = async (id) => {
    try {
      await api.put(`/clients/${id}`, editForm);
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...editForm } : c)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/clients", form);
      setOpen(false);
      setForm({ name: "", email: "", phone: "", contact_person: "", total_value: "", status: "active" });
      fetchClients();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogConfirm = async () => {
    if (!selectedClient) return;
    try {
      if (dialogType === "delete") {
        await api.delete(`/clients/${selectedClient.id}`);
        setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));
      }
      if (dialogType === "update") {
        openEditModal(selectedClient);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const isChanged = (client) =>
    client.name !== editForm.name ||
    client.email !== editForm.email ||
    client.phone !== editForm.phone ||
    String(client.total_value) !== String(editForm.total_value);

  const activeClients = clients.filter((c) => c.status === "active").length;
  const inactiveClients = clients.filter((c) => c.status === "inactive").length;
  const activeProjects = clients.reduce((sum, c) => sum + (c.active_projects || 0), 0);
  const completeProject = clients.reduce((sum, c) => sum + (c.completed_projects || 0), 0);

  const stats = {
    totalClients: clients.length,
    activeClients,
    inactiveClients,
    activeProjects,
    completeProject,
  };

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#080c12] p-6 text-white">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Clients</h1>
            <p className="text-xs text-slate-500 mt-1">{clients.length} total clients</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                sx={{ fontSize: 14 }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="bg-[#0d1117] border border-white/[0.07] rounded-lg text-slate-300 text-sm pl-9 pr-4 py-2 w-56 focus:outline-none focus:border-indigo-500/40 transition-all duration-200 placeholder-slate-600"
              />
            </div>

            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200"
            >
              + Add Client
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-7">
          {STAT_CARDS.map(({ key, label, Icon, iconCls, bgCls }) => (
            <div
              key={key}
              className="bg-[#0d1117] border border-white/[0.07] rounded-xl px-5 py-5 flex items-center justify-between shadow-xl shadow-black/20"
            >
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
                <p className="text-2xl font-bold text-white">{stats[key] ?? 0}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${bgCls} flex items-center justify-center`}>
                <Icon className={iconCls} sx={{ fontSize: 20 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl overflow-hidden shadow-xl shadow-black/30">
          <div className="w-full overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader className="[&_tr:hover]:bg-transparent">
                <TableRow className="border-b border-white/[0.07]">
                  {["Company", "Email", "Phone", "Total Value", "Status", "Created", "Decision", "Actions"].map((h) => (
                    <TableHead
                      key={h}
                      className={`px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-widest bg-white/[0.02] ${h === "Actions" ? "text-right" : ""}`}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <LoadingRows />
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <GroupsIcon sx={{ fontSize: 32 }} className="text-slate-700" />
                        <span className="text-sm text-slate-600">No clients yet</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.slice(0, visible).map((client) => (
                    <TableRow
                      key={client.id}
                      className="border-t border-white/[0.05] hover:bg-white/[0.025] transition-colors duration-150"
                    >
                      {/* Company Name */}
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br flex-shrink-0 ${getAvatarColor(client.name)}`}>
                            {getInitials(client.name)}
                          </div>
                          {editingId === client.id ? (
                            <input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className={editInputCls}
                            />
                          ) : (
                            <span className="text-white font-medium">{client.name}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="px-5 py-3.5 text-slate-400 text-sm">
                        {editingId === client.id ? (
                          <input
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className={editInputCls}
                          />
                        ) : (
                          client.email || "—"
                        )}
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="px-5 py-3.5 text-slate-400 text-sm">
                        {editingId === client.id ? (
                          <input
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className={editInputCls}
                          />
                        ) : (
                          client.phone || "—"
                        )}
                      </TableCell>

                      {/* Total Value */}
                      <TableCell className="px-5 py-3.5">
                        {editingId === client.id ? (
                          <input
                            value={editForm.total_value}
                            onChange={(e) => setEditForm({ ...editForm, total_value: e.target.value })}
                            className={`${editInputCls} w-28`}
                          />
                        ) : (
                          <span className="text-emerald-400 font-semibold">
                            ₹{formatCurrency(client.total_value)}
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-5 py-3.5">
                        <StatusBadge active={!client.status || client.status === "active"} />
                      </TableCell>

                      {/* Created */}
                      <TableCell className="px-5 py-3.5 text-slate-500 text-xs">
                        {formatDate(client.created_at)}
                      </TableCell>

                      {/* Decision */}
                      <TableCell className="px-5 py-3.5 text-slate-500 text-xs">
                        {client.decision || "—"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === client.id ? (
                            <>
                              <button
                                onClick={() => handleInlineSave(client.id)}
                                disabled={!isChanged(client)}
                                className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-150 ${
                                  isChanged(client)
                                    ? "text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20"
                                    : "text-slate-600 bg-white/[0.03] cursor-not-allowed"
                                }`}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-xs font-medium text-slate-500 hover:text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg transition-all duration-150"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(client.id);
                                  setEditForm({
                                    name: client.name,
                                    email: client.email,
                                    phone: client.phone,
                                    total_value: client.total_value,
                                  });
                                }}
                                className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-2.5 py-1 rounded-lg transition-all duration-150"
                              >
                                Edit
                              </button>

                              {user?.role === "admin" && (
                                <button
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setDialogType("delete");
                                    setDialogOpen(true);
                                  }}
                                  className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-2.5 py-1 rounded-lg transition-all duration-150"
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Load More ── */}
        {visible < filtered.length && (
          <div className="flex justify-center mt-5">
            <button
              onClick={() => setVisible((v) => v + 5)}
              className="px-5 py-2 text-sm text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] rounded-lg transition-all duration-200"
            >
              Load more ({filtered.length - visible} remaining)
            </button>
          </div>
        )}

        {/* ── Add Client Modal ── */}
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Add New Client">
          <div className="space-y-3">
            {[
              { placeholder: "Company Name *", key: "name" },
              { placeholder: "Email", key: "email" },
              { placeholder: "Contact Person", key: "contact_person" },
              { placeholder: "Phone", key: "phone" },
              { placeholder: "Total Project Value (₹)", key: "total_value" },
            ].map(({ placeholder, key }) => (
              <div key={key}>
                <input
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={modalInputCls}
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
              className="w-full py-2.5 mt-1 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : "Create Client"}
            </button>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}

export default Clients;