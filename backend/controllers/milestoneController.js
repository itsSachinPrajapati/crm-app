const pool = require("../config/db");

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

    // Check project exists
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

    // 🔥 Log activity
    await pool.query(
      `INSERT INTO project_activity_logs 
       (project_id, user_id, action)
       VALUES (?, ?, ?)`,
      [projectId, req.user.id, `Created milestone: ${title}`]
    );

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
exports.updateMilestoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "in_progress", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await pool.query(
      "UPDATE project_milestones SET status = ? WHERE id = ?",
      [status, id]
    );

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
    const { id } = req.params;

    await pool.query(
      "DELETE FROM project_milestones WHERE id = ?",
      [id]
    );

    res.json({ message: "Milestone deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMilestoneStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { projectId } = req.params;
  
      const allowed = ["pending", "in_progress", "completed"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
  
      // Get milestone title first
      const [milestone] = await pool.query(
        "SELECT title FROM project_milestones WHERE id = ?",
        [id]
      );
  
      if (milestone.length === 0) {
        return res.status(404).json({ message: "Milestone not found" });
      }
  
      await pool.query(
        "UPDATE project_milestones SET status = ? WHERE id = ?",
        [status, id]
      );
  
    
      await pool.query(
        `INSERT INTO project_activity_logs (project_id, user_id, action)
         VALUES (?, ?, ?)`,
        [projectId, req.user.id, `Updated milestone "${milestone[0].title}" to ${status}`]
      );
  
      res.json({ message: "Milestone updated successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };