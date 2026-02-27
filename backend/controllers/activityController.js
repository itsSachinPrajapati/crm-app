const pool = require("../config/db");

exports.getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [rows] = await pool.query(
      `SELECT a.id,
              a.action,
              a.metadata,
              a.created_at,
              u.name AS user_name
       FROM project_activity_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.project_id = ?
       ORDER BY a.created_at DESC`,
      [projectId]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};