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
      total_amount,
      status,
      start_date,
      deadline
    } = req.body;

    if (!name || !client_id || total_amount == null || !start_date || !deadline) {
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
        total_amount, status, start_date, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        client_id,
        workspaceId,
        total_amount,
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
          (p.total_amount - IFNULL(SUM(pay.amount),0)) AS remaining_amount
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
  
      const [existing] = await pool.query(
        "SELECT * FROM projects WHERE id = ? AND workspace_id = ?",
        [id, workspaceId]
      );
  
      if (existing.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      const project = existing[0];
  
      await pool.query(
        `UPDATE projects
         SET name=?, description=?, status=?, start_date=?, deadline=?
         WHERE id=? AND workspace_id=?`,
        [
          name || project.name,
          description || project.description,
          status || project.status,
          start_date || project.start_date,
          deadline || project.deadline,
          id,
          workspaceId
        ]
      );
  
      res.json({ message: "Project updated successfully" });
  
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.deleteProject = async (req, res) => {
    try {
      const { id } = req.params;
  
      const workspaceId =
        req.user.role === "admin"
          ? req.user.id
          : req.user.owner_id;
  
      const [result] = await pool.query(
        "DELETE FROM projects WHERE id = ? AND workspace_id = ?",
        [id, workspaceId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.json({ message: "Project deleted successfully" });
  
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.getProjects = async (req, res) => {
    try {
      const workspaceId =
        req.user.role === "admin"
          ? req.user.id
          : req.user.owner_id;
  
      const [projects] = await pool.query(
        `SELECT 
            p.*,
            c.name AS client_name,
            IFNULL(SUM(pay.amount), 0) AS total_paid,
            SUM(CASE 
                  WHEN pay.payment_type = 'advance'
                       AND pay.status = 'paid'
                  THEN pay.amount ELSE 0 
                END) AS advance_paid,
            (p.total_amount - IFNULL(SUM(pay.amount), 0)) AS remaining_amount
         FROM projects p
         JOIN clients c ON p.client_id = c.id
         LEFT JOIN payments pay 
           ON pay.project_id = p.id 
           AND pay.status = 'paid'
         WHERE p.workspace_id = ?
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [workspaceId]
      );
  
      res.json(projects);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };