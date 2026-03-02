import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../services/api";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (val) => {
  const n = parseFloat(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(n);
};

const statusConfig = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10", dot: "bg-amber-400" },
  in_progress: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-400/10", dot: "bg-blue-400" },
  completed: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#0d1117] border border-white/[0.07] rounded-xl shadow-xl shadow-black/30 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
      {action}
    </div>
  );
}

function AddButton({ onClick, label = "+ Add" }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all duration-200"
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className="border-b border-white/[0.06] mb-4" />;
}

function ProjectDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  const [addingType, setAddingType] = useState(null);
  const [newItemText, setNewItemText] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_type: "milestone",
  });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [workspaceUsers, setWorkspaceUsers] = useState([]);

  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    due_date: "",
    status: "pending",
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}/full`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceUsers = async () => {
    try {
      const res = await api.get("/users");
      setWorkspaceUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center gap-3 text-slate-400">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading project...
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-8 text-red-400">Project not found</div>
      </DashboardLayout>
    );
  }

  const {
    project,
    requirements = [],
    features = [],
    milestones = [],
    members = [],
    activity = [],
    payments = [],
  } = data;

  const handleSaveMilestone = async () => {
    try {
      if (editingMilestoneId === "new") {
        await api.post(`/projects/${id}/milestones`, milestoneForm);
      } else {
        await api.patch(
          `/projects/${id}/milestones/${editingMilestoneId}`,
          milestoneForm
        );
      }
      setEditingMilestoneId(null);
      fetchProject();
    } catch (err) {
      alert("Failed to save milestone");
    }
  };

  const remainingAmount = Number(project.remaining_amount || 0);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post("/payments", {
        project_id: project.id,
        amount: Number(paymentForm.amount),
        payment_type: paymentForm.payment_type,
      });
      setShowPaymentModal(false);
      setPaymentForm({ amount: "", payment_type: "milestone" });
      fetchProject();
    } catch (err) {
      const message = err.response?.data?.message || "Payment failed";
      alert(message);
    }
  };

  const handleAssignMember = async (user) => {
    try {
      await api.post(`/projects/${id}/members`, {
        user_id: user.id,
        role: user.role || "Member",
      });
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const budgetUsedPct = project.budget
    ? Math.min(100, (Number(project.total_paid) / Number(project.budget)) * 100)
    : 0;

  const inputCls =
    "w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all duration-200";

  const selectCls =
    "w-full px-3 py-2 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all duration-200 appearance-none";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#080c12] p-6 text-white">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {project.name}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  {project.client_name}
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Due {formatDate(project.deadline)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── LEFT 60% ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Project Overview */}
            <Card className="p-5">
              <SectionHeader title="Project Overview" />
              <Divider />
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                {project.description || "No description added."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Requirements */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Requirements</p>
                    <button
                      onClick={() => { setAddingType("requirement"); setNewItemText(""); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {requirements.map((r) => (
                      <li key={r.id} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        {r.title}
                      </li>
                    ))}
                    {addingType === "requirement" && (
                      <li>
                        <input
                          autoFocus
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && newItemText.trim()) {
                              await api.post(`/projects/${id}/requirements`, { title: newItemText });
                              setAddingType(null);
                              fetchProject();
                            }
                            if (e.key === "Escape") setAddingType(null);
                          }}
                          className={inputCls}
                          placeholder="New requirement..."
                        />
                      </li>
                    )}
                    {requirements.length === 0 && addingType !== "requirement" && (
                      <li className="text-xs text-slate-600 italic">None added yet</li>
                    )}
                  </ul>
                </div>

                {/* Features */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Features</p>
                    <button
                      onClick={() => { setAddingType("feature"); setNewItemText(""); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f.id} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                        {f.title}
                      </li>
                    ))}
                    {addingType === "feature" && (
                      <li>
                        <input
                          autoFocus
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && newItemText.trim()) {
                              await api.post(`/projects/${id}/features`, { title: newItemText });
                              setAddingType(null);
                              fetchProject();
                            }
                            if (e.key === "Escape") setAddingType(null);
                          }}
                          className={inputCls}
                          placeholder="New feature..."
                        />
                      </li>
                    )}
                    {features.length === 0 && addingType !== "feature" && (
                      <li className="text-xs text-slate-600 italic">None added yet</li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Milestones */}
            <Card className="p-5">
              <SectionHeader
                title="Milestones & Deadlines"
                action={
                  <AddButton
                    onClick={() => {
                      setEditingMilestoneId("new");
                      setMilestoneForm({ title: "", due_date: "", status: "pending" });
                    }}
                  />
                }
              />
              <Divider />

              <div className="space-y-1">
                {/* Header row */}
                <div className="grid grid-cols-12 text-xs text-slate-500 uppercase tracking-widest px-3 pb-2">
                  <span className="col-span-5">Milestone</span>
                  <span className="col-span-3 text-center">Due</span>
                  <span className="col-span-2 text-center">Status</span>
                  <span className="col-span-2 text-right">Action</span>
                </div>

                {/* New row */}
                {editingMilestoneId === "new" && (
                  <div className="grid grid-cols-12 gap-2 items-center bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2.5">
                    <div className="col-span-5">
                      <input
                        value={milestoneForm.title}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                        className={inputCls}
                        placeholder="Milestone title"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="date"
                        value={milestoneForm.due_date}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={milestoneForm.status}
                        onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                        className={selectCls}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button onClick={handleSaveMilestone} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Save</button>
                      <button onClick={() => setEditingMilestoneId(null)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Existing milestones */}
                {milestones.length === 0 && editingMilestoneId !== "new" && (
                  <div className="text-center py-8 text-slate-600 text-sm">No milestones added yet</div>
                )}

                {milestones.map((m) =>
                  editingMilestoneId === m.id ? (
                    <div key={m.id} className="grid grid-cols-12 gap-2 items-center bg-indigo-500/5 border border-indigo-500/20 rounded-lg px-3 py-2.5">
                      <div className="col-span-5">
                        <input
                          value={milestoneForm.title}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="date"
                          value={milestoneForm.due_date}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={milestoneForm.status}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                          className={selectCls}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <button onClick={handleSaveMilestone} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Save</button>
                        <button onClick={() => setEditingMilestoneId(null)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="grid grid-cols-12 items-center px-3 py-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.04]">
                      <span className="col-span-5 text-sm text-slate-200 font-medium">{m.title}</span>
                      <span className="col-span-3 text-center text-xs text-slate-400">{formatDate(m.due_date)}</span>
                      <span className="col-span-2 flex justify-center">
                        <StatusBadge status={m.status} />
                      </span>
                      <span className="col-span-2 flex justify-end">
                        <button
                          onClick={() => {
                            setEditingMilestoneId(m.id);
                            setMilestoneForm({ title: m.title, due_date: m.due_date?.slice(0, 10), status: m.status });
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Edit
                        </button>
                      </span>
                    </div>
                  )
                )}
              </div>
            </Card>

            {/* Financial Summary */}
            <Card className="p-5">
              <SectionHeader title="Financial Summary" />
              <Divider />

              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: "Total Budget", value: `₹${formatCurrency(project.budget)}`, color: "text-emerald-400", accent: "from-emerald-500/20 to-emerald-500/5" },
                  { label: "Total Paid", value: `₹${formatCurrency(project.total_paid)}`, color: "text-blue-400", accent: "from-blue-500/20 to-blue-500/5" },
                  { label: "Remaining", value: `₹${formatCurrency(project.remaining_amount)}`, color: "text-amber-400", accent: "from-amber-500/20 to-amber-500/5" },
                ].map(({ label, value, color, accent }) => (
                  <div key={label} className={`bg-gradient-to-b ${accent} border border-white/[0.06] rounded-xl p-4 text-center`}>
                    <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-widest">{label}</p>
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Budget progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Budget used</span>
                  <span>{Math.round(budgetUsedPct)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${budgetUsedPct}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Payment History */}
            <Card className="p-5">
              <SectionHeader
                title="Payment History"
                action={<AddButton onClick={() => setShowPaymentModal(true)} label="+ Add Payment" />}
              />
              <Divider />

              {payments.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">No payments recorded</div>
              ) : (
                <div className="space-y-1">
                  <div className="grid grid-cols-3 text-xs text-slate-500 uppercase tracking-widest px-3 pb-2">
                    <span>Amount</span>
                    <span className="text-center">Type</span>
                    <span className="text-right">Date</span>
                  </div>
                  {payments.map((pay) => (
                    <div key={pay.id} className="grid grid-cols-3 items-center px-3 py-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                      <span className="text-sm font-semibold text-emerald-400">₹{formatCurrency(pay.amount)}</span>
                      <span className="text-center text-xs text-slate-400 capitalize">{pay.payment_type}</span>
                      <span className="text-right text-xs text-slate-500">{formatDate(pay.payment_date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── RIGHT 40% ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Team Members */}
            <Card className="p-5">
              <SectionHeader
                title="Team Members"
                action={
                  <AddButton
                    onClick={() => { fetchWorkspaceUsers(); setShowMemberModal(true); }}
                    label="+ Add Member"
                  />
                }
              />
              <Divider />

              {members.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">No members assigned</div>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.025] border border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {m.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-200 font-medium">{m.name}</span>
                      </div>
                      <span className="text-xs text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-full">{m.role}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Activity Log */}
            <Card className="p-5">
              <SectionHeader title="Activity Log" />
              <Divider />

              {activity.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">No activity yet</div>
              ) : (
                <div className="space-y-0">
                  {activity.slice(0, visibleCount).map((a, i) => (
                    <div key={a.id} className="relative pl-5 pb-4">
                      {/* timeline line */}
                      {i < Math.min(activity.length, visibleCount) - 1 && (
                        <div className="absolute left-[7px] top-[18px] bottom-0 w-px bg-white/[0.06]" />
                      )}
                      <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[#0d1117] border-2 border-indigo-500/40" />
                      <p className="text-sm text-slate-200 leading-snug">
                        <span className="font-semibold text-white">{a.user_name}</span>{" "}
                        <span className="text-slate-400">{a.action}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{formatDate(a.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* ── MEMBER MODAL ── */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl w-[420px] p-6 shadow-2xl shadow-black/60">
              <h3 className="text-sm font-semibold mb-1">Assign Member</h3>
              <p className="text-xs text-slate-500 mb-5">Add workspace members to this project</p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {workspaceUsers
                  .filter((user) => user.role !== "admin")
                  .map((user) => {
                    const alreadyAssigned = members.some((m) => m.user_id === user.id);
                    return (
                      <div key={user.id} className="flex justify-between items-center bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-slate-200">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.role}</p>
                          </div>
                        </div>
                        {alreadyAssigned ? (
                          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full">Assigned</span>
                        ) : (
                          <button
                            onClick={() => handleAssignMember(user)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1 rounded-lg transition-all duration-200"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06] text-right">
                <button onClick={() => setShowMemberModal(false)} className="text-xs text-slate-400 hover:text-slate-300 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENT MODAL ── */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl w-[420px] p-6 shadow-2xl shadow-black/60">
              <h3 className="text-sm font-semibold mb-1">Add Payment</h3>
              <p className="text-xs text-slate-500 mb-5">
                Remaining: <span className="text-amber-400 font-medium">₹{formatCurrency(remainingAmount)}</span>
              </p>

              <form onSubmit={handleAddPayment} className="space-y-3">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Amount"
                  min="1"
                  max={remainingAmount}
                  value={paymentForm.amount}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setPaymentForm({
                      ...paymentForm,
                      amount: value > remainingAmount ? remainingAmount : value,
                    });
                  }}
                  className={inputCls}
                  required
                />

                <select
                  value={paymentForm.payment_type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                  className={selectCls}
                >
                  <option className="bg-[#0d1117] text-white" value="milestone">Milestone</option>
                  <option className="bg-[#0d1117] text-white" value="advance">Advance</option>
                  <option className="bg-[#0d1117] text-white" value="final">Final</option>
                </select>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200"
                  >
                    Save Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default ProjectDetail;