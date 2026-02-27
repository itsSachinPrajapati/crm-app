import { useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import api from "../services/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";

const TABS = [
  { id: "Profile", icon: "👤" },
  { id: "Team", icon: "👥" },
  { id: "Security", icon: "🔒" },
];

function Settings() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [profile, setProfile] = useState({ name: "", email: "" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    api.get("/users/me").then((res) => {
      setProfile(res.data);
    });
  }, []);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const handleProfileSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg("");
  
      await api.put("/users/me", profile);
  
      // Immediately update local state (already updated via input)
      setSuccessMsg("Profile updated successfully");
  
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
    const [teamList, setTeamList] = useState([]);
    const [creating, setCreating] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
      name: "",
      email: "",
      password: ""
    });
    useEffect(() => {
      if (activeTab === "Team") {
        fetchTeam();
      }
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
        setOpen(false); // CLOSE DIALOG
    
      } catch (err) {
        console.log(err);
      } finally {
        setCreating(false);
      }
    };
  const [open, setOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: ""
  });
  
  const [passwordMsg, setPasswordMsg] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  return (
    <DashboardLayout>
      <div className="min-h-screen px-8 py-10 space-y-8 bg-[#080e1a]">

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-4 gap-8 items-start">

          {/* LEFT SIDEBAR */}
          <div className="col-span-1 space-y-1 bg-[#0c1320] border border-white/5 rounded-2xl p-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-3 pt-2 pb-1">
              Account
            </p>

            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                {tab.id}
              </button>
            ))}

            {/* Logout Section */}
            <div className="pt-3 mt-3 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
              >
                <span className="text-base leading-none">→</span>
                Logout
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="col-span-2 max-w-3xl bg-[#0c1320] border border-white/5 rounded-2xl p-2">

            {activeTab === "Profile" && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                  <p className="text-slate-400 text-sm mt-1">Update your name and email address.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Full Name
                    </label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-[#141b26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email Address
                    </label>
                    <input
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full bg-[#141b26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleProfileSave}
                    disabled={saving}
                    className="bg-white text-black hover:bg-slate-200 font-semibold px-6 py-2.5 rounded-xl text-sm transition"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  {successMsg && (
                    <p className="text-green-400 text-sm mt-2">{successMsg}</p>
                    )}
                </div>
              </div>
            )}

{activeTab === "Team" && (
  <div className="space-y-6 max-w-2xl">

    <div>
      <h2 className="text-lg font-semibold text-white">
        Team Members
      </h2>
      <p className="text-slate-400 text-sm mt-1">
        Invite and manage your team.
      </p>
    </div>

    {/* Employee List */}
    {teamList.length === 0 ? (
      <p className="text-slate-400 text-sm">
        No team members yet
      </p>
    ) : (
      <div className="space-y-3">
        {teamList.map((member) => (
          <div
            key={member.id}
            className="flex justify-between items-center bg-[#141b26] p-4 rounded-xl"
          >
            <div>
              <p className="text-white font-medium">
                {member.name}
              </p>
              <p className="text-slate-400 text-sm">
                {member.email}
              </p>
            </div>
            <span className="text-xs text-slate-400 uppercase">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Add Employee Button BELOW list */}
    <Dialog 
    open={open} onOpenChange={(value) => { setOpen(value); if (value) { // Reset form every time dialog opens 
    setNewEmployee({ name: "", email: "", password: "" }); } }} >
      <DialogTrigger asChild>
        <Button className="bg-white text-black hover:bg-slate-200 font-semibold px-5 py-2.5 rounded-xl text-sm">
          + Add Employee 👥
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#0c1320] border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Create a new team member for your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          <input
            required
            autoComplete="off"
            placeholder="Full Name"
            value={newEmployee.name}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, name: e.target.value })
            }
            className="w-full bg-[#141b26] border border-white/10 px-4 py-2 rounded-lg text-sm"
          />

          <input
            required
            autoComplete="off"
            type="email"
            placeholder="Email"
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
            className="w-full bg-[#141b26] border border-white/10 px-4 py-2 rounded-lg text-sm"
          />

          <input
            required
            autoComplete="off"
            type="password"
            placeholder="Password"
            value={newEmployee.password}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, password: e.target.value })
            }
            className="w-full bg-[#141b26] border border-white/10 px-4 py-2 rounded-lg text-sm"
          />

        </div>

        <DialogFooter>
          <Button
            disabled={
              creating ||
              !newEmployee.name ||
              !newEmployee.email ||
              !newEmployee.password
            }
            onClick={handleCreateTeam}
            className="bg-white text-black"
          >
            {creating ? "Creating..." : "Create Employee"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>

  </div>
)}

            {activeTab === "Security" && (
              <div className="space-y-6 max-w-sm">
                <div>
                  <h2 className="text-lg font-semibold text-white">Change Password</h2>
                  <p className="text-slate-400 text-sm mt-1">Make sure your account stays secure.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full bg-[#141b26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                    />

                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full bg-[#141b26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
/>
                  </div>
                </div>

                <div className="pt-2">
                <Button
                  disabled={updatingPassword}
                  onClick={async () => {
                    try {
                      setUpdatingPassword(true);
                      setPasswordMsg("");

                      await api.put("/users/change-password", passwordData);

                      setPasswordMsg("Password updated successfully");
                      setPasswordData({ currentPassword: "", newPassword: "" });

                    } catch (err) {
                      setPasswordMsg(
                        err.response?.data?.message || "Error updating password"
                      );
                    } finally {
                      setUpdatingPassword(false);
                    }
                  }}
                  className="bg-white text-black hover:bg-slate-200 font-semibold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  {updatingPassword ? "Updating..." : "Update Password"}
                </Button>

                {passwordMsg && (
                  <p className="text-sm mt-2 text-green-400">{passwordMsg}</p>
                  )}
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