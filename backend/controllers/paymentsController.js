const pool = require("../config/db");

/*
=========================
CREATE PAYMENT
=========================
*/
exports.createPayment = async (req, res) => {
  try {
    const { project_id, amount, payment_type } = req.body;

    if (!project_id || !amount) {
      return res.status(400).json({
        message: "Project and amount required"
      });
    }

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [project] = await pool.query(
      "SELECT id FROM projects WHERE id = ? AND workspace_id = ?",
      [project_id, workspaceId]
    );

    if (project.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    await pool.query(
      `INSERT INTO payments
       (project_id, workspace_id, amount, payment_type, status, payment_date)
       VALUES (?, ?, ?, ?, 'paid', CURDATE())`,
      [
        project_id,
        workspaceId,
        amount,
        payment_type || "milestone"
      ]
    );

    res.json({ message: "Payment recorded successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*
=========================
GET PAYMENTS BY PROJECT
=========================
*/
exports.getProjectPayments = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [payments] = await pool.query(
      `SELECT *
       FROM payments
       WHERE project_id = ?
       AND workspace_id = ?
       ORDER BY created_at DESC`,
      [id, workspaceId]
    );

    res.json(payments);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};