const pool = require("../config/db");

// Create Feature
exports.createFeature = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    await pool.query(
      `INSERT INTO project_features (project_id, title, created_by)
       VALUES (?, ?, ?)`,
      [projectId, title, req.user.id]
    );

    res.json({ message: "Feature added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Features
exports.getFeatures = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [features] = await pool.query(
      `SELECT * FROM project_features
       WHERE project_id = ?
       ORDER BY created_at DESC`,
      [projectId]
    );

    res.json(features);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Feature
exports.deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM project_features WHERE id = ?`,
      [id]
    );

    res.json({ message: "Feature deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};