import { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../services/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all duration-200";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs text-slate-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function SaveButton({ onClick, disabled, label, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
    >
      {loading && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {label}
    </button>
  );
}

function SuccessMsg({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 rounded-lg">
      <span>✓</span> {msg}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function Settings() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [profile, setProfile] = useState({ name: "", email: "" });
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const TABS = [
    { id: "Profile", icon: "👤" },
    ...(isAdmin ? [{ id: "Team", icon: "👥" }] : []),
    { id: "Security", icon: "🔒" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    api.get("/users/me").then((res) => setProfile(res.data));
  }, []);

  // ── Profile ──
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg("");
      await api.put("/users/me", profile);
      setSuccessMsg("Profile updated successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Team ──
  const [teamList, setTeamList] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", password: "" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "Team") fetchTeam();
  }, [activeTab]);

  const fetchTeam = async () => {
    try {
      const res = await api.get("/users/team");
      setTeamList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setCreating(true);
      await api.post("/users/team", newEmployee);
      await fetchTeam();
      setNewEmployee({ name: "", email: "", password: "" });
      setOpen(false);
    } catch (err) {
      console.log(err);
    } finally {
      setCreating(false);
    }
  };

  // ── Security ──
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handlePasswordUpdate = async () => {
    try {
      setUpdatingPassword(true);
      setPasswordMsg("");
      await api.put("/users/change-password", passwordData);
      setPasswordMsg("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || "Error updating password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const avatarInitial = profile.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#080c12] px-6 py-6 text-white">

        {/* ── Header ── */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your account preferences</p>
          <div className="mt-4 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        </div>

        <div className="grid grid-cols-4 gap-5 items-start">

          {/* ── Sidebar ── */}
          <div className="col-span-1 bg-[#0d1117] border border-white/[0.07] rounded-xl p-3 shadow-xl shadow-black/20">

            {/* User identity */}
            <div className="flex items-center gap-3 px-3 py-3 mb-3 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile.name || "—"}</p>
                <p className="text-xs text-slate-500 truncate">{profile.email || "—"}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 uppercase tracking-widest px-3 mb-2">Account</p>

            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-sm leading-none">{tab.icon}</span>
                {tab.id}
              </button>
            ))}

            <div className="pt-3 mt-3 border-t border-white/[0.06]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all duration-150"
              >
                <span className="text-sm">→</span>
                Logout
              </button>
            </div>
          </div>

          {/* ── Content panel ── */}
          <div className="col-span-3 bg-[#0d1117] border border-white/[0.07] rounded-xl p-6 shadow-xl shadow-black/20">

            {/* ── Profile Tab ── */}
            {activeTab === "Profile" && (
              <div className="max-w-md space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-white">Profile Information</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Update your name and email address.</p>
                </div>

                <div className="h-px bg-white/[0.06]" />

                <div className="space-y-4">
                  <Field label="Full Name">
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <SaveButton onClick={handleProfileSave} disabled={saving} loading={saving} label={saving ? "Saving..." : "Save Changes"} />
                  <SuccessMsg msg={successMsg} />
                </div>
              </div>
            )}

            {/* ── Team Tab ── */}
            {activeTab === "Team" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-white">Team Members</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Invite and manage your team.</p>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {teamList.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-2 text-slate-600">
                    <span className="text-3xl">👥</span>
                    <p className="text-sm">No team members yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teamList.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center bg-white/[0.025] border border-white/[0.05] px-4 py-3 rounded-xl hover:border-white/[0.09] transition-all duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {member.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full capitalize">{member.role}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Employee Dialog */}
                <Dialog
                  open={open}
                  onOpenChange={(value) => {
                    setOpen(value);
                    if (value) setNewEmployee({ name: "", email: "", password: "" });
                  }}
                >
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200 flex items-center gap-2">
                      + Add Employee
                    </button>
                  </DialogTrigger>

                  <DialogContent className="bg-[#0d1117] border border-white/[0.08] text-white rounded-2xl max-w-sm shadow-2xl shadow-black/60">
                    <DialogHeader>
                      <DialogTitle className="text-base">Add Employee</DialogTitle>
                      <DialogDescription className="text-xs text-slate-500">
                        Create a new team member for your workspace.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-1">
                      {[
                        { placeholder: "Full Name", key: "name", type: "text" },
                        { placeholder: "Email", key: "email", type: "email" },
                        { placeholder: "Password", key: "password", type: "password" },
                      ].map(({ placeholder, key, type }) => (
                        <input
                          key={key}
                          type={type}
                          placeholder={placeholder}
                          autoComplete="off"
                          value={newEmployee[key]}
                          onChange={(e) => setNewEmployee({ ...newEmployee, [key]: e.target.value })}
                          className={inputCls}
                        />
                      ))}
                    </div>

                    <DialogFooter>
                      <button
                        disabled={creating || !newEmployee.name || !newEmployee.email || !newEmployee.password}
                        onClick={handleCreateTeam}
                        className="w-full py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {creating && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {creating ? "Creating..." : "Create Employee"}
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === "Security" && (
              <div className="max-w-sm space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-white">Change Password</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Make sure your account stays secure.</p>
                </div>

                <div className="h-px bg-white/[0.06]" />

                <div className="space-y-4">
                  <Field label="Current Password">
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="New Password">
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <SaveButton
                    onClick={handlePasswordUpdate}
                    disabled={updatingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                    loading={updatingPassword}
                    label={updatingPassword ? "Updating..." : "Update Password"}
                  />
                  {passwordMsg && (
                    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
                      passwordMsg.includes("success")
                        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                        : "text-red-400 bg-red-400/10 border-red-400/20"
                    }`}>
                      <span>{passwordMsg.includes("success") ? "✓" : "✕"}</span>
                      {passwordMsg}
                    </div>
                  )}
                </div>

                {/* Danger zone */}
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <p className="text-xs text-slate-600 uppercase tracking-widest mb-3">Danger Zone</p>
                  <div className="bg-red-400/5 border border-red-400/15 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-400 font-medium">Sign out of account</p>
                      <p className="text-xs text-slate-600 mt-0.5">You'll be redirected to login.</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 rounded-lg transition-all duration-150"
                    >
                      Logout
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

export default Settings;