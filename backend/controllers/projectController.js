const pool = require("../config/db");

// =======================
// CREATE PROJECT
// =======================
exports.createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      client_id,
      budget,
      status,
      start_date,
      deadline
    } = req.body;

    if (!name || !client_id || budget == null || !start_date || !deadline) {
      return res.status(400).json({
        message: "All required fields must be filled"
      });
    }

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [client] = await pool.query(
      "SELECT id FROM clients WHERE id = ? AND workspace_id = ?",
      [client_id, workspaceId]
    );

    if (client.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO projects
       (name, description, client_id, workspace_id,
        budget, status, start_date, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        client_id,
        workspaceId,
        budget,
        status || "active",
        start_date,
        deadline
      ]
    );

    res.status(201).json({
      message: "Project created successfully",
      projectId: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
=========================
GET FULL PROJECT (Dynamic Financials)
=========================
*/
exports.getFullProject = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    // 🔹 Project with Financials
    const [project] = await pool.query(
      `SELECT 
          p.*,
          c.name AS client_name,
          IFNULL(SUM(pay.amount),0) AS total_paid,
          (p.budget - IFNULL(SUM(pay.amount),0)) AS remaining_amount
       FROM projects p
       LEFT JOIN clients c ON p.client_id = c.id
       LEFT JOIN payments pay 
         ON pay.project_id = p.id 
         AND pay.status = 'paid'
       WHERE p.id = ? AND p.workspace_id = ?
       GROUP BY p.id`,
      [id, workspaceId]
    );

    if (project.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔹 Requirements
    const [requirements] = await pool.query(
      `SELECT * FROM project_requirements
       WHERE project_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    // 🔹 Features
    const [features] = await pool.query(
      `SELECT id, title
       FROM project_features
       WHERE project_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    // 🔹 Milestones
    const [milestones] = await pool.query(
      `SELECT * FROM project_milestones
       WHERE project_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    // 🔹 Members
    const [members] = await pool.query(
      `SELECT pm.id,
              pm.user_id,
              u.name,
              u.email,
              pm.role,
              pm.assigned_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?`,
      [id]
    );

    // 🔹 Activity
    const [activity] = await pool.query(
      `SELECT 
          a.id,
          a.project_id,
          a.user_id,
          a.action,
          a.metadata,
          a.created_at,
          u.name AS user_name
       FROM project_activity_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.project_id = ?
       ORDER BY a.created_at DESC`,
      [id]
    );
    // 🔹 Payments
    const [payments] = await pool.query(
      `SELECT id, amount, payment_type, status, payment_date, created_at
      FROM payments
      WHERE project_id = ?
      AND workspace_id = ?
      ORDER BY payment_date DESC`,
      [id, workspaceId]
    );

    res.json({
      project: project[0],
      requirements,
      features,
      milestones,
      members,
      activity,
      payments
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const workspaceId =
        req.user.role === "admin"
          ? req.user.id
          : req.user.owner_id;
  
      const [project] = await pool.query(
        `SELECT * FROM projects 
         WHERE id = ? AND workspace_id = ?`,
        [id, workspaceId]
      );
  
      if (project.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.json(project[0]);
  
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.updateProject = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, status, start_date, deadline } = req.body;
  
      const workspaceId =
        req.user.role === "admin"
          ? req.user.id
          : req.user.owner_id;
  
      // 🔍 Check if project exists
      const [existing] = await pool.query(
        "SELECT * FROM projects WHERE id = ? AND workspace_id = ?",
        [id, workspaceId]
      );
  
      if (existing.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      const project = existing[0];
  
      // ====================================================
      // 👤 EMPLOYEE LOGIC
      // ====================================================
      if (req.user.role === "employee") {
  
        // ❌ Block if trying to modify other fields
        if (
          (name && name !== project.name) ||
          (description && description !== project.description) ||
          (status && status !== project.status) ||
          (start_date && start_date !== project.start_date?.toISOString()?.split("T")[0])
        ) {
          return res.status(403).json({
            message: "You are not allowed to update these fields"
          });
        }
  
        if (!deadline) {
          return res.status(400).json({
            message: "Deadline is required"
          });
        }
  
        const currentDeadline = new Date(project.deadline);
        const newDeadline = new Date(deadline);
        const today = new Date();
  
        // Normalize time
        currentDeadline.setHours(0, 0, 0, 0);
        newDeadline.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
  
        // ❌ Cannot shorten or keep same
        if (newDeadline <= currentDeadline) {
          return res.status(400).json({
            message: "Deadline can only be extended forward"
          });
        }
  
        // ❌ Cannot set in past
        if (newDeadline < today) {
          return res.status(400).json({
            message: "Deadline cannot be set in the past"
          });
        }
  
        await pool.query(
          `UPDATE projects
           SET deadline = ?
           WHERE id = ? AND workspace_id = ?`,
          [deadline, id, workspaceId]
        );
  
        return res.json({
          message: "Deadline extended successfully"
        });
      }
  
      // ====================================================
      // 👑 ADMIN LOGIC
      // ====================================================
  
      await pool.query(
        `UPDATE projects
         SET name = ?,
             description = ?,
             status = ?,
             start_date = ?,
             deadline = ?
         WHERE id = ? AND workspace_id = ?`,
        [
          name ?? project.name,
          description ?? project.description,
          status ?? project.status,
          start_date ?? project.start_date,
          deadline ?? project.deadline,
          id,
          workspaceId
        ]
      );
  
      res.json({ message: "Project updated successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

exports.deleteProject = async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete projects"
      });
    }

    const { id } = req.params;

    const workspaceId = req.user.id;

    const [result] = await pool.query(
      "DELETE FROM projects WHERE id = ? AND workspace_id = ?",
      [id, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
  exports.getProjects = async (req, res) => {
    try {
      const workspaceId =
        req.user.role === "admin"
          ? req.user.id
          : req.user.owner_id;
  
      const { search = "", page = 1, limit = 10 } = req.query;
  
      const offset = (page - 1) * limit;
  
      // 🔹 Get paginated projects
      const [projects] = await pool.query(
        `SELECT 
            p.*,
            c.name AS client_name,
            IFNULL(SUM(pay.amount), 0) AS total_paid,
            (p.budget - IFNULL(SUM(pay.amount), 0)) AS remaining_amount
         FROM projects p
         JOIN clients c ON p.client_id = c.id
         LEFT JOIN payments pay 
           ON pay.project_id = p.id 
           AND pay.status = 'paid'
         WHERE p.workspace_id = ?
           AND p.name LIKE ?
         GROUP BY p.id
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [
          workspaceId,
          `%${search}%`,
          Number(limit),
          Number(offset)
        ]
      );
  
      // 🔹 Total count (for pagination)
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total
         FROM projects
         WHERE workspace_id = ?
           AND name LIKE ?`,
        [workspaceId, `%${search}%`]
      );

      const [stats] = await pool.query(
        `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as totalActive,
           SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as totalCompleted
         FROM projects
         WHERE workspace_id = ?`,
        [workspaceId]
      );
  
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);
  
      res.json({
        projects,
        total: stats[0].total,
        totalActive: stats[0].totalActive || 0,
        totalCompleted: stats[0].totalCompleted || 0,
        page: Number(page),
        totalPages
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };