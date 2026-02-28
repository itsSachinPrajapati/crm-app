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

function ProjectDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_type: "milestone",
  });

  // Member modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [workspaceUsers, setWorkspaceUsers] = useState([]);

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
        <div className="p-6 text-slate-400">Loading project...</div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-400">Project not found</div>
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

  // =========================
  // PAYMENT
  // =========================
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
      console.error(err);
    }
  };

  // =========================
  // MEMBER ASSIGN
  // =========================
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

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-[#0b1220] via-[#0f1623] to-[#0a0f1a] p-6 text-white">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Client: {project.client_name} | Deadline:{" "}
            {formatDate(project.deadline)}
          </p>
        </div>

        {/* GRID 60 / 40 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT 60% */}
          <div className="lg:col-span-3 space-y-6">

            {/* Overview */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Project Overview</h3>
              <div className="border-b border-white/10 mb-3" />
              <p className="text-sm text-slate-300">
                {project.description || "No description added."}
              </p>

              <div className="border-b border-white/10 my-4" />

              <div className="grid grid-cols-2 gap-6 text-sm text-slate-300">
                <div>
                  <p className="text-slate-400 mb-2 text-xs">Requirements</p>
                  <ul className="list-disc list-inside space-y-1">
                    {requirements.map((r) => (
                      <li key={r.id}>{r.title}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-slate-400 mb-2 text-xs">Features</p>
                  <ul className="list-disc list-inside space-y-1">
                    {features.map((f) => (
                      <li key={f.id}>{f.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Milestones & Deadlines</h3>
              <div className="border-b border-white/10 mb-3" />

              <table className="w-full text-sm text-center border-collapse">
                <thead className="text-slate-400 text-xs">
                  <tr>
                    <th className="py-2 border-b border-white/10">Milestone</th>
                    <th className="border-b border-white/10">Due</th>
                    <th className="border-b border-white/10">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((m) => (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-2">{m.title}</td>
                      <td>{formatDate(m.due_date)}</td>
                      <td>{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-4">Financial Summary</h3>

              <div className="grid grid-cols-3 gap-4 text-sm text-center">
                <div>
                  <p className="text-slate-400 text-xs">Total Budget</p>
                  <p className="text-emerald-400 font-semibold">
                    ₹{formatCurrency(project.total_amount)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs">Total Paid</p>
                  <p className="text-blue-400 font-semibold">
                    ₹{formatCurrency(project.total_paid)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs">Remaining</p>
                  <p className="text-amber-400 font-semibold">
                    ₹{formatCurrency(project.remaining_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold">Payment History</h3>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1 text-xs bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  + Add Payment
                </button>
              </div>

              <table className="w-full text-sm text-center border-collapse">
                <thead className="text-slate-400 text-xs">
                  <tr>
                    <th className="py-2 border-b border-white/10">Amount</th>
                    <th className="border-b border-white/10">Type</th>
                    <th className="border-b border-white/10">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => (
                    <tr key={pay.id} className="border-b border-white/5">
                      <td className="py-2 text-emerald-400">
                        ₹{formatCurrency(pay.amount)}
                      </td>
                      <td className="capitalize">{pay.payment_type}</td>
                      <td>{formatDate(pay.payment_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT 40% */}
          <div className="lg:col-span-2 space-y-6">

            {/* Team Members */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">Team Members</h3>
                <button
                  onClick={() => {
                    fetchWorkspaceUsers();
                    setShowMemberModal(true);
                  }}
                  className="px-3 py-1 text-xs bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  + Add Member
                </button>
              </div>

              <div className="border-b border-white/10 mb-3" />

              <table className="w-full text-sm text-center border-collapse">
                <thead className="text-slate-400 text-xs">
                  <tr>
                    <th className="py-2 border-b border-white/10">Name</th>
                    <th className="border-b border-white/10">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-slate-500">
                        No members assigned
                      </td>
                    </tr>
                  )}

                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-2">{m.name}</td>
                      <td>{m.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Activity */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-5">
              <h3 className="text-sm font-semibold mb-3">Activity Log</h3>
              <div className="border-b border-white/10 mb-3" />

              <div className="space-y-3 text-sm">
                {activity.slice(0, visibleCount).map((a) => (
                  <div key={a.id}>
                    <p>
                      <span className="font-medium text-white">
                        {a.user_name}
                      </span>{" "}
                      <span className="text-slate-300">{a.action}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(a.created_at)}
                    </p>
                    <div className="border-b border-white/5 mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MEMBER MODAL */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0f1623] border border-white/10 rounded-lg w-[400px] p-6">
              <h3 className="text-sm font-semibold mb-4">Assign Member</h3>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {workspaceUsers
                  .filter((user) => user.role !== "admin")
                  .map((user) => {
                    const alreadyAssigned = members.some(
                      (m) => m.user_id === user.id
                    );

                    return (
                      <div
                        key={user.id}
                        className="flex justify-between items-center bg-white/5 px-3 py-2 rounded"
                      >
                        <div>
                          <p className="text-sm">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.role}</p>
                        </div>

                        {alreadyAssigned ? (
                          <span className="text-xs text-emerald-400">
                            Assigned
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAssignMember(user)}
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 text-right">
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="text-xs text-slate-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProjectDetail;