const db = require("../config/db");
const pool = require("../config/db");

// ==========================
// CREATE LEAD
// ==========================
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, source, budget, status, service } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [result] = await pool.query(
      `INSERT INTO leads 
       (name, email, phone, source, budget, status, service, workspace_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email || null,
        phone || null,
        source || null,
        budget || null,
        status || "new",
        service || null,
        workspaceId
      ]
    );

    return res.status(201).json({
      message: "Lead created successfully",
      leadId: result.insertId
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create lead" });
  }
};
// ==========================
// GET LEADS
// ==========================
exports.getLeads = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const offset = (page - 1) * limit;

    // 🔹 1️⃣ Get paginated leads
    const [leads] = await db.execute(
      `
      SELECT *
      FROM leads
      WHERE workspace_id = ?
      AND converted = 0
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      [workspaceId]
    );

    // 🔹 2️⃣ Get total count (for pagination)
    const [[{ total }]] = await db.execute(
      `
      SELECT COUNT(*) as total
      FROM leads
      WHERE workspace_id = ?
      AND converted = 0
      `,
      [workspaceId]
    );

    // 🔹 3️⃣ Get status stats (for KPI cards)
    const [statsRaw] = await db.execute(
      `
      SELECT status, COUNT(*) as count
      FROM leads
      WHERE workspace_id = ?
      AND converted = 0
      GROUP BY status
      `,
      [workspaceId]
    );

    // Convert stats array to object
    const stats = {};
    statsRaw.forEach((row) => {
      stats[row.status] = row.count;
    });

    return res.json({
      leads,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      stats
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch leads" });
  }
};

// ==========================
// UPDATE LEAD
// ==========================
exports.updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const updates = req.body;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    // Check if lead exists first
    const [existing] = await db.execute(
      "SELECT status FROM leads WHERE id = ? AND workspace_id = ?",
      [leadId, workspaceId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const currentStatus = existing[0].status;

    const allowedFields = ["name", "email", "phone", "source", "status"];
    const allowedStatus = ["new", "contacted", "qualified", "closed", "lost"];

    const fields = [];
    const values = [];

    for (const key of Object.keys(updates)) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({ message: `Invalid field: ${key}` });
      }

      // 🔥 Status validation + pipeline restriction
      if (key === "status") {
        const newStatus = updates.status;

        if (!allowedStatus.includes(newStatus)) {
          return res.status(400).json({ message: "Invalid status value" });
        }

        const pipeline = {
          new: ["contacted"],
          contacted: ["qualified"],
          qualified: ["closed", "lost"],
          closed: [],
          lost: []
        };

        if (!pipeline[currentStatus].includes(newStatus)) {
          return res.status(400).json({
            message: `Invalid status transition from ${currentStatus} to ${newStatus}`
          });
        }
      }

      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }

    values.push(leadId, workspaceId);

    const [result] = await db.execute(
      `UPDATE leads SET ${fields.join(", ")} WHERE id = ? AND workspace_id = ?`,
      values
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

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    await db.execute(
      "DELETE FROM leads WHERE id = ? AND workspace_id  = ?",
      [leadId, workspaceId]
    );

    return res.status(200).json({ message: "Lead deleted successfully" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const leadId = req.params.id;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [rows] = await db.execute(
      "SELECT * FROM leads WHERE id = ? AND workspace_id  = ?",
      [leadId, workspaceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    await db.execute(
      "UPDATE leads SET status = ? WHERE id = ? AND workspace_id  = ?",
      [status, id, workspaceId]
    );

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



