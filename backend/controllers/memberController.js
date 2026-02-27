const pool = require("../config/db");

/**
 * ADD MEMBER TO PROJECT
 */
exports.addMember = async (req, res) => {
    try {
      const { projectId } = req.params;
      const { user_id, role } = req.body;
  
      const workspaceId =
        req.user.role === "admin"
          ? req.user.id
          : req.user.owner_id;
  
      // 1️⃣ Check project
      const [project] = await pool.query(
        "SELECT id FROM projects WHERE id = ? AND owner_id = ?",
        [projectId, workspaceId]
      );
  
      if (project.length === 0) {
        return res.status(403).json({ message: "Unauthorized project access" });
      }
  
      // 2️⃣ Check user in same workspace
      const [user] = await pool.query(
        `SELECT id FROM users 
         WHERE id = ? 
         AND (id = ? OR owner_id = ?)`,
        [user_id, workspaceId, workspaceId]
      );
  
      if (user.length === 0) {
        return res.status(403).json({ message: "User not in same workspace" });
      }
  
      // 3️⃣ Check duplicate manually (clean error instead of DB crash)
      const [existing] = await pool.query(
        "SELECT id FROM project_members WHERE project_id = ? AND user_id = ?",
        [projectId, user_id]
      );
  
      if (existing.length > 0) {
        return res.status(400).json({ message: "User already assigned to this project" });
      }
  
      // 4️⃣ Insert
      await pool.query(
        `INSERT INTO project_members 
         (project_id, user_id, role, assigned_by)
         VALUES (?, ?, ?, ?)`,
        [projectId, user_id, role || "member", req.user.id]
      );
  
      // 5️⃣ Log
      await pool.query(
        `INSERT INTO project_activity_logs 
         (project_id, user_id, action)
         VALUES (?, ?, ?)`,
        [projectId, req.user.id, `Added user ${user_id} to project`]
      );
  
      res.status(201).json({ message: "Member added successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.getMembers = async (req, res) => {
    try {
      const { projectId } = req.params;
  
      const [rows] = await pool.query(
        `SELECT pm.id,
                u.id AS user_id,
                u.name,
                u.email,
                pm.role,
                pm.assigned_at
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = ?`,
        [projectId]
      );
  
      res.json(rows);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.updateMemberRole = async (req, res) => {
    try {
      const { projectId, memberId } = req.params;
      const { role } = req.body;
  
      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }
  
      const [member] = await pool.query(
        "SELECT * FROM project_members WHERE id = ? AND project_id = ?",
        [memberId, projectId]
      );
  
      if (member.length === 0) {
        return res.status(404).json({ message: "Member not found" });
      }
  
      await pool.query(
        "UPDATE project_members SET role = ? WHERE id = ?",
        [role, memberId]
      );
  
      await pool.query(
        `INSERT INTO project_activity_logs (project_id, user_id, action)
         VALUES (?, ?, ?)`,
        [projectId, req.user.id, `Updated member role to ${role}`]
      );
  
      res.json({ message: "Member role updated" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.removeMember = async (req, res) => {
    try {
      const { projectId, memberId } = req.params;
  
      const [member] = await pool.query(
        "SELECT * FROM project_members WHERE id = ? AND project_id = ?",
        [memberId, projectId]
      );
  
      if (member.length === 0) {
        return res.status(404).json({ message: "Member not found" });
      }
  
      await pool.query(
        "DELETE FROM project_members WHERE id = ?",
        [memberId]
      );
  
      await pool.query(
        `INSERT INTO project_activity_logs (project_id, user_id, action)
         VALUES (?, ?, ?)`,
        [projectId, req.user.id, "Removed member from project"]
      );
  
      res.json({ message: "Member removed successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };