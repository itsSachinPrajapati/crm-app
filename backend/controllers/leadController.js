const db = require("../config/db");

// ==========================
// CREATE LEAD
// ==========================
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, source, expected_value } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user_id = req.user.id;

    const [result] = await db.execute(
      "INSERT INTO leads (name, email, phone, status, source, expected_value, user_id) VALUES (?, ?, ?, 'new', ?, ?, ?)",
      [name, email, phone, source || "manual", expected_value || 0, user_id]
    );

    return res.status(201).json({
      message: "Lead created successfully",
      leadId: result.insertId
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// GET LEADS
// ==========================
exports.getLeads = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [results] = await db.execute(
      "SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    return res.status(200).json(results);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// UPDATE LEAD
// ==========================
exports.updateLead = async (req, res) => {
  try {
    const { status } = req.body;
    const leadId = req.params.id;
    const user_id = req.user.id;

    const allowedStatus = ["new", "contacted", "qualified", "closed", "lost"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    await db.execute(
      "UPDATE leads SET status = ? WHERE id = ? AND user_id = ?",
      [status, leadId, user_id]
    );

    return res.status(200).json({ message: "Lead updated successfully" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ==========================
// DELETE LEAD
// ==========================
exports.deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const user_id = req.user.id;

    await db.execute(
      "DELETE FROM leads WHERE id = ? AND user_id = ?",
      [leadId, user_id]
    );

    return res.status(200).json({ message: "Lead deleted successfully" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const leadId = req.params.id;
    const user_id = req.user.id;

    const [rows] = await db.execute(
      "SELECT * FROM leads WHERE id = ? AND user_id = ?",
      [leadId, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.status(200).json(rows[0]);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};