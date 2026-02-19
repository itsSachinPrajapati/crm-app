const db = require("../config/db");

// ==========================
// CREATE LEAD
// ==========================
exports.createLead = (req, res) => {
  const { name, email, phone, source, expected_value } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const user_id = req.user.id;

  db.query(
    "INSERT INTO leads (name, email, phone, status, source, expected_value, user_id) VALUES (?, ?, ?, 'new', ?, ?, ?)",
    [name, email, phone, source || "manual", expected_value || 0, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      return res.status(201).json({ message: "Lead created successfully" });
    }
  );
};

// ==========================
// GET LEADS (Only Own Leads)
// ==========================
exports.getLeads = (req, res) => {
  const user_id = req.user.id;

  db.query(
    "SELECT * FROM leads WHERE user_id = ? ORDER BY created_at DESC",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      return res.status(200).json(results);
    }
  );
};

// ==========================
// UPDATE LEAD (Status Logic)
// ==========================
exports.updateLead = (req, res) => {
  const { status } = req.body;
  const leadId = req.params.id;
  const user_id = req.user.id;

  const allowedStatus = ["new", "contacted", "qualified", "closed", "lost"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  db.query(
    "UPDATE leads SET status = ? WHERE id = ? AND user_id = ?",
    [status, leadId, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      return res.status(200).json({ message: "Lead updated successfully" });
    }
  );
};

// ==========================
// DELETE LEAD (Ownership Protected)
// ==========================
exports.deleteLead = (req, res) => {
  const leadId = req.params.id;
  const user_id = req.user.id;

  db.query(
    "DELETE FROM leads WHERE id = ? AND user_id = ?",
    [leadId, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      return res.status(200).json({ message: "Lead deleted successfully" });
    }
  );
};
