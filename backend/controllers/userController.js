const db = require("../config/db");

exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [req.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMe = async (req, res) => {
  const { name, email } = req.body;

  try {
    await db.execute(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, req.user.id]
    );

    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Strong password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.$!%*?&])[A-Za-z\d@.$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Enter a valid strong password",
      });
    }

    const [rows] = await db.execute(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    const bcrypt = require("bcrypt");

    const isMatch = await bcrypt.compare(
      currentPassword,
      rows[0].password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    );

    res.json({
      message: "Password updated successfully",
    });

  } catch (err) {
    console.log("Change Password Error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};


  exports.getTeam = async (req, res) => {
    const [rows] = await db.execute(
      "SELECT id, name, email, role FROM users WHERE owner_id = ?",
      [req.user.id]
    );
    console.log("Team rows:", rows);
    res.json(rows);
  };
  
  exports.createEmployee = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
      }
  
      const bcrypt = require("bcrypt");
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await db.execute(
        "INSERT INTO users (name, email, password, role, owner_id) VALUES (?, ?, ?, 'employee', ?)",
        [name, email, hashedPassword, req.user.id]
      );
  
      res.json({ message: "Employee created successfully" });
  
    } catch (err) {
      console.log("Create Employee Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };