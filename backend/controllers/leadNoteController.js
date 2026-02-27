const db = require("../config/db");

// ➤ Add note to lead
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const userId = req.user.id;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: "Note is required" });
    }

    // 🔐 Validate lead belongs to workspace
    const [lead] = await db.query(
      "SELECT id FROM leads WHERE id = ? AND user_id = ?",
      [id, workspaceId]
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

// ➤ Get all notes for a specific lead
exports.getLeadNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    // 🔐 Validate lead belongs to workspace
    const [lead] = await db.query(
      "SELECT id FROM leads WHERE id = ? AND user_id = ?",
      [id, workspaceId]
    );

    if (lead.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const [rows] = await db.query(
      `SELECT ln.id,
              ln.note,
              ln.created_at,
              u.name AS created_by_name
       FROM lead_notes ln
       LEFT JOIN users u ON ln.created_by = u.id
       WHERE ln.lead_id = ?
       ORDER BY ln.created_at DESC`,
      [id]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

// ➤ Get all notes in workspace
exports.getAllNotes = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [notes] = await db.query(
      `SELECT ln.*, u.name as created_by_name
       FROM lead_notes ln
       JOIN leads l ON ln.lead_id = l.id
       JOIN users u ON ln.created_by = u.id
       WHERE l.user_id = ?
       ORDER BY ln.created_at DESC`,
      [workspaceId]
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

// ➤ Delete note (workspace safe)
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [result] = await db.execute(
      `DELETE ln FROM lead_notes ln
       JOIN leads l ON ln.lead_id = l.id
       WHERE ln.id = ? AND l.user_id = ?`,
      [noteId, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Delete Note Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};