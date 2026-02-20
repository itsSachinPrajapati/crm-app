const db = require("../config/db");

// Convert Lead to Client
exports.convertLeadToClient = async (req, res) => {
    
  try {
    const { leadId } = req.params;
    const userId = req.user.id;

    // 1️⃣ Check if lead exists and belongs to user
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

    // 2️⃣ Validate status
    if (lead.status !== "closed") {
      return res.status(400).json({
        success: false,
        message: "Only closed leads can be converted to clients",
      });
    }

    // 3️⃣ Prevent duplicate conversion
    const [existingClient] = await db.execute(
      "SELECT id FROM clients WHERE lead_id = ?",
      [leadId]
    );

    if (existingClient.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This lead is already converted to a client",
      });
    }

    // 4️⃣ Insert into clients table
    const [result] = await db.execute(
        `INSERT INTO clients 
         (name, email, phone, total_value, user_id, lead_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          lead.name || null,
          lead.email || null,
          lead.phone || null,
          lead.expected_value || 0,  // from leads table
          userId,
          leadId
        ]
      );

    return res.status(201).json({
      success: true,
      message: "Lead converted to client successfully",
      clientId: result.insertId,
    });
  } catch (error) {
    console.error("Convert Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while converting lead",
    });
  }
};

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
        message: "Server error while fetching clients",
      });
    }
  };

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

  exports.updateClient = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { company_name, contact_person, email, phone } = req.body;
  
      const [result] = await db.execute(
        `UPDATE clients 
         SET company_name = ?, contact_person = ?, email = ?, phone = ?
         WHERE id = ? AND user_id = ?`,
        [company_name, contact_person, email, phone, id, userId]
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