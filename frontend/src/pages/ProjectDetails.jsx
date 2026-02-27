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

function ProjectDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [workspaceUsers, setWorkspaceUsers] = useState([]);
  useEffect(() => {
    fetchProject();
  }, [id]);
  
  const fetchWorkspaceUsers = async () => {
    try {
      const res = await api.get("/users");
      setWorkspaceUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleAssignMember = async (user) => {
    try {
      await api.post(`/projects/${id}/members`, {
        user_id: user.id,
        role: "Contributor" 
      });
  
      await fetchProject();
    } catch (err) {
      console.error(err);
    }
  };
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
  } = data;

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-[#0b1220] via-[#0f1623] to-[#0a0f1a] p-6 text-white">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-semibold text-slate-400">
            Project Details
          </h1>

          <button
            onClick={() => {
              fetchWorkspaceUsers();
              setShowMemberModal(true);
            }}
            className="px-3 py-1.5 text-xs bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Add Member
          </button>
        </div>

        <div className="border-b border-white/10 my-4" />

        {/* Project Title */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {project.name}
            </h2>

            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {project.status}
            </span>
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Client: {project.client_name}
            <span className="mx-2">|</span>
            Created: {formatDate(project.created_at)}
            <span className="mx-2">|</span>
            Deadline: {formatDate(project.deadline)}
          </div>
        </div>

        <div className="border-b border-white/10 my-5" />

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-7 space-y-5">

            {/* Overview */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">
                Project Overview
              </h3>

              <div className="border-b border-white/10 mb-3" />

              <p className="text-sm text-slate-300">
                {project.description || "No description added."}
              </p>

              <div className="border-b border-white/10 my-4" />

              <div className="grid grid-cols-2 gap-6 text-sm text-slate-300">
                {/* Requirements */}
                <div>
                  <p className="text-slate-400 mb-2 text-xs">Requirements</p>
                  <ul className="list-disc list-inside space-y-1">
                    {requirements.length === 0 && (
                      <li className="text-slate-500">No requirements yet</li>
                    )}
                    {requirements.map((r) => (
                      <li key={r.id}>{r.title}</li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div>
                  <p className="text-slate-400 mb-2 text-xs">Features</p>
                  <ul className="list-disc list-inside space-y-1">
                    {features.length === 0 && (
                      <li className="text-slate-500">No features yet</li>
                    )}
                    {features.map((f) => (
                      <li key={f.id}>{f.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">
                Milestones & Deadlines
              </h3>

              <div className="border-b border-white/10 mb-3" />

              <table className="w-full text-sm">
                <thead className="text-slate-400 text-xs">
                  <tr>
                    <th className="text-left py-1.5">Milestone</th>
                    <th className="text-left py-1.5">Due</th>
                    <th className="text-left py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {milestones.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-500">
                        No milestones yet
                      </td>
                    </tr>
                  )}

                  {milestones.map((m) => (
                    <tr key={m.id} className="border-t border-white/5">
                      <td className="py-2">{m.title}</td>
                      <td>{formatDate(m.due_date)}</td>
                      <td>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            m.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : m.status === "in_progress"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-3 space-y-5">

            {/* Team */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Team Members</h3>

              <div className="border-b border-white/10 mb-3" />

              <table className="w-full text-sm">
                <thead className="text-slate-400 text-xs">
                  <tr>
                    <th className="text-left py-1.5">Name</th>
                    <th className="text-left py-1.5">Role</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-slate-500">
                        No members assigned
                      </td>
                    </tr>
                  )}

                  {members.map((m) => (
                    <tr key={m.id} className="border-t border-white/5">
                      <td className="py-2">{m.name}</td>
                      <td>{m.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Activity */}
            <div className="bg-[#0f1623] border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Activity Log</h3>

              <div className="border-b border-white/10 mb-3" />

              <div className="space-y-3 text-sm">
                {activity.slice(0, visibleCount).map((a) => (
                  <Activity
                    key={a.id}
                    name={a.user_name}
                    text={a.action}
                    time={formatDate(a.created_at)}
                  />
                ))}

                {visibleCount < activity.length && (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className="text-indigo-400 text-sm hover:text-indigo-300 mt-2"
                  >
                    Load More
                  </button>
                )}
              </div>
            </div>
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
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Activity({ name, text, time }) {
  return (
    <div>
      <p className="text-sm">
        <span className="font-medium text-white">{name}</span>{" "}
        <span className="text-slate-300">{text}</span>
      </p>
      <p className="text-xs text-slate-500">{time}</p>
      <div className="border-b border-white/5 mt-2" />
    </div>
  );
}

export default ProjectDetail;