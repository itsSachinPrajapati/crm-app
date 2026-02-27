import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../services/api";
import { useRef } from "react";

// MUI Icons only — no MUI components with sx props
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import FiberNewOutlinedIcon from "@mui/icons-material/FiberNewOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// ─── Constants ────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { key: "new",           label: "New",           Icon: FiberNewOutlinedIcon,      iconCls: "text-blue-400",   bgCls: "bg-blue-400/10" },
  { key: "contacted",     label: "Contacted",     Icon: MarkEmailReadOutlinedIcon, iconCls: "text-emerald-400",bgCls: "bg-emerald-400/10" },
  { key: "qualified",     label: "Qualified",     Icon: CheckCircleOutlineIcon,    iconCls: "text-violet-400", bgCls: "bg-violet-400/10" },
  { key: "closed",        label: "Closed",        Icon: AccessTimeIcon,            iconCls: "text-amber-400",  bgCls: "bg-amber-400/10" },
  { key: "proposal sent", label: "Proposal Sent", Icon: SendOutlinedIcon,          iconCls: "text-rose-400",   bgCls: "bg-rose-400/10" },
];

const STATUS_STYLE = {
  new: "text-slate-300",
  contacted: "text-slate-300",
  qualified: "text-slate-300",
  working: "text-slate-300",
  "proposal sent": "text-slate-300",
  closed: "text-slate-400",
};

const STATUS_DOT = {
  new: "bg-slate-500",
  contacted: "bg-slate-500",
  qualified: "bg-slate-500",
  working: "bg-slate-500",
  "proposal sent": "bg-slate-500",
  closed: "bg-slate-600",
};

const FILTER_TABS = ["All", "New", "Contacted", "Qualified", "Working", "Proposal Sent"];
const STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal sent",
  "closed"
];


// ─── Small Components ─────────────────────────────────────────────────────────


function StatusBadge({ status }) {
  const key  = status?.toLowerCase() ?? "";
  const text = STATUS_STYLE[key] ?? "text-slate-400";
  const dot  = STATUS_DOT[key]   ?? "bg-slate-400";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {status}
    </span>
  );
}

function LeadCard({ lead ,onConverted }) {
  const [status, setStatus] = useState(
    lead.status?.toLowerCase() || "new"
  );
  const [notes, setNotes] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const notesEndRef = useRef(null);
  const [editingStatus, setEditingStatus] = useState(false);

  // -------------------------
  // Fetch Notes
  // -------------------------
  const fetchNotes = async () => {
    try {
      const res = await api.get(`/leads/${lead.id}/notes`);
      setNotes(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
  
    const tempNote = {
      id: Date.now(), // temporary id
      note: newNote,
      created_by_name: "You",
      created_at: new Date().toISOString(),
    };
  
    // Optimistic update
    setNotes((prev) => [...prev, tempNote]);
    setNewNote("");
  
    scrollToBottom();
  
    try {
      setAddingNote(true);
  
      await api.post(`/leads/${lead.id}/notes`, {
        note: tempNote.note,
      });
  
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };
  const scrollToBottom = () => {
    setTimeout(() => {
      notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  // -------------------------
  // Fetch Proposals
  // -------------------------
  const fetchProposals = async () => {
    try {
      const res = await api.get(`/leads/${lead.id}/proposals`);
      setProposals(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // Update Status
  // -------------------------
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    if (newStatus === status) return;

    try {
      await api.patch(`/leads/${lead.id}/status`, {
        status: newStatus,
      });

      setStatus(newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvert = async () => {
    try {
      await api.post(`/clients/convert/${lead.id}`);
  
      
      onConverted(lead.id);
  
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteNote = async (id) => {
    const oldNotes = notes;
  
    // Optimistic remove
    setNotes((prev) => prev.filter((n) => n.id !== id));
  
    try {
      await api.delete(`/leads/notes/${id}`);
    } catch (err) {
      console.error(err);
      setNotes(oldNotes); // rollback if failed
    }
  };

  const currentIndex = STATUSES.indexOf(status);

  return (
    <div className="bg-[#0b1220] border border-white/5 rounded-2xl p-4 space-y-5 hover:border-white/10 transition">

      {/* HEADER */}
      {/* HEADER */}
<div className="flex items-start justify-between gap-6">

{/* LEFT */}
<div className="flex-1 min-w-0">
  <h3 className="text-sm font-semibold text-white truncate">
    {lead.name}
  </h3>

  <div className="mt-1 space-y-1 text-sm text-slate-400">
    {lead.email && <div className="truncate">{lead.email}</div>}
    {lead.phone && <div className="truncate">{lead.phone}</div>}
  </div>
</div>

{/* RIGHT */}
<div className="flex-shrink-0 text-right space-y-1 text-sm">

  <div>
    <span className="text-slate-500">Source:</span>{" "}
    <span className="text-slate-300 font-medium">
      {lead.source || "Manual"}
    </span>
  </div>

  <div className="flex justify-end gap-2 text-sm">
  <span className="text-slate-500">Status:</span>

  {editingStatus ? (
    <select
      value={status}
      onChange={(e) => {
        handleStatusChange(e);
        setEditingStatus(false);
      }}
      onBlur={() => setEditingStatus(false)}
      autoFocus
      className="bg-[#141b26] px-2 py-1 rounded-md text-slate-300 text-xs border border-white/10"
    >
      {STATUSES
        .slice(STATUSES.indexOf(status))
        .map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
    </select>
  ) : (
    <span
      onClick={() => setEditingStatus(true)}
      className="text-slate-300 font-medium cursor-pointer hover:text-white"
    >
      {status}
    </span>
  )}
</div>

</div>
</div>

      <div className="border-t border-white/10" />

      {/* ACTIONS */}
      <div className="space-y-4">

        <div className="flex gap-3">

          <Dialog onOpenChange={(open) => open && fetchNotes()}>
            <DialogTrigger asChild>
              <button className="flex-1 px-3 py-1.5 text-xs rounded-md bg-[#141b26] border border-white/10 text-slate-300 hover:bg-white/5 transition">
              View Notes ({notes.length})
              </button>
            </DialogTrigger>

            <DialogContent className="bg-[#0f1623] border border-white/10 text-white rounded-2xl">
              <DialogHeader>
                <DialogTitle>Lead Notes</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">

  {/* Existing Notes */}
  <div className="space-y-3 max-h-60 overflow-y-auto">
  {notes.length ? (
    notes.map((note) => (
      <div
        key={note.id}
        className="bg-[#141b26] p-4 rounded-xl border border-white/5 relative group"
      >
        <p className="text-sm text-slate-200">
          {note.note}
        </p>

        <div className="text-xs text-slate-500 mt-2 flex justify-between">
          <span>By: {note.created_by_name}</span>
          <span>
            {new Date(note.created_at).toLocaleString()}
          </span>
        </div>

        {/* Delete button */}
        <button
          onClick={() => handleDeleteNote(note.id)}
          className="absolute top-2 right-2 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition"
        >
          Delete
        </button>

      </div>
    ))
  ) : (
    <p className="text-sm text-slate-500">
      No notes yet
    </p>
  )}

  <div ref={notesEndRef} />
</div>

  {/* Divider */}
  <div className="border-t border-white/10 pt-4 space-y-3">

    <Textarea
    value={newNote}
    onChange={(e) => setNewNote(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddNote();
      }
    }}
    placeholder="Add a new note..."
    className="bg-[#0b1220] border border-white/10 text-white resize-none"
    rows={3}
  />

    <button
      onClick={handleAddNote}
      disabled={addingNote}
      className="w-full px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-slate-200 disabled:opacity-50 transition"
    >
      {addingNote ? "Adding..." : "Add Note"}
    </button>

  </div>

</div>
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={(open) => open && fetchProposals()}>
            <DialogTrigger asChild>
              <button className="flex-1 px-3 py-1.5 text-xs rounded-md bg-[#141b26] border border-white/10 text-slate-300 hover:bg-white/5 transition">
                View Proposal
              </button>
            </DialogTrigger>

            <DialogContent className="bg-[#0f1623] border border-white/10 text-white rounded-2xl">
              <DialogHeader>
                <DialogTitle>Lead Proposal</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-3 max-h-40 overflow-y-auto">
                {proposals.length ? (
                  proposals.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#141b26] p-4 rounded-xl border border-white/5"
                    >
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">
                        {p.proposal}
                      </p>
                      <div className="text-xs text-slate-500 mt-2 flex justify-between">
                        <span>By: {p.created_by_name}</span>
                        <span>
                          {new Date(p.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No proposals found
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

        </div>

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={status !== "closed"}
          className={`w-full px-4 py-2 text-sm rounded-lg transition ${
            status === "closed"
              ? "bg-white text-black hover:bg-slate-200"
              : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
          }`}
        >
          Convert to Client
        </button>

      </div>

            </div>
          );
        }


// ─── New Lead Modal ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  project_info: "",
  source: "",
  status: "new",
};

function NewLeadModal({ open, onClose, onCreated }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form whenever modal opens
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const validate = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z]+\s+[A-Za-z]+/;
    if (!form.name.trim()) {
      newErrors.name = "Required";
    } else if (!nameRegex.test(form.name.trim())) {
      newErrors.name = "Enter full name (First & Last)";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Required";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Enter valid email (example@gmail.com)";
    }

    const phoneRegex = /^\+91[0-9]{10}$/;
    if (!form.phone.trim()) {
      newErrors.phone = "Required";
    } else if (!phoneRegex.test(form.phone.trim())) {
      newErrors.phone = "Use format +91XXXXXXXXXX";
    }

    const allowedSources = ["LinkedIn", "Manual", "Website", "Referral"];
    if (!form.source.trim()) {
      newErrors.source = "Required";
    } else if (!allowedSources.includes(form.source)) {
      newErrors.source = "Invalid source selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/leads", form);
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.source.trim();

  return (
    // ✅ Fixed overlay — covers full screen and centers the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="
          w-[520px]
          bg-[#0f1623]
          border border-white/10
          rounded-2xl
          p-8
          shadow-[0_40px_120px_rgba(0,0,0,0.8)]
          relative
        "
        onClick={(e) => e.stopPropagation()} // prevent backdrop click from closing when clicking inside
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Create New Lead
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">

          {/* Full Name */}
          <div>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">
              Full Name
            </label>
            <input
              value={form.name}
              onChange={handleChange("name")}
              className="
                w-full bg-[#0b111c] border border-white/10 rounded-xl
                px-4 py-3 text-sm text-white outline-none
                focus:border-white/20 transition
              "
              placeholder="John Doe"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="
                w-full bg-[#0b111c] border border-white/10 rounded-xl
                px-4 py-3 text-sm text-white outline-none
                focus:border-white/20 transition
              "
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={handleChange("phone")}
              className="
                w-full bg-[#0b111c] border border-white/10 rounded-xl
                px-4 py-3 text-sm text-white outline-none
                focus:border-white/20 transition
              "
              placeholder="+91XXXXXXXXXX"
            />
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">
              Source
            </label>
            <select
              value={form.source}
              onChange={handleChange("source")}
              className="
                w-full bg-[#0b111c] border border-white/10 rounded-xl
                px-4 py-3 text-sm text-white outline-none
                focus:border-white/20 transition
              "
            >
              <option value="">Select Source</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Manual">Manual</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
            </select>
            {errors.source && <p className="text-xs text-red-400 mt-1">{errors.source}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">
              Status
            </label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="
                w-full bg-[#0b111c] border border-white/10 rounded-xl
                px-4 py-3 text-sm text-white outline-none
                focus:border-white/20 transition
              "
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="
              px-6 py-3 rounded-xl bg-white/5 border border-white/10
              text-slate-400 hover:text-white hover:border-white/20 transition
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="
              px-6 py-3 rounded-xl bg-white text-black font-medium
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-slate-200 transition
            "
          >
            {loading ? "Creating..." : "Create Lead"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Leads() {
  const [leads, setLeads]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [dateFilter, setDateFilter]   = useState("all");
  const [serviceSort, setServiceSort] = useState("all");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leads");
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const countByStatus = (key) =>
    leads.filter((l) => l.status?.toLowerCase() === key.toLowerCase()).length;

  const tabCount = (tab, i) =>
    i === 0 ? leads.length : countByStatus(tab);

  const filtered = leads
    .filter((lead) => {
      const tab = FILTER_TABS[activeTab];

      const matchTab =
        activeTab === 0 ||
        lead.status?.toLowerCase() === tab.toLowerCase();

      const matchSearch =
        !search ||
        lead.name?.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(search.toLowerCase());

      const matchService =
        serviceSort === "all" ||
        lead.project === serviceSort ||
        lead.projectInfo === serviceSort;

      let matchDate = true;

      // ✅ Use consistent snake_case key from API
      if (lead.created_at) {
        const created = new Date(lead.created_at);
        const now = new Date();

        if (dateFilter === "today") {
          matchDate = created.toDateString() === now.toDateString();
        }
        if (dateFilter === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          matchDate = created.toDateString() === yesterday.toDateString();
        }
        if (dateFilter === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          matchDate = created >= weekAgo;
        }
        if (dateFilter === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          matchDate = created >= monthAgo;
        }
        if (dateFilter === "90days") {
          const d90 = new Date();
          d90.setDate(now.getDate() - 90);
          matchDate = created >= d90;
        }
      }

      return matchTab && matchSearch && matchService && matchDate;
    })
    // ✅ Sort using consistent snake_case key
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <DashboardLayout>
      <div className="min-h-screen px-2 py-2 space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Leads</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-black hover:bg-slate-200 transition-all duration-200"
            >
              <AddIcon sx={{ fontSize: 16 }} />
              New Lead
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-5 gap-6">
          {STAT_CARDS.map(({ key, label, Icon }) => (
            <div
              key={key}
              className="
                bg-[#0c1320]
                border border-white/5
                rounded-2xl
                px-6 py-6
                flex items-center justify-between
                transition-all duration-300
                hover:border-white/10
                hover:shadow-lg
              "
            >
              <div>
                <p className="text-xs text-slate-500 mb-1 tracking-wide">{label}</p>
                <p className="text-3xl font-semibold text-white tracking-tight">
                  {String(countByStatus(key)).padStart(2, "0")}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                {/* ✅ MUI icons use sx for sizing, not size prop */}
                <Icon sx={{ fontSize: 18 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="border-b border-white/5 pb-3">
          <div className="flex items-center justify-between">

            {/* Tabs */}
            <div className="flex items-center">
              {FILTER_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                    activeTab === i
                      ? "border-white text-white"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab}
                  <span className="ml-1 text-xs opacity-50">
                    {tabCount(tab, i)}
                  </span>
                </button>
              ))}
            </div>

            {/* Search + Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <SearchIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  sx={{ fontSize: 14 }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search leads"
                  className="bg-[#141b26] border border-white/5 rounded-lg text-slate-300 text-sm pl-9 pr-4 py-2 w-56 outline-none focus:border-white/20 transition-all placeholder:text-slate-600"
                />
              </div>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[#141b26] border border-white/5 rounded-lg text-sm text-slate-300 px-3 py-2 focus:border-white/20 outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="90days">Last 90 Days</option>
              </select>

              <select
                value={serviceSort}
                onChange={(e) => setServiceSort(e.target.value)}
                className="bg-[#141b26] border border-white/5 rounded-lg text-sm text-slate-300 px-3 py-2 focus:border-white/20 outline-none"
              >
                <option value="all">All Services</option>
                <option value="Web Design">Web Design</option>
                <option value="App Design">App Design</option>
                <option value="Logo Design">Logo Design</option>
                <option value="Design System">Design System</option>
              </select>
            </div>

          </div>
        </div>

        {/* Lead Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-600 text-sm">
            No leads found
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onConverted={(id) =>
                  setLeads((prev) => prev.filter((l) => l.id !== id))
                }
              />
            ))}
          </div>
        )}

      </div>

      {/* ✅ Modal with fixed overlay */}
      <NewLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchLeads}
      />
    </DashboardLayout>
  );
}