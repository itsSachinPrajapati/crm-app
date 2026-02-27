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
      "INSERT INTO clients (name, email, phone, total_value, user_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, total_value || 0, workspaceId]
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
  try {
    const { leadId } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    // 1️⃣ Select lead
    const [leads] = await db.execute(
      "SELECT * FROM leads WHERE id = ? AND user_id = ?",
      [leadId, workspaceId]
    );

    if (leads.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const lead = leads[0];

    if (lead.status !== "closed") {
      return res.status(400).json({ message: "Only closed leads allowed" });
    }

    // 2️⃣ Insert client
    await db.execute(
      `INSERT INTO clients 
       (name, email, phone, user_id, lead_id)
       VALUES (?, ?, ?, ?, ?)`,
      [lead.name, lead.email, lead.phone, workspaceId, leadId]
    );

    // 3️⃣ Update converted flag
    await db.execute(
      "UPDATE leads SET converted = 1 WHERE id = ? AND user_id = ?",
      [leadId, workspaceId]
    );

    res.json({ message: "Converted successfully" });

  } catch (err) {
    console.error("Convert Error:", err);
    res.status(500).json({ message: "Server error" });
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
      "SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC",
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
      "SELECT * FROM clients WHERE id = ? AND user_id = ?",
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
       WHERE id = ? AND user_id = ?`,
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
      "DELETE FROM clients WHERE id = ? AND user_id = ?",
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