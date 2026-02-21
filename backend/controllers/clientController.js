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
    await db.execute(
      "INSERT INTO clients (name, email, phone, total_value, user_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, total_value || 0, req.user.id]
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
    const userId = req.user.id;

    const [leads] = await db.execute(
      "SELECT * FROM leads WHERE id = ? AND user_id = ?",
      [leadId, userId]
    );

    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const lead = leads[0];

    if (lead.status !== "closed") {
      return res.status(400).json({
        success: false,
        message: "Only closed leads can be converted",
      });
    }

    const [existingClient] = await db.execute(
      "SELECT id FROM clients WHERE lead_id = ?",
      [leadId]
    );

    if (existingClient.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Lead already converted",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO clients 
       (name, email, phone, total_value, user_id, lead_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        lead.name,
        lead.email,
        lead.phone,
        lead.expected_value || 0,
        userId,
        leadId,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Lead converted successfully",
      clientId: result.insertId,
    });
  } catch (error) {
    console.error("Convert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =============================
// GET ALL CLIENTS
// =============================
exports.getAllClients = async (req, res) => {
  try {
    const userId = req.user.id;

    const [clients] = await db.execute(
      "SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
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
    const userId = req.user.id;

    const [clients] = await db.execute(
      "SELECT * FROM clients WHERE id = ? AND user_id = ?",
      [id, userId]
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
    const userId = req.user.id;
    const { name, email, phone, total_value } = req.body;

    const [result] = await db.execute(
      `UPDATE clients 
       SET name = ?, email = ?, phone = ?, total_value = ?
       WHERE id = ? AND user_id = ?`,
      [name, email, phone, total_value, id, userId]
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
    const userId = req.user.id;

    const [result] = await db.execute(
      "DELETE FROM clients WHERE id = ? AND user_id = ?",
      [id, userId]
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