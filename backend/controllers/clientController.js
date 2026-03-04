const db = require("../config/db");

// =============================
// CREATE CLIENT
// =============================
exports.createClient = async (req, res) => {
  const { name, email, phone, total_value } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and Email required",
    });
  }

  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    await db.execute(
        `INSERT INTO clients 
         (name, email, phone, total_value, workspace_id, lead_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          lead.name,
          lead.email,
          lead.phone,
          lead.budget || 0,
          workspaceId,
          leadId
        ]
      );

    res.status(201).json({
      success: true,
      message: "Client created successfully",
    });

  } catch (error) {
    console.error("Create Client Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =============================
// CONVERT LEAD TO CLIENT
// =============================
exports.convertLeadToClient = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { leadId } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    await connection.beginTransaction();

    // 1️⃣ Get lead
    const [leads] = await connection.execute(
      "SELECT * FROM leads WHERE id = ? AND workspace_id = ?",
      [leadId, workspaceId]
    );

    if (leads.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Lead not found" });
    }

    const lead = leads[0];

    if (lead.status !== "closed") {
      await connection.rollback();
      return res.status(400).json({ message: "Only closed leads allowed" });
    }

    if (lead.converted === 1) {
      await connection.rollback();
      return res.status(400).json({ message: "Lead already converted" });
    }

    // 2️⃣ Insert client
    await connection.execute(
      `INSERT INTO clients 
       (name, email, phone, workspace_id, lead_id)
       VALUES (?, ?, ?, ?, ?)`,
      [lead.name, lead.email, lead.phone, workspaceId, leadId]
    );

    // 3️⃣ Update lead
    await connection.execute(
      "UPDATE leads SET converted = 1 WHERE id = ? AND workspace_id = ?",
      [leadId, workspaceId]
    );

    await connection.commit();

    res.status(201).json({ message: "Converted successfully" });

  } catch (err) {
    await connection.rollback();
    console.error("Convert Error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

// =============================
// GET ALL CLIENTS
// =============================
exports.getAllClients = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [clients] = await db.execute(
      `
      SELECT 
        c.*,

        COUNT(CASE WHEN p.status = 'active' THEN 1 END) AS active_projects,
        COUNT(CASE WHEN p.status = 'completed' THEN 1 END) AS completed_projects

      FROM clients c
      LEFT JOIN projects p ON p.client_id = c.id

      WHERE c.workspace_id = ?

      GROUP BY c.id
      ORDER BY c.created_at DESC
      `,
      [workspaceId]
    );

    res.status(200).json({
      success: true,
      data: clients,
    });

  } catch (error) {
    console.error("Get Clients Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =============================
// GET CLIENT BY ID
// =============================
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [clients] = await db.execute(
      "SELECT * FROM clients WHERE id = ? AND workspace_id = ?",
      [id, workspaceId]
    );

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      data: clients[0],
    });

  } catch (error) {
    console.error("Get Client Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =============================
// UPDATE CLIENT
// =============================
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, total_value } = req.body;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [result] = await db.execute(
      `UPDATE clients 
       SET name = ?, email = ?, phone = ?, total_value = ?
       WHERE id = ? AND workspace_id = ?`,
      [name, email, phone, total_value, id, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
    });

  } catch (error) {
    console.error("Update Client Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =============================
// DELETE CLIENT
// =============================
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [result] = await db.execute(
      "DELETE FROM clients WHERE id = ? AND workspace_id = ?",
      [id, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Client not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });

  } catch (error) {
    console.error("Delete Client Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};