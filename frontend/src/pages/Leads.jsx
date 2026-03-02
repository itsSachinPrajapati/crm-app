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
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { key: "new",           label: "New",           Icon: FiberNewOutlinedIcon,      iconCls: "text-blue-400",    bgCls: "bg-blue-400/10" },
  { key: "contacted",     label: "Contacted",     Icon: MarkEmailReadOutlinedIcon, iconCls: "text-emerald-400", bgCls: "bg-emerald-400/10" },
  { key: "qualified",     label: "Qualified",     Icon: CheckCircleOutlineIcon,    iconCls: "text-violet-400",  bgCls: "bg-violet-400/10" },
  { key: "closed",        label: "Closed",        Icon: AccessTimeIcon,            iconCls: "text-amber-400",   bgCls: "bg-amber-400/10" },
  { key: "proposal sent", label: "Proposal Sent", Icon: SendOutlinedIcon,          iconCls: "text-rose-400",    bgCls: "bg-rose-400/10" },
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
const STATUS_BG = {
  new: "bg-blue-400/10",
  contacted: "bg-yellow-400/10",
  qualified: "bg-violet-400/10",
  "proposal sent": "bg-orange-400/10",
  closed: "bg-emerald-400/10",
  lost: "bg-red-400/10",
};

const FILTER_TABS = ["All", "New", "Contacted", "Qualified", "Working", "Proposal Sent"];
const STATUSES = ["new", "contacted", "qualified", "proposal sent", "closed"];

const sharedInputCls =
  "w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-200";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const key = status?.toLowerCase() ?? "";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[key] ?? "text-slate-400"} ${STATUS_BG[key] ?? "bg-slate-400/10"}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[key] ?? "bg-slate-400"}`} />
      {status}
    </span>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

function LeadCard({ lead, onConverted }) {
  const [status, setStatus] = useState(lead.status?.toLowerCase() || "new");
  const [notes, setNotes] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const notesEndRef = useRef(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

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
      id: Date.now(),
      note: newNote,
      created_by_name: "You",
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, tempNote]);
    setNewNote("");
    setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    try {
      setAddingNote(true);
      await api.post(`/leads/${lead.id}/notes`, { note: tempNote.note });
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  const fetchProposals = async () => {
    try {
      const res = await api.get(`/leads/${lead.id}/proposals`);
      setProposals(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === status) return;
    try {
      await api.patch(`/leads/${lead.id}/status`, { status: newStatus });
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
    const old = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.delete(`/leads/notes/${id}`);
    } catch (err) {
      setNotes(old);
    }
  };

  const isClosed = status === "closed";

  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-4 space-y-4 hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/30 transition-all duration-200 flex flex-col">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{lead.name}</h3>
          <div className="mt-1 space-y-0.5 text-xs text-slate-500">
            {lead.email && <div className="truncate">{lead.email}</div>}
            {lead.phone && <div>{lead.phone}</div>}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="h-px bg-white/[0.06]" />

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-600">Source </span>
          <span className="text-slate-300 font-medium">{lead.source || "Manual"}</span>
        </div>

        {/* Inline status edit */}
        {editingStatus ? (
          <select
            value={status}
            onChange={(e) => { handleStatusChange(e); setEditingStatus(false); }}
            onBlur={() => setEditingStatus(false)}
            autoFocus
            className="bg-[#0d1117] border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            {STATUSES.slice(STATUSES.indexOf(status)).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setEditingStatus(true)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Change status
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        {/* Notes */}
        <Dialog onOpenChange={(open) => open && fetchNotes()}>
          <DialogTrigger asChild>
            <button className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-150">
              Notes {notes.length > 0 && <span className="ml-1 text-indigo-400">({notes.length})</span>}
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d1117] border border-white/[0.08] text-white rounded-2xl max-w-md shadow-2xl shadow-black/60">
            <DialogHeader>
              <DialogTitle className="text-base">Lead Notes</DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">{lead.name}</p>
            </DialogHeader>
            <div className="mt-2 space-y-3">
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {notes.length ? notes.map((note) => (
                  <div key={note.id} className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-xl relative group">
                    <p className="text-sm text-slate-200 leading-relaxed">{note.note}</p>
                    <div className="text-xs text-slate-600 mt-2 flex justify-between">
                      <span>{note.created_by_name}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-2.5 right-2.5 text-xs text-red-400/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                )) : (
                  <p className="text-sm text-slate-600 text-center py-6">No notes yet</p>
                )}
                <div ref={notesEndRef} />
              </div>

              <div className="border-t border-white/[0.06] pt-3 space-y-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
                  placeholder="Write a note... (Enter to send)"
                  className="bg-white/[0.03] border border-white/10 text-white text-sm resize-none focus:border-indigo-500/50 rounded-lg"
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50 transition-colors duration-200"
                >
                  {addingNote ? "Adding..." : "Add Note"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Proposals */}
        <Dialog onOpenChange={(open) => open && fetchProposals()}>
          <DialogTrigger asChild>
            <button className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-150">
              Proposal
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d1117] border border-white/[0.08] text-white rounded-2xl max-w-md shadow-2xl shadow-black/60">
            <DialogHeader>
              <DialogTitle className="text-base">Lead Proposal</DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">{lead.name}</p>
            </DialogHeader>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
              {proposals.length ? proposals.map((p) => (
                <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] p-3.5 rounded-xl">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{p.proposal}</p>
                  <div className="text-xs text-slate-600 mt-2 flex justify-between">
                    <span>{p.created_by_name}</span>
                    <span>{new Date(p.created_at).toLocaleString()}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-600 text-center py-6">No proposals found</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Convert button */}
      <button
        onClick={() => isClosed && setShowConvertModal(true)}
        disabled={!isClosed}
        className={`w-full py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
          isClosed
            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-white/[0.02] border border-white/[0.05] text-slate-600 cursor-not-allowed"
        }`}
      >
        {isClosed ? "Convert to Client →" : "Convert to Client"}
      </button>

      {/* Convert confirm modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl p-6 w-96 shadow-2xl shadow-black/60">
            <h2 className="text-base font-semibold text-white mb-1">Convert Lead?</h2>
            <p className="text-sm text-slate-400 mb-6">
              Convert <span className="text-white font-medium">{lead.name}</span> into a client?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConvertModal(false)}
                disabled={isConverting}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] transition-all duration-150"
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
                className="px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
              >
                {isConverting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isConverting ? "Converting..." : "Yes, Convert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── New Lead Modal ────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", email: "", phone: "", source: "", status: "new", budget: "", service: "" };

function NewLeadModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (open) { setForm(EMPTY_FORM); setErrors({}); } }, [open]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.source.trim()) e.source = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await api.post("/leads", form);
      setSuccess(true);
      setTimeout(() => { onCreated(); onClose(); setSuccess(false); }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children, error }) => (
    <div>
      <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );

  const inputCls = `${sharedInputCls} ${errors.name ? "border-red-500/50" : ""}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#0d1117] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/60 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-white">Create New Lead</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all duration-150 text-xs">✕</button>
        </div>
        <p className="text-xs text-slate-500 mb-5">Fill in the details to add a new lead</p>

        {success && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-3 py-2.5 rounded-lg flex items-center gap-2">
            <span className="w-4 h-4 text-emerald-400">✓</span>
            Lead created successfully
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" error={errors.name}>
              <input value={form.name} onChange={handleChange("name")} className={sharedInputCls} placeholder="John Smith" />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input value={form.phone} onChange={handleChange("phone")} className={sharedInputCls} placeholder="+91 98765..." />
            </Field>
          </div>

          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={handleChange("email")} className={sharedInputCls} placeholder="john@example.com" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Budget (₹)">
              <input type="number" value={form.budget} onChange={handleChange("budget")} className={sharedInputCls} placeholder="50000" />
            </Field>
            <Field label="Source" error={errors.source}>
              <select value={form.source} onChange={handleChange("source")} className={sharedInputCls}>
                <option value="">Select</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Manual">Manual</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
              </select>
            </Field>
          </div>

          <Field label="Status">
            <select value={form.status} onChange={handleChange("status")} className={sharedInputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Service">
            <select value={form.service} onChange={handleChange("service")} className={sharedInputCls}>
              <option value="">Select Service</option>
              {[
                "AI Customer Support Bot", "AI Marketing Automation", "AI Workflow Automation",
                "AI Sales Funnel System", "Custom GPT Integration", "AI Chatbot Development",
                "AI Voice Agent Setup", "AI Website Builder", "AI Appointment Booking System",
                "AI UGC Ads Creation", "AI CRM Automation", "Lead Generation AI System",
              ].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
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

  useEffect(() => { fetchLeads(); }, [page]);

  const filtered = leads
    .filter((lead) => {
      const tab = FILTER_TABS[activeTab];
      const matchTab = activeTab === 0 || lead.status?.toLowerCase() === tab.toLowerCase();
      const matchSearch = !search || lead.name?.toLowerCase().includes(search.toLowerCase()) || lead.email?.toLowerCase().includes(search.toLowerCase()) || lead.phone?.toLowerCase().includes(search.toLowerCase());
      const matchService = serviceSort === "all" || lead.service === serviceSort;
      let matchDate = true;
      if (lead.created_at) {
        const created = new Date(lead.created_at);
        const now = new Date();
        if (dateFilter === "today") matchDate = created.toDateString() === now.toDateString();
        if (dateFilter === "yesterday") { const y = new Date(); y.setDate(now.getDate() - 1); matchDate = created.toDateString() === y.toDateString(); }
        if (dateFilter === "week") { const w = new Date(); w.setDate(now.getDate() - 7); matchDate = created >= w; }
        if (dateFilter === "month") { const m = new Date(); m.setMonth(now.getMonth() - 1); matchDate = created >= m; }
        if (dateFilter === "90days") { const d = new Date(); d.setDate(now.getDate() - 90); matchDate = created >= d; }
      }
      return matchTab && matchSearch && matchService && matchDate;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#080c12] p-6 space-y-7">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Leads</h1>
            <p className="text-xs text-slate-500 mt-1">{totalLeads} total leads</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors duration-200"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            New Lead
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {STAT_CARDS.map(({ key, label, Icon, iconCls, bgCls }) => (
            <div
              key={key}
              className="bg-[#0d1117] border border-white/[0.07] rounded-xl px-5 py-5 flex items-center justify-between shadow-xl shadow-black/20 hover:border-white/[0.12] transition-all duration-200"
            >
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
                <p className={`text-2xl font-bold ${iconCls}`}>
                  {String(stats[key] || 0).padStart(2, "0")}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${bgCls} flex items-center justify-center`}>
                <Icon className={iconCls} sx={{ fontSize: 20 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs + Search ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
          <div className="flex gap-1">
            {FILTER_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                  activeTab === i
                    ? "bg-white/[0.08] text-white border border-white/[0.12]"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" sx={{ fontSize: 14 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="bg-[#0d1117] border border-white/[0.07] rounded-lg text-slate-300 text-sm pl-9 pr-4 py-2 w-52 focus:outline-none focus:border-indigo-500/40 transition-all duration-200 placeholder-slate-600"
            />
          </div>
        </div>

        {/* ── Lead Grid ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-slate-600">
            <FiberNewOutlinedIcon sx={{ fontSize: 36 }} />
            <span className="text-sm">No leads found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onConverted={(id) => setLeads((prev) => prev.filter((l) => l.id !== id))}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, index, arr) => {
                const prev = arr[index - 1];
                return (
                  <span key={p} className="flex items-center gap-2">
                    {prev && p - prev > 1 && <span className="text-slate-600 px-1 text-xs">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                        page === p
                          ? "bg-indigo-600 text-white"
                          : "border border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <NewLeadModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchLeads} />
    </DashboardLayout>
  );
}