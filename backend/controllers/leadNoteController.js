const db = require("../config/db");

// ➤ Add note to lead
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params; // lead id
    const { note } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!note || !note.trim()) {
      return res.status(400).json({ message: "Note is required" });
    }

    // Check lead exists
    const [lead] = await db.query(
      "SELECT id FROM leads WHERE id = ?",
      [id]
    );

    if (lead.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Insert note
    const [result] = await db.query(
      `INSERT INTO lead_notes (lead_id, note, created_by)
       VALUES (?, ?, ?)`,
      [id, note, userId]
    );

    const [newNote] = await db.query(
      `SELECT ln.*, u.name as created_by_name
       FROM lead_notes ln
       JOIN users u ON ln.created_by = u.id
       WHERE ln.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newNote[0]);
  } catch (err) {
    console.error("Add note error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ Get all notes for a lead
exports.getLeadNotes = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `
      SELECT ln.id,
             ln.note,
             ln.created_at,
             u.name AS created_by_name
      FROM lead_notes ln
      LEFT JOIN users u ON ln.created_by = u.id
      WHERE ln.lead_id = ?
      ORDER BY ln.created_at DESC
      `,
      [req.params.id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

exports.getAllNotes = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const [notes] = await db.query(
        `SELECT ln.*, u.name as created_by_name
         FROM lead_notes ln
         JOIN users u ON ln.created_by = u.id
         WHERE ln.created_by = ?
         ORDER BY ln.created_at DESC`,
        [userId]
      );
  
      res.status(200).json({
        success: true,
        data: notes,
      });
    } catch (error) {
      console.error("Get notes Error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };

  exports.deleteNote = async (req, res) => {
    try {
      const { noteId } = req.params;
  
      await db.execute(
        "DELETE FROM lead_notes WHERE id = ?",
        [noteId]
      );
  
      res.json({ success: true });
    } catch (error) {
      console.error("Delete Note Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };