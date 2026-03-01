const pool = require("../config/db");

const WORKSPACE_ID = 2;
const USER_ID = 2;

function randomDateLast5Months() {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - 5);

  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime())
  );
}

function randomSource() {
  const sources = ["LinkedIn", "Website", "Referral", "Cold Email", "Manual"];
  return sources[Math.floor(Math.random() * sources.length)];
}

async function seed() {
  try {
    console.log("Seeding 500 leads...");

    const closedLeadIds = [];

    for (let i = 1; i <= 500; i++) {
      let status;

      // First 100 are closed (20%)
      if (i <= 100) {
        status = "closed";
      } else {
        const otherStatuses = ["new", "contacted", "qualified", "lost"];
        status = otherStatuses[Math.floor(Math.random() * otherStatuses.length)];
      }

      const createdAt = randomDateLast5Months();
      const expectedValue = Math.floor(Math.random() * 90000) + 10000;
      const converted = status === "closed" ? 1 : 0;
      const convertedAt = converted ? createdAt : null;

      const [result] = await pool.query(
        `INSERT INTO leads
        (name, email, phone, status, expected_value, user_id, created_at, source, converted_at, converted, workspace_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `Lead ${i}`,
          `lead${i}@example.com`,
          `98${Math.floor(10000000 + Math.random() * 89999999)}`,
          status,
          expectedValue,
          USER_ID,
          createdAt,
          randomSource(),
          convertedAt,
          converted,
          WORKSPACE_ID,
        ]
      );

      if (status === "closed") {
        closedLeadIds.push(result.insertId);
      }
    }

    console.log("Leads inserted. Creating clients from closed leads...");

    for (let i = 0; i < closedLeadIds.length; i++) {
      const leadId = closedLeadIds[i];

      const [leadRows] = await pool.query(
        "SELECT name, email, phone FROM leads WHERE id = ?",
        [leadId]
      );

      const lead = leadRows[0];

      await pool.query(
        `INSERT INTO clients
        (name, email, phone, user_id, lead_id, created_at, status, total_value, workspace_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lead.name,
          lead.email,
          lead.phone,
          USER_ID,
          leadId,
          randomDateLast5Months(),
          "active",
          Math.floor(Math.random() * 200000) + 20000,
          WORKSPACE_ID,
        ]
      );
    }

    console.log("100 clients created from closed leads.");
    console.log("Seeding complete.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();