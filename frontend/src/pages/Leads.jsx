import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../services/api";
import { useRef } from "react";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

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
  new: "text-blue-400",
  contacted: "text-yellow-400",
  qualified: "text-violet-400",
  "proposal sent": "text-orange-400",
  closed: "text-emerald-400",
  lost: "text-red-400",
};
const STATUS_DOT = {
  new: "bg-blue-400",
  contacted: "bg-yellow-400",
  qualified: "bg-violet-400",
  "proposal sent": "bg-orange-400",
  closed: "bg-emerald-400",
  lost: "bg-red-400",
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
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

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
  className={`inline-flex items-center gap-1.5 cursor-pointer text-sm font-medium ${
    STATUS_STYLE[status] || "text-slate-400"
  }`}
>
  <span
    className={`w-2 h-2 rounded-full ${
      STATUS_DOT[status] || "bg-slate-400"
    }`}
  />
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
            onClick={() => setShowConvertModal(true)}
            disabled={status !== "closed"}
            className={`w-full px-4 py-2 text-sm rounded-lg transition ${
              status === "closed"
                ? "bg-white text-black hover:bg-slate-200"
                : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
            }`}
          >
            Convert to Client
          </button>

          {/* 🔥 ADD THIS MODAL RIGHT HERE */}
          {showConvertModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-[#0f1623] border border-white/10 rounded-2xl p-6 w-96">
                
                <h2 className="text-lg font-semibold text-white mb-3">
                  Convert Lead?
                </h2>

                <p className="text-sm text-slate-400 mb-6">
                  Are you sure you want to convert{" "}
                  <span className="text-white font-medium">
                    {lead.name}
                  </span>{" "}
                  into a client?
                </p>

                <div className="flex justify-end gap-3">
                  
                  <button
                    onClick={() => setShowConvertModal(false)}
                    disabled={isConverting}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        setIsConverting(true);
                        await handleConvert();
                        setShowConvertModal(false);
                      } finally {
                        setIsConverting(false);
                      }
                    }}
                    disabled={isConverting}
                    className="px-4 py-2 rounded-lg bg-white text-black hover:bg-slate-200 transition disabled:opacity-50"
                  >
                    {isConverting ? "Converting..." : "Yes, Convert"}
                  </button>

                </div>
              </div>
            </div>
          )}
      </div>  
    </div>  
  );
}


// ─── New Lead Modal ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  source: "",
  status: "new",
  budget: "",
  service: ""
};

function NewLeadModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.email.trim()) newErrors.email = "Required";
    if (!form.phone.trim()) newErrors.phone = "Required";
    if (!form.source.trim()) newErrors.source = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
  
    try {
      setLoading(true);
  
      await api.post("/leads", form);
  
      setSuccess(true);   // ✅ show success
  
      setTimeout(() => {
        onCreated();      // refresh list
        onClose();        // close modal
        setSuccess(false);
      }, 1200);
  
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={onClose}
        >
          <div
            className="
              w-full max-w-sm
              bg-[#0f1623]
              border border-white/10
              rounded-xl
              p-5
              relative
            "
            onClick={(e) => e.stopPropagation()}
          >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white">
            Create New Lead
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white"
          >
            ✕
          </button>
        </div>
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-3 py-2 rounded-lg">
            Lead created successfully ✅
          </div>
        )}
        <div className="space-y-3">

          {/* Name */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Full Name</label>
            <input
              value={form.name}
              onChange={handleChange("name")}
              className="w-full bg-[#0b111c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full bg-[#0b111c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Phone</label>
            <input
              value={form.phone}
              onChange={handleChange("phone")}
              className="w-full bg-[#0b111c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Budget</label>
            <input
              type="number"
              value={form.budget}
              onChange={handleChange("budget")}
              className="w-full bg-[#0b111c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Source</label>
            <select
              value={form.source}
              onChange={handleChange("source")}
              className="w-full bg-[#0b111c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              <option value="">Select Source</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Manual">Manual</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Status</label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="w-full bg-[#0b111c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Service</label>
            <select
              value={form.service}
              onChange={handleChange("service")}
              className="w-full bg-[#0b111c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              <option value="">Select Service</option>
              <option value="AI Customer Support Bot">AI Customer Support Bot</option>
              <option value="AI Marketing Automation">AI Marketing Automation</option>
              <option value="AI Workflow Automation">AI Workflow Automation</option>
              <option value="AI Sales Funnel System">AI Sales Funnel System</option>
              <option value="Custom GPT Integration">Custom GPT Integration</option>
              <option value="AI Chatbot Development">AI Chatbot Development</option>
              <option value="AI Voice Agent Setup">AI Voice Agent Setup</option>
              <option value="AI Website Builder">AI Website Builder</option>
              <option value="AI Appointment Booking System">AI Appointment Booking System</option>
              <option value="AI UGC Ads Creation">AI UGC Ads Creation</option>
              <option value="AI CRM Automation">AI CRM Automation</option>
              <option value="Lead Generation AI System">Lead Generation AI System</option>
            </select>
          </div>

        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-white text-black"
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
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [serviceSort, setServiceSort] = useState("all");
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 18;

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leads?page=${page}&limit=${limit}`);

      setLeads(res.data.leads || []);
      setTotalLeads(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page]);

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
        serviceSort === "all" || lead.service === serviceSort;

      let matchDate = true;

      if (lead.created_at) {
        const created = new Date(lead.created_at);
        const now = new Date();

        if (dateFilter === "today")
          matchDate = created.toDateString() === now.toDateString();

        if (dateFilter === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          matchDate =
            created.toDateString() === yesterday.toDateString();
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
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <DashboardLayout>
      <div className="min-h-screen px-2 py-2 space-y-10">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Leads</h1>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-black hover:bg-slate-200 transition"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            New Lead
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-5 gap-6">
          {STAT_CARDS.map(({ key, label, Icon, iconCls, bgCls }) => (
            <div
              key={key}
              className={`
                ${bgCls}
                border border-white/5
                rounded-2xl
                px-6 py-6
                flex items-center justify-between
                transition-all duration-300
                hover:scale-[1.02]
              `}
            >
              <div>
                <p className="text-xs text-slate-400 mb-1 tracking-wide">
                  {label}
                </p>

                <p className={`text-3xl font-semibold ${iconCls}`}>
                  {String(stats[key] || 0).padStart(2, "0")}
                </p>
              </div>

              <div
                className={`
                  w-10 h-10 rounded-xl
                  ${bgCls}
                  flex items-center justify-center
                `}
              >
                <Icon className={iconCls} sx={{ fontSize: 18 }} />
              </div>
            </div>
          ))}
        </div>
        {/* FILTER + SEARCH */}
        <div className="border-b border-white/5 pb-3 flex justify-between items-center">

          <div className="flex gap-4">
            {FILTER_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 text-sm border-b-2 ${
                  activeTab === i
                    ? "border-white text-white"
                    : "border-transparent text-slate-500"
                }`}
              >
                {tab}
              </button>
            ))}
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
                placeholder="Search leads"
                className="bg-[#141b26] border border-white/5 rounded-lg text-slate-300 text-sm pl-9 pr-4 py-2 w-56"
              />
            </div>
          </div>

        </div>

        {/* LEAD GRID */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-600 text-sm">
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

        {/* PAGINATION */}
        {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">

          {/* Prev */}
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg text-sm border border-white/20 text-white disabled:opacity-40 hover:bg-white/10 transition"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 5) return true;
              return (
                p === 1 ||
                p === totalPages ||
                Math.abs(p - page) <= 1
              );
            })
            .map((p, index, arr) => {
              const prev = arr[index - 1];

              return (
                <span key={p} className="flex items-center gap-2">
                  {prev && p - prev > 1 && (
                    <span className="text-white/60 px-2">...</span>
                  )}

                  <button
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-lg text-sm transition ${
                      page === p
                        ? "bg-white text-black"
                        : "border border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              );
            })}

          {/* Next */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg text-sm border border-white/20 text-white disabled:opacity-40 hover:bg-white/10 transition"
          >
            Next
          </button>

        </div>
      )}
            

      </div>

      <NewLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchLeads}
      />
    </DashboardLayout>
  );
}