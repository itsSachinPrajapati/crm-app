const pool = require("../config/db");

exports.getDashboardSummary = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    // 1️⃣ Total Leads
    const [leads] = await pool.query(
      "SELECT COUNT(*) as total FROM leads WHERE workspace_id = ?",
      [workspaceId]
    );

    // 2️⃣ Total Clients
    const [clients] = await pool.query(
      "SELECT COUNT(*) as total FROM clients WHERE workspace_id = ?",
      [workspaceId]
    );

    // 3️⃣ Total Projects
    const [projects] = await pool.query(
      "SELECT COUNT(*) as total FROM projects WHERE workspace_id = ?",
      [workspaceId]
    );

    // 4️⃣ Total Revenue (paid only)
    const [revenue] = await pool.query(
      `SELECT IFNULL(SUM(amount),0) as total 
       FROM payments 
       WHERE workspace_id = ? AND status = 'paid'`,
      [workspaceId]
    );

    res.json({
      totalLeads: leads[0].total,
      totalClients: clients[0].total,
      totalProjects: projects[0].total,
      totalRevenue: revenue[0].total,
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLeadPipeline = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [rows] = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM leads
       WHERE workspace_id = ?
       GROUP BY status`,
      [workspaceId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Pipeline Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRevenueOverview = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [rows] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(amount) as total
      FROM payments
      WHERE workspace_id = ?
        AND status = 'paid'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
      `,
      [workspaceId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Revenue Overview Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRecentData = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    const [recentLeads] = await pool.query(
      `SELECT id, name, status, created_at 
       FROM leads
       WHERE workspace_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [workspaceId]
    );

    const [recentProjects] = await pool.query(
      `SELECT id, name, status, created_at 
       FROM projects
       WHERE workspace_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [workspaceId]
    );

    res.json({
      recentLeads,
      recentProjects,
    });
  } catch (error) {
    console.error("Recent Data Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFullDashboard = async (req, res) => {
  try {
    const workspaceId =
      req.user.role === "admin"
        ? req.user.id
        : req.user.owner_id;

    /* =======================
       🔹 TOTAL SUMMARY (OLD)
    ======================== */

    const [[leads]] = await pool.query(
      "SELECT COUNT(*) as total FROM leads WHERE workspace_id = ?",
      [workspaceId]
    );

    const [[clients]] = await pool.query(
      "SELECT COUNT(*) as total FROM clients WHERE workspace_id = ?",
      [workspaceId]
    );

    const [[projects]] = await pool.query(
      "SELECT COUNT(*) as total FROM projects WHERE workspace_id = ?",
      [workspaceId]
    );

    const [[revenue]] = await pool.query(
      `
      SELECT IFNULL(SUM(amount),0) as total
      FROM payments
      WHERE workspace_id = ?
      AND status = 'paid'
      `,
      [workspaceId]
    );

 /* =======================
   🔹 LAST FULL MONTH LOGIC
======================= */

// 🟢 Leads – Last Full Month
const [[monthLeads]] = await pool.query(
  `
  SELECT COUNT(*) AS total
  FROM leads
  WHERE workspace_id = ?
  AND DATE_FORMAT(created_at, '%Y-%m') =
      DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
  `,
  [workspaceId]
);

// 🟢 Leads – Month Before That
const [[prevMonthLeads]] = await pool.query(
  `
  SELECT COUNT(*) AS total
  FROM leads
  WHERE workspace_id = ?
  AND DATE_FORMAT(created_at, '%Y-%m') =
      DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m')
  `,
  [workspaceId]
);

// 🟢 Clients – Last Full Month
const [[monthClients]] = await pool.query(
  `
  SELECT COUNT(*) AS total
  FROM clients
  WHERE workspace_id = ?
  AND DATE_FORMAT(created_at, '%Y-%m') =
      DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
  `,
  [workspaceId]
);

// 🟢 Clients – Month Before That
const [[prevMonthClients]] = await pool.query(
  `
  SELECT COUNT(*) AS total
  FROM clients
  WHERE workspace_id = ?
  AND DATE_FORMAT(created_at, '%Y-%m') =
      DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m')
  `,
  [workspaceId]
);

// 🟢 Revenue – Last Full Month
const [[monthRevenue]] = await pool.query(
  `
  SELECT IFNULL(SUM(amount),0) AS total
  FROM payments
  WHERE workspace_id = ?
    AND status = 'paid'
    AND DATE_FORMAT(payment_date, '%Y-%m') =
        DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
  `,
  [workspaceId]
);

// 🟢 Revenue – Month Before That
const [[prevMonthRevenue]] = await pool.query(
  `
  SELECT IFNULL(SUM(amount),0) AS total
  FROM payments
  WHERE workspace_id = ?
    AND status = 'paid'
    AND DATE_FORMAT(payment_date, '%Y-%m') =
        DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m')
  `,
  [workspaceId]
);

// 🟢 Active / Completed Projects
const [[projectStatus]] = await pool.query(
  `
  SELECT 
    SUM(status = 'active') AS active,
    SUM(status = 'completed') AS completed
  FROM projects
  WHERE workspace_id = ?
  `,
  [workspaceId]
);

/* =======================
   🔹 GROWTH CALCULATION
======================= */

const calculateGrowth = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const monthLeadsGrowth = calculateGrowth(
  monthLeads.total,
  prevMonthLeads.total
);

const monthClientsGrowth = calculateGrowth(
  monthClients.total,
  prevMonthClients.total
);

const monthRevenueGrowth = calculateGrowth(
  monthRevenue.total,
  prevMonthRevenue.total
);

// 🔹 LAST FULL MONTH SERVICE DISTRIBUTION

    /* =======================
       🔹 PIPELINE
    ======================== */

    const [pipeline] = await pool.query(
      `
      SELECT status, COUNT(*) as count
      FROM leads
      WHERE workspace_id = ?
      GROUP BY status
      `,
      [workspaceId]
    );

    /* =======================
       🔹 REVENUE OVERVIEW
    ======================== */

    const [revenueOverview] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(payment_date, '%Y-%m') as month,
        SUM(amount) as total
      FROM payments
      WHERE workspace_id = ?
        AND status = 'paid'
        AND payment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
      `,
      [workspaceId]
    );

    /* =======================
       🔹 RECENT DATA
    ======================== */

    const [recentLeads] = await pool.query(
      `
      SELECT id, name, status, created_at
      FROM leads
      WHERE workspace_id = ?
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [workspaceId]
    );

    const [recentProjects] = await pool.query(
      `
      SELECT id, name, status, created_at
      FROM projects
      WHERE workspace_id = ?
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [workspaceId]
    );

    /* =======================
       🔹 TOP CLIENTS
    ======================== */

    const [topClients] = await pool.query(
      `
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT p.id) AS total_projects,
        COALESCE(SUM(pay.amount), 0) AS total_paid,
        MIN(c.created_at) AS client_since
      FROM clients c
      LEFT JOIN projects p ON p.client_id = c.id
      LEFT JOIN payments pay 
        ON pay.project_id = p.id 
        AND pay.status = 'paid'
      WHERE c.workspace_id = ?
      GROUP BY c.id
      ORDER BY total_paid DESC
      LIMIT 5
      `,
      [workspaceId]
    );

    const [topCategories] = await pool.query(
      `
      SELECT 
        p.service_type,
        COALESCE(SUM(pay.amount), 0) AS total_revenue
      FROM projects p
      LEFT JOIN payments pay 
        ON pay.project_id = p.id 
        AND pay.status = 'paid'
      WHERE p.workspace_id = ?
      GROUP BY p.service_type
      ORDER BY total_revenue DESC
      LIMIT 5
      `,
      [workspaceId]
    );

    // 🔹 PROJECTS WITH DEADLINE IN CURRENT MONTH
    const [overdueProjects] = await pool.query(
      `
      SELECT id, name, deadline, status
      FROM projects
      WHERE workspace_id = ?
        AND status != 'completed'
        AND deadline < CURDATE()
        AND deadline >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY deadline ASC
      LIMIT 7
      `,
      [workspaceId]
    );

    const [upcomingProjects] = await pool.query(
      `
      SELECT id, name, deadline, status
      FROM projects
      WHERE workspace_id = ?
        AND status != 'completed'
        AND deadline >= CURDATE()
        AND deadline <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY deadline ASC
      LIMIT 7
      `,
      [workspaceId]
    );

    const [monthServiceDistribution] = await pool.query(
      `
      SELECT 
        p.service_type,
        COALESCE(SUM(pay.amount), 0) AS total_revenue
      FROM projects p
      LEFT JOIN payments pay 
        ON pay.project_id = p.id 
        AND pay.status = 'paid'
      WHERE p.workspace_id = ?
        AND pay.payment_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND pay.payment_date < DATE_FORMAT(CURDATE(), '%Y-%m-01')
      GROUP BY p.service_type
      ORDER BY total_revenue DESC
      `,
      [workspaceId]
    );

    /* =======================
       🔹 FINAL RESPONSE
    ======================== */

    res.json({
      summary: {
       
        totalLeads: leads.total,
        totalClients: clients.total,
        totalProjects: projects.total,
        totalRevenue: Number(revenue.total),
      
        monthLeads: monthLeads.total,
        monthLeadsGrowth,
        monthClients: monthClients.total,
        monthClientsGrowth,
        monthRevenue: Number(monthRevenue.total),
        monthRevenueGrowth,
        activeProjects: Number(projectStatus.active) || 0,
        completedProjects: Number(projectStatus.completed) || 0,
        
      },
      pipeline,
      revenueOverview,
      recent: {
        recentLeads,
        recentProjects,
      },
      topClients,
      topCategories,
      overdueProjects,
      upcomingProjects,
      monthServiceDistribution,
    });

  } catch (error) {
    console.error("Full Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};