const pool = require("../config/db");

/*
=========================
CREATE PAYMENT
=========================
*/
exports.createPayment = async (req, res) => {
  try {
    const { project_id, amount, payment_type, status, payment_date } = req.body;

    if (!project_id || !amount) {
      return res.status(400).json({ message: "Project and amount required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    // 1️⃣ FIRST get project
    const [projectRows] = await pool.query(
      "SELECT budget FROM projects WHERE id = ? AND workspace_id = ?",
      [project_id, workspaceId]
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2️⃣ THEN use projectRows
    const totalBudget = Number(projectRows[0].budget);

    // 3️⃣ THEN calculate total paid
    const [sumRows] = await pool.query(
      `SELECT IFNULL(SUM(amount), 0) AS total_paid
       FROM payments
       WHERE project_id = ?
       AND workspace_id = ?
       AND status = 'paid'`,
      [project_id, workspaceId]
    );

    const totalPaid = Number(sumRows[0].total_paid);
    const remaining = Math.max(totalBudget - totalPaid, 0);

    if (Number(amount) > remaining) {
      return res.status(400).json({
        message: `Payment exceeds remaining amount. Remaining: ₹${remaining}`,
      });
    }

    await pool.query(
      `INSERT INTO payments
       (project_id, workspace_id, amount, payment_type, status, payment_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        workspaceId,
        amount,
        payment_type || "milestone",
        status || "paid",
        payment_date || new Date(),
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

    // 1️⃣ Get project budget
    const [projectRows] = await pool.query(
      "SELECT budget FROM projects WHERE id = ? AND workspace_id = ?",
      [id, workspaceId]
    );

    if (projectRows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const totalBudget = Number(projectRows[0].budget);

    // 2️⃣ Get total paid
    const [sumRows] = await pool.query(
      `SELECT IFNULL(SUM(amount), 0) AS total_paid
       FROM payments
       WHERE project_id = ?
       AND workspace_id = ?
       AND status = 'paid'`,
      [id, workspaceId]
    );

    const totalPaid = Number(sumRows[0].total_paid);

    // 3️⃣ Calculate remaining
    const remaining = Math.max(totalBudget - totalPaid, 0);

    // 4️⃣ Get payment list
    const [payments] = await pool.query(
      `SELECT *
       FROM payments
       WHERE project_id = ?
       AND workspace_id = ?
       ORDER BY created_at DESC`,
      [id, workspaceId]
    );

    res.json({
      payments,
      total_budget: totalBudget,
      total_paid: totalPaid,
      remaining_amount: remaining
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [result] = await pool.query(
      "DELETE FROM payments WHERE id = ? AND workspace_id = ?",
      [id, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};