const pool = require('../config/db');

// =======================
// CREATE TASK
// =======================
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, assigned_to, project_id } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({ message: "Title and project_id required" });
    }

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    // 🔐 Validate project belongs to workspace
    const [project] = await pool.query(
      "SELECT id, client_id FROM projects WHERE id = ? AND workspace_id = ?",
      [project_id, workspaceId]
    );

    if (project.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const client_id = project[0].client_id;

    const [result] = await pool.query(
      `INSERT INTO tasks 
       (title, description, priority, due_date, assigned_to, client_id, project_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        priority || "medium",
        due_date || null,
        assigned_to || null,
        client_id,
        project_id,
        workspaceId
      ]
    );

    res.status(201).json({
      message: "Task created successfully",
      taskId: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// GET TASKS
// =======================
exports.getTasks = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [tasks] = await pool.query(
      "SELECT * FROM tasks WHERE created_by = ?",
      [workspaceId]
    );

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// UPDATE TASK
// =======================
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [existingTask] = await pool.query(
      "SELECT * FROM tasks WHERE id = ? AND created_by = ?",
      [id, workspaceId]
    );

    if (existingTask.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = existingTask[0];

    await pool.query(
      `INSERT INTO task_history 
       (task_id, old_title, old_description, old_status, old_priority, old_due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.due_date
      ]
    );

    const title = req.body.title || task.title;
    const description = req.body.description || task.description;
    const status = req.body.status || task.status;
    const priority = req.body.priority || task.priority;
    const due_date = req.body.due_date || task.due_date;

    await pool.query(
      `UPDATE tasks
       SET title=?, description=?, status=?, priority=?, due_date=?
       WHERE id=? AND created_by=?`,
      [title, description, status, priority, due_date, id, workspaceId]
    );

    res.json({ message: "Task updated and history saved" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// DELETE TASK
// =======================
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [result] = await pool.query(
      "DELETE FROM tasks WHERE id = ? AND created_by = ?",
      [id, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET TASKS BY PROJECT
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [tasks] = await pool.query(
      `SELECT * FROM tasks 
       WHERE project_id = ? AND created_by = ?
       ORDER BY created_at DESC`,
      [projectId, workspaceId]
    );

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};