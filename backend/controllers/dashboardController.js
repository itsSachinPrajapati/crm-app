const db = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total Leads
    const [leadRows] = await db.execute(
      "SELECT COUNT(*) as total FROM leads WHERE user_id = ?",
      [userId]
    );

    // Total Clients
    const [clientRows] = await db.execute(
      "SELECT COUNT(*) as total FROM clients WHERE user_id = ?",
      [userId]
    );

    // Revenue
    const [revenueRows] = await db.execute(
      "SELECT IFNULL(SUM(total_value), 0) as total FROM clients WHERE user_id = ?",
      [userId]
    );

    // Open Tasks
    const [taskRows] = await db.execute(
      "SELECT COUNT(*) as total FROM tasks WHERE created_by = ? AND status != 'completed'",
      [userId]
    );

    res.status(200).json({
      leads: leadRows[0].total,
      clients: clientRows[0].total,
      revenue: revenueRows[0].total,
      openTasks: taskRows[0].total,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};