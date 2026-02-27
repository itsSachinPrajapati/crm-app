import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import Modal from "../components/Modal";
import { Button } from "@/components/ui/button";
import Input from "../components/ui/Input";
import api from "../services/api";

import GroupsOutlined from "@mui/icons-material/GroupsOutlined";

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
} from "@/components/ui/alert-dialog"

// ─── Helpers ────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const avatarColors = [
  "bg-violet-600",
  "bg-indigo-600",
  "bg-sky-600",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-pink-600",
  "bg-teal-600",
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
  {
    key: "totalClients",
    label: "Total Clients",
    Icon: GroupsIcon,
    iconCls: "text-blue-400",
    bgCls: "bg-blue-400/10",
  },
  {
    key: "activeClients",
    label: "Active Clients",
    Icon: CheckCircleOutlineIcon,
    iconCls: "text-emerald-400",
    bgCls: "bg-emerald-400/10",
  },
  {
    key: "inactiveClients",
    label: "Inactive Clients",
    Icon: PauseCircleOutlineIcon,
    iconCls: "text-amber-400",
    bgCls: "bg-amber-400/10",
  },
  {
    key: "activeProjects",
    label: "Active Projects",
    Icon: WorkOutlineIcon,
    iconCls: "text-violet-400",
    bgCls: "bg-violet-400/10",
  },
  {
    key: "completeProject",
    label: "Completed Projects",
    Icon: TaskAltIcon,
    iconCls: "text-rose-400",
    bgCls: "bg-rose-400/10",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-700/50 text-neutral-400 border border-neutral-700">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 inline-block" />
      Inactive
    </span>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-20 text-center">
        <p className="text-neutral-400 font-medium">No clients yet</p>
      </td>
    </tr>
  );
}

function LoadingRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-t border-neutral-800">
      {Array.from({ length: 7 }).map((__, j) => (
        <td key={j} className="px-6 py-4">
          <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  ));
}

// ─── Main Component ──────────────────────────────────────────────────────────

function Clients() {
  const [clients, setClients] = useState([]);
  const [visible, setVisible] = useState(10);

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null); // "delete" | "update"
  const [selectedClient, setSelectedClient] = useState(null);

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

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/clients", form);
      setOpen(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        contact_person: "",
        total_value: "",
        status: "active",
      });
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
  
        setClients((prev) =>
          prev.filter((c) => c.id !== selectedClient.id)
        );
      }
  
      if (dialogType === "update") {
        // Open your edit modal OR call update API
        openEditModal(selectedClient);
      }
  
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue = clients.reduce(
    (sum, c) => sum + (parseFloat(c.total_value) || 0),
    0
  );
  const activeClients = clients.filter(
  (c) => c.status === "active"
).length;

const inactiveClients = clients.filter(
  (c) => c.status === "inactive"
).length;

const activeProjects = clients.filter(
  (c) => c.project_status === "active"
).length;

const completeProject = clients.filter(
  (c) => c.project_status === "completed"
).length;

  const stats = {
    totalClients: clients.length,
    activeClients,
    inactiveClients,
    activeProjects,
    completeProject
  };

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Clients
        </h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-sm text-white placeholder-neutral-700 rounded-xl px-10 py-2 focus:outline-none focus:border-neutral-600 w-56"
          />

          <Button onClick={() => setOpen(true)}>+ Add Client</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {STAT_CARDS.map(({ key, label, Icon, iconCls, bgCls }) => (
          <div
            key={key}
            className="bg-[#0c1320] border border-white/5 rounded-2xl px-6 py-6 flex items-center justify-between /10 transition-all duration-300"
          >
            {/* LEFT */}
            <div className="flex flex-col">
              <p className="text-xs text-slate-500 mb-1 tracking-wide">
                {label}
              </p>

              <p className="text-3xl font-semibold text-white tracking-tight leading-none">
                {stats[key] ?? 0}
              </p>
            </div>

            {/* RIGHT ICON */}
            <div className={`w-10 h-10 rounded-xl ${bgCls} flex items-center justify-center`}>
              <Icon className={iconCls} sx={{ fontSize: 18 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0c1320] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="w-full overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader className="[&_tr:hover]:bg-transparent">
              <TableRow className="bg-white/5 text-slate-400 uppercase text-xs tracking-wider">
                <TableHead className="px-6 py-4">Company Name</TableHead>
                <TableHead className="px-6 py-4">Contact (Email)</TableHead>
                <TableHead className="px-6 py-4">Phone</TableHead>
                <TableHead className="px-6 py-4">Total Value</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
                <TableHead className="px-6 py-4">Created</TableHead>
                
                <TableHead className="px-6 py-4">Decision</TableHead>
                <TableHead className="px-6 py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.slice(0, visible).map((client) => (
                <TableRow
                  key={client.id}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(
                          client.name
                        )}`}
                      >
                        {getInitials(client.name)}
                      </div>

                      <div>
                        <p className="text-white font-medium leading-tight">
                          {client.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-400">
                    {client.email || "—"}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-400">
                    {client.phone || "—"}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <span className="text-emerald-400 font-semibold">
                      ₹{formatCurrency(client.total_value)}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <StatusBadge
                      active={!client.status || client.status === "active"}
                    />
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-500 text-xs">
                    {formatDate(client.created_at)}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-slate-500 text-xs">
                    {(client.decision)}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right space-x-3">
                    {/* <button
                      onClick={() => {
                        setSelectedClient(client);
                        setDialogType("update");
                        setDialogOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Update
                    </button> */}

                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setDialogType("delete");
                        setDialogOpen(true);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>

                  </TableCell>
                  <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <AlertDialogContent className="bg-[#0f1623] border border-white/10 text-white">

                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {dialogType === "delete"
                            ? "Delete Client?"
                            : "Update Client?"}
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-slate-400">
                          {dialogType === "delete"
                            ? `Are you sure you want to delete ${selectedClient?.name}? This action cannot be undone.`
                            : `Are you sure you want to update ${selectedClient?.name}?`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border border-white/10 text-slate-300">
                          Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                          onClick={handleDialogConfirm}
                          className={
                            dialogType === "delete"
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-blue-500 hover:bg-blue-600"
                          }
                        >
                          {dialogType === "delete" ? "Delete" : "Confirm"}
                        </AlertDialogAction>
                      </AlertDialogFooter>

                    </AlertDialogContent>
                  </AlertDialog>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {visible < filtered.length && (
      <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            className="border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            onClick={() => setVisible((v) => v + 5)}
          >
            Load More
          </Button>
        </div>
      )}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add New Client"
      >
        <div className="space-y-4">
          <Input
            placeholder="Company Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Contact Person"
            value={form.contact_person}
            onChange={(e) =>
              setForm({ ...form, contact_person: e.target.value })
            }
          />
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            placeholder="Total Project Value (₹)"
            value={form.total_value}
            onChange={(e) =>
              setForm({ ...form, total_value: e.target.value })
            }
          />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim()}
          >
            {submitting ? "Saving..." : "Save Client"}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default Clients;