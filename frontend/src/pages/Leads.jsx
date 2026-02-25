import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../services/api";

// MUI Icons only — no MUI components with sx props
import AddIcon from "@mui/icons-material/Add";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LinkIcon from "@mui/icons-material/Link";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import FiberNewOutlinedIcon from "@mui/icons-material/FiberNewOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { key: "new",           label: "New",           Icon: FiberNewOutlinedIcon,      iconCls: "text-blue-400",   bgCls: "bg-blue-400/10" },
  { key: "contacted",     label: "Contacted",     Icon: MarkEmailReadOutlinedIcon, iconCls: "text-emerald-400",bgCls: "bg-emerald-400/10" },
  { key: "qualified",     label: "Qualified",     Icon: CheckCircleOutlineIcon,    iconCls: "text-violet-400", bgCls: "bg-violet-400/10" },
  { key: "closed",       label: "Closed",         Icon: AccessTimeIcon,            iconCls: "text-amber-400",  bgCls: "bg-amber-400/10" },
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
const STATUSES    = ["New", "Contacted", "Qualified", "Working", "Proposal Sent", "Closed"];
const AVATAR_COLORS = ["bg-indigo-500", "bg-amber-500", "bg-emerald-500"];


// ─── Small Components ─────────────────────────────────────────────────────────

function Avatar({ initial, colorCls }) {
  return (
    <div className={`-ml-1.5 first:ml-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#141b26] flex-shrink-0 ${colorCls}`}>
      {initial}
    </div>
  );
}

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

function ProjectBadge({ project }) {
  if (!project) return <span className="text-xs text-slate-600">—</span>;
  return (
    <span className="inline-flex items-center text-xs font-medium text-sky-300 bg-sky-900/30 border border-sky-800/40 rounded-md px-2 py-0.5">
      {project}
    </span>
  );
}

function SourceBadge({ source }) {
  if (!source) return <span className="text-xs text-slate-600">—</span>;
  return (
    <span className="inline-flex items-center text-xs font-medium text-slate-400 bg-[#1a2436] border border-[#263344] rounded-md px-2 py-0.5">
      {source}
    </span>
  );
}

function LeadCard({ lead }) {
  const assignedInitials =
    Array.isArray(lead.assigned) && lead.assigned.length
      ? lead.assigned.slice(0, 3).map((a) =>
          typeof a === "string" ? a[0].toUpperCase() : (a?.name?.[0] ?? "?").toUpperCase()
        )
      : ["N", "A", "S"];

  return (
      <div className="
      bg-gradient-to-b from-[#0f1623] to-[#0b111c]     
      border border-white/5
      rounded-2xl
      p-7
      flex flex-col gap-5
      transition-all duration-300
      hover:border-white/10
      hover:-translate-y-1
      hover:shadow-[0_25px_80px_rgba(0,0,0,0.8)]     
      cursor-pointer
      ">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-sm font-semibold text-slate-100 truncate">{lead.name}</span>
          <div className="flex flex-col gap-1">
            {lead.email && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                <EmailOutlinedIcon className="text-slate-600 flex-shrink-0" sx={{ fontSize: 13 }} />
                {lead.email}
              </span>
            )}
            {lead.phone && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <PhoneOutlinedIcon className="text-slate-600 flex-shrink-0" sx={{ fontSize: 13 }} />
                {lead.phone}
              </span>
            )}
            {lead.location && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <LocationOnOutlinedIcon className="text-slate-600 flex-shrink-0" sx={{ fontSize: 13 }} />
                {lead.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center flex-shrink-0">
          <button className="p-1.5 rounded-md text-slate-600 hover:text-slate-300 hover:bg-[#1e2a38] transition-colors">
            <OpenInNewIcon sx={{ fontSize: 15 }} />
          </button>
          <button className="p-1.5 rounded-md text-slate-600 hover:text-slate-300 hover:bg-[#1e2a38] transition-colors">
            <LinkIcon sx={{ fontSize: 15 }} />
          </button>
          <button className="p-1.5 rounded-md text-slate-600 hover:text-slate-300 hover:bg-[#1e2a38] transition-colors">
            <MoreVertIcon sx={{ fontSize: 15 }} />
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-4 gap-2 border-t border-[#1e2a38] pt-3.5">
        <div>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Project Info</p>
          <ProjectBadge project={lead.project ?? lead.projectInfo} />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Status</p>
          <StatusBadge status={lead.status} />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Source</p>
          <SourceBadge source={lead.source} />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Assigned</p>
          <div className="flex items-center pl-1.5">
            {assignedInitials.map((init, i) => (
              <Avatar key={i} initial={init} colorCls={AVATAR_COLORS[i]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Lead Modal ────────────────────────────────────────────────────────────

function NewLeadModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address:"",
    project_info:"",
    source: "",
    status: "New",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const validate = () => {
    const newErrors = {};
  
    // Full Name Validation (first + last)
    const nameRegex = /^[A-Za-z]+\s+[A-Za-z]+/;
    if (!form.name.trim()) {
      newErrors.name = "Required";
    } else if (!nameRegex.test(form.name.trim())) {
      newErrors.name = "Enter full name (First & Last)";
    }
  
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Required";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Enter valid email (example@gmail.com)";
    }
  
    // Indian Phone Validation (+91XXXXXXXXXX)
    const phoneRegex = /^\+91[0-9]{10}$/;
    if (!form.phone.trim()) {
      newErrors.phone = "Required";
    } else if (!phoneRegex.test(form.phone.trim())) {
      newErrors.phone = "Use format +91XXXXXXXXXX";
    }
  
    // Source Validation
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
      setForm({
        name: "",
        email: "",
        phone: "",
        source: "",
        status: "New",
      });
      setErrors({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
  Object.keys(errors).length === 0 &&
  form.name &&
  form.email &&
  form.phone &&
  form.source;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="
      flex items-center gap-2
      px-5 py-2.5
      rounded-xl
      bg-white text-black
      hover:bg-slate-200
      text-sm font-medium
      transition-all duration-200
      shadow-[0_10px_30px_rgba(255,255,255,0.15)]
    ">

        <h2 className="text-lg font-semibold text-slate-100 mb-6">
          Create New Lead
        </h2>

        <div className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
            <input
              value={form.name}
              onChange={handleChange("name")}
              className="w-full bg-[#0d1117] border border-[#1e2a38] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-600"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full bg-[#0d1117] border border-[#1e2a38] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-600"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
            <input
              value={form.phone}
              onChange={handleChange("phone")}
              className="w-full bg-[#0d1117] border border-[#1e2a38] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-600"
              placeholder="9876543210"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Source */}
          <div>
          <label className="block text-xs text-slate-400 mb-1.5">Source</label>
          <select
            value={form.source}
            onChange={handleChange("source")}
            className="w-full bg-[#0d1117] border border-[#1e2a38] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-600"
          >
            <option value="">Select Source</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Manual">Manual</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
          </select>
          {errors.source && (
            <p className="text-xs text-red-500 mt-1">{errors.source}</p>
          )}
        </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="w-full bg-[#0d1117] border border-[#1e2a38] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-600"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#1e2a38] text-slate-400 text-sm hover:bg-[#263444]"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
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
  const [dateFilter, setDateFilter] = useState("all");
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

    // Status Tab Filter
    const matchTab =
      activeTab === 0 ||
      lead.status?.toLowerCase() === tab.toLowerCase();

    // Search Filter
    const matchSearch =
      !search ||
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(search.toLowerCase());

    // Service Filter
    const matchService =
      serviceSort === "all" ||
      lead.project === serviceSort ||
      lead.projectInfo === serviceSort;

    // Date Filter
    let matchDate = true;

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
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <DashboardLayout>
      <div className="min-h-screen px-2 py-2 space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Leads</h1>          
          <div className="flex items-center gap-2">
            {/*<button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-400 bg-[#141b26] border border-[#1e2a38] hover:border-[#2d3f55] hover:text-slate-200 transition-all">
              <FileUploadOutlinedIcon sx={{ fontSize: 15 }} />
              Import Leads
            </button>*/}
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
                <p className="text-xs text-slate-500 mb-1 tracking-wide">
                  {label}
                </p>
                <p className="text-3xl font-semibold text-white tracking-tight">
                  {String(countByStatus(key)).padStart(2, "0")}
                </p>
              </div>

              <div className="
                w-10 h-10
                rounded-xl
                bg-white/5
                flex items-center justify-center
                text-slate-400
              ">
                <Icon size={18} />
              </div>
            </div>
          ))}
        </div>

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
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((lead) => (
              <LeadCard key={lead._id ?? lead.id} lead={lead} />
            ))}
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