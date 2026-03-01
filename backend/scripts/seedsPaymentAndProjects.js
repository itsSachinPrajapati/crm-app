const pool = require("../config/db");

const WORKSPACE_ID = 2;
const OWNER_ID = 2;

// AI Agency Services
const SERVICES = [
  "AI Chatbot Development",
  "AI Voice Agent Setup",
  "AI Workflow Automation",
  "AI UGC Ads Creation",
  "AI Website Builder",
  "AI Marketing Automation",
  "AI Sales Funnel System",
  "Custom GPT Integration",
  "AI CRM Automation",
  "Lead Generation AI System",
  "AI Customer Support Bot",
  "AI Appointment Booking System"
];

const STATUSES = ["active", "completed", "on_hold"];
const PHASES = ["planning", "design", "development", "testing", "delivery"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateLast5Months() {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - 5);

  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime())
  );
}

function futureDeadline(start) {
  const d = new Date(start);
  d.setDate(d.getDate() + Math.floor(Math.random() * 90) + 30);
  return d;
}

async function seed() {
  try {
    console.log("Fetching clients...");

    const [clients] = await pool.query(
      "SELECT id FROM clients WHERE workspace_id = ?",
      [WORKSPACE_ID]
    );

    let projectCount = 0;
    let paymentCount = 0;

    for (const client of clients) {

      // 2 projects per client
      for (let i = 0; i < 2; i++) {

        const service = randomFrom(SERVICES);
        const startDate = randomDateLast5Months();
        const deadline = futureDeadline(startDate);

        // Higher pricing for AI services
        const totalAmount = Math.floor(Math.random() * 400000) + 100000;

        const status = randomFrom(STATUSES);

        const progress =
          status === "completed"
            ? 100
            : status === "active"
            ? Math.floor(Math.random() * 60) + 30
            : Math.floor(Math.random() * 40);

        const [projectResult] = await pool.query(
          `INSERT INTO projects
          (owner_id, client_id, name, description, service_type,
           total_amount, payment_terms, status, current_phase,
           progress_percent, start_date, deadline, workspace_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            OWNER_ID,
            client.id,
            `${service} for Client ${client.id}`,
            `Implementation of ${service}`,
            service,
            totalAmount,
            "40% advance, 40% milestone, 20% final",
            status,
            randomFrom(PHASES),
            progress,
            startDate,
            deadline,
            WORKSPACE_ID
          ]
        );

        const projectId = projectResult.insertId;
        projectCount++;

        // Create 1–3 payments
        const splits = Math.floor(Math.random() * 3) + 1;

        for (let p = 0; p < splits; p++) {

          const amount = Math.floor(totalAmount / splits);
          const paymentStatus = Math.random() < 0.75 ? "paid" : "pending";

          await pool.query(
            `INSERT INTO payments
            (project_id, workspace_id, amount,
             payment_type, status, payment_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              projectId,
              WORKSPACE_ID,
              amount,
              randomFrom(["advance", "milestone", "final"]),
              paymentStatus,
              randomDateLast5Months()
            ]
          );

          paymentCount++;
        }
      }
    }

    console.log(`${projectCount} projects created.`);
    console.log(`${paymentCount} payments created.`);
    console.log("AI Projects + Payments seeding complete.");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();