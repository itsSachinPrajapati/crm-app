const pool = require("../config/db");

exports.logProjectActivity = async ({
  projectId,
  userId,
  actionType,
  metadata = {},
}) => {
  await pool.query(
    `INSERT INTO project_activity_logs
     (project_id, user_id, action, metadata)
     VALUES (?, ?, ?, ?)`,
    [
      projectId,
      userId,
      actionType,
      JSON.stringify(metadata),
    ]
  );
};