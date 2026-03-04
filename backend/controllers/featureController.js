const pool = require("../config/db");
const { logProjectActivity } = require("../utils/activityLogger");

// Create Feature
exports.createFeature = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const [result] = await pool.query(
      `INSERT INTO project_features (project_id, title, created_by)
       VALUES (?, ?, ?)`,
      [projectId, title, req.user.id]
    );

    // Structured logging
    await logProjectActivity({
      projectId,
      userId: req.user.id,
      actionType: "FEATURE_ADDED",
      metadata: { title },
    });

    res.json({
      id: result.insertId,
      message: "Feature added successfully",
    });

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
    const { projectId, id } = req.params;

    const [feature] = await pool.query(
      `SELECT title FROM project_features WHERE id = ?`,
      [id]
    );

    if (feature.length === 0) {
      return res.status(404).json({ message: "Feature not found" });
    }

    await pool.query(
      `DELETE FROM project_features WHERE id = ?`,
      [id]
    );

    await logProjectActivity({
      projectId,
      userId: req.user.id,
      actionType: "FEATURE_DELETED",
      metadata: {
        title: feature[0].title,
      },
    });

    res.json({ message: "Feature deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};