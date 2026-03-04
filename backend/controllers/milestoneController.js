const pool = require("../config/db");
const { logProjectActivity } = require("../utils/activityLogger");

/**
 * CREATE MILESTONE
 */
exports.createMilestone = async (req, res) => {
  try {
    const { title, description, due_date } = req.body;
    const { projectId } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const [project] = await pool.query(
      "SELECT id FROM projects WHERE id = ?",
      [projectId]
    );

    if (project.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const [result] = await pool.query(
      `INSERT INTO project_milestones 
       (project_id, title, description, due_date, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [projectId, title, description || null, due_date || null, req.user.id]
    );

    await logProjectActivity({
      projectId,
      userId: req.user.id,
      actionType: "MILESTONE_CREATED",
      metadata: { title }
    });

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      due_date,
      status: "pending"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET ALL MILESTONES
 */
exports.getMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [rows] = await pool.query(
      `SELECT m.*, u.name AS created_by_name
       FROM project_milestones m
       JOIN users u ON m.created_by = u.id
       WHERE m.project_id = ?
       ORDER BY m.created_at DESC`,
      [projectId]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * UPDATE MILESTONE STATUS
 */

/**
 * UPDATE MILESTONE (ALL FIELDS)
 */
exports.updateMilestone = async (req, res) => {
  try {
    const { id, projectId } = req.params;
    const { title, due_date, status } = req.body;

    const allowedStatus = ["pending", "in_progress", "completed"];

    const [milestone] = await pool.query(
      `SELECT * FROM project_milestones
       WHERE id = ? AND project_id = ?`,
      [id, projectId]
    );

    if (milestone.length === 0) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    const current = milestone[0];

    // Validate status if provided
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await pool.query(
      `UPDATE project_milestones
       SET title = ?,
           due_date = ?,
           status = ?
       WHERE id = ? AND project_id = ?`,
      [
        title ?? current.title,
        due_date ?? current.due_date,
        status ?? current.status,
        id,
        projectId
      ]
    );

    await logProjectActivity({
      projectId,
      userId: req.user.id,
      actionType: "MILESTONE_UPDATED",
      metadata: {
        title: title ?? current.title,
        status: status ?? current.status
      }
    });

    res.json({ message: "Milestone updated successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * DELETE MILESTONE
 */
exports.deleteMilestone = async (req, res) => {
  try {
    const { id, projectId } = req.params;

    const [milestone] = await pool.query(
      `SELECT title FROM project_milestones 
       WHERE id = ? AND project_id = ?`,
      [id, projectId]
    );

    if (milestone.length === 0) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    await pool.query(
      `DELETE FROM project_milestones WHERE id = ?`,
      [id]
    );

    await logProjectActivity({
      projectId,
      userId: req.user.id,
      actionType: "MILESTONE_DELETED",
      metadata: { title: milestone[0].title }
    });

    res.json({ message: "Milestone deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};