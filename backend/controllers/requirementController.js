const pool = require("../config/db");

/**
 * CREATE REQUIREMENT
 */
exports.createRequirement = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    // Validate project belongs to workspace
    const [project] = await pool.query(
      "SELECT id FROM projects WHERE id = ? AND owner_id = ?",
      [projectId, workspaceId]
    );

    if (project.length === 0) {
      return res.status(403).json({ message: "Unauthorized project access" });
    }

    const [result] = await pool.query(
      `INSERT INTO project_requirements
       (project_id, title, description, created_by)
       VALUES (?, ?, ?, ?)`,
      [projectId, title, description || null, req.user.id]
    );

    // Log activity
    await pool.query(
      `INSERT INTO project_activity_logs
       (project_id, user_id, action)
       VALUES (?, ?, ?)`,
      [projectId, req.user.id, `Added requirement: ${title}`]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      status: "pending"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET REQUIREMENTS
 */
exports.getRequirements = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [rows] = await pool.query(
      `SELECT r.*,
              u.name AS created_by_name
       FROM project_requirements r
       JOIN users u ON r.created_by = u.id
       WHERE r.project_id = ?
       ORDER BY r.created_at DESC`,
      [projectId]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * UPDATE REQUIREMENT DETAILS
 */
exports.updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const [requirement] = await pool.query(
      "SELECT * FROM project_requirements WHERE id = ?",
      [id]
    );

    if (requirement.length === 0) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    await pool.query(
      `UPDATE project_requirements
       SET title = ?, description = ?
       WHERE id = ?`,
      [title, description, id]
    );

    res.json({ message: "Requirement updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * UPDATE REQUIREMENT STATUS
 */
exports.updateRequirementStatus = async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "in_progress", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [requirement] = await pool.query(
      "SELECT title FROM project_requirements WHERE id = ?",
      [id]
    );

    if (requirement.length === 0) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    await pool.query(
      "UPDATE project_requirements SET status = ? WHERE id = ?",
      [status, id]
    );

    // Log activity
    await pool.query(
      `INSERT INTO project_activity_logs
       (project_id, user_id, action)
       VALUES (?, ?, ?)`,
      [projectId, req.user.id,
       `Updated requirement "${requirement[0].title}" to ${status}`]
    );

    res.json({ message: "Requirement status updated" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * DELETE REQUIREMENT
 */
exports.deleteRequirement = async (req, res) => {
  try {
    const { projectId, id } = req.params;

    const [requirement] = await pool.query(
      "SELECT title FROM project_requirements WHERE id = ?",
      [id]
    );

    if (requirement.length === 0) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    await pool.query(
      "DELETE FROM project_requirements WHERE id = ?",
      [id]
    );

    await pool.query(
      `INSERT INTO project_activity_logs
       (project_id, user_id, action)
       VALUES (?, ?, ?)`,
      [projectId, req.user.id,
       `Deleted requirement: ${requirement[0].title}`]
    );

    res.json({ message: "Requirement deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};