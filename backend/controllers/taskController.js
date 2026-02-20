const pool = require('../config/db');

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, assigned_to, client_id } = req.body;

    if (!title || !client_id) {
      return res.status(400).json({ message: "Title and client_id required" });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks 
       (title, description, priority, due_date, assigned_to, client_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        priority || 'medium',
        due_date || null,
        assigned_to || null,
        client_id,
        req.user.id
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

exports.getTasks = async (req, res) => {
    try {
      const [tasks] = await pool.query(
        `SELECT * FROM tasks WHERE created_by = ?`,
        [req.user.id]
      );
  
      res.json(tasks);
  
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.updateTask = async (req, res) => {
    try {
      const { id } = req.params;
  
      // 1️⃣ Get existing task
      const [existingTask] = await pool.query(
        "SELECT * FROM tasks WHERE id=? AND created_by=?",
        [id, req.user.id]
      );
  
      if (existingTask.length === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      const task = existingTask[0];
  
      // 2️⃣ Save old version in history table
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
  
      // 3️⃣ Prepare updated values (keep old if not provided)
      const title = req.body.title || task.title;
      const description = req.body.description || task.description;
      const status = req.body.status || task.status;
      const priority = req.body.priority || task.priority;
      const due_date = req.body.due_date || task.due_date;
  
      // 4️⃣ Update main table
      await pool.query(
        `UPDATE tasks
         SET title=?, description=?, status=?, priority=?, due_date=?
         WHERE id=? AND created_by=?`,
        [title, description, status, priority, due_date, id, req.user.id]
      );
  
      res.json({ message: "Task updated and history saved" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.deleteTask = async (req, res) => {
    try {
      const { id } = req.params;
  
      const [result] = await pool.query(
        `DELETE FROM tasks WHERE id=? AND created_by=?`,
        [id, req.user.id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.json({ message: "Task deleted successfully" });
  
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };