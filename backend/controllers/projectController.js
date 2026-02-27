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
      advance_amount,
      status,
      start_date,
      deadline
    } = req.body;

    // ✅ Strict validation
    if (
      !name ||
      !client_id ||
      total_amount == null ||
      advance_amount == null ||
      !start_date ||
      !deadline
    ) {
      return res.status(400).json({
        message: "All required financial and timeline fields must be filled"
      });
    }

    if (Number(advance_amount) > Number(total_amount)) {
      return res.status(400).json({
        message: "Advance amount cannot exceed total amount"
      });
    }

    const remaining_amount =
      Number(total_amount) - Number(advance_amount);

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    // Validate client belongs to workspace
    const [client] = await pool.query(
      "SELECT id FROM clients WHERE id = ? AND user_id = ?",
      [client_id, workspaceId]
    );

    if (client.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO projects
       (name, description, client_id, workspace_id,
        total_amount, advance_amount, remaining_amount,
        status, start_date, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        client_id,
        workspaceId,
        total_amount,
        advance_amount,
        remaining_amount,
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


  exports.getProjects = async (req, res) => {
    try {
      const workspaceId =
        req.user.role === "admin"
          ? req.user.id
          : req.user.owner_id;
  
      const [projects] = await pool.query(
        `SELECT p.*, c.name AS client_name
         FROM projects p
         JOIN clients c ON p.client_id = c.id
         WHERE p.workspace_id = ?
         ORDER BY p.created_at DESC`,
        [workspaceId]
      );
  
      res.json(projects);
  
    } catch (error) {
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

  exports.getFullProject = async (req, res) => {
    try {
      const { id } = req.params;
  
      const workspaceId =
        req.user.role === "admin"
          ? req.user.id
          : req.user.owner_id;
  
      // Project (workspace secured)
      const [project] = await pool.query(
        `SELECT p.*, c.name AS client_name
         FROM projects p
         LEFT JOIN clients c ON p.client_id = c.id
         WHERE p.id = ? AND p.workspace_id = ?`,
        [id, workspaceId]
      );
  
      if (project.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      // Requirements
      const [requirements] = await pool.query(
        `SELECT * FROM project_requirements
         WHERE project_id = ?
         ORDER BY created_at DESC`,
        [id]
      );
  
      // Features
      const [features] = await pool.query(
        `SELECT id, title
         FROM project_features
         WHERE project_id = ?
         ORDER BY created_at DESC`,
        [id]
      );
  
      // Milestones
      const [milestones] = await pool.query(
        `SELECT * FROM project_milestones
         WHERE project_id = ?
         ORDER BY created_at DESC`,
        [id]
      );
  
      // Members
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
  
      // Activity (ordered newest first)
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
  
      res.json({
        project: project[0],
        requirements,
        features,
        milestones,
        members,
        activity
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };