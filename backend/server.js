const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./config/db");

const app = express();

app.use((req, res, next) => {
  console.log("METHOD:", req.method, "URL:", req.url);
  next();
});

app.use(cors(
  {
    origin: "http://localhost:5173",
    credentials:true
  }
  
));
app.use(express.json());
app.use(cookieParser());


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const leadRoutes = require("./routes/leadRoutes");
app.use("/api/leads", leadRoutes);

const clientRoutes = require("./routes/clientRoutes");
app.use("/api/clients", clientRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const userRoutes = require("./routes/userRoutes")
app.use("/api/users",userRoutes)

const projectRoutes = require("./routes/projectRoutes")
app.use("/api/projects",projectRoutes)

const milestoneRoutes = require("./routes/milestoneRoutes");
app.use("/api/projects/:projectId/milestones", milestoneRoutes);

const memberRoutes = require("./routes/memberRoutes");
app.use("/api/projects/:projectId/members", memberRoutes);

const activityRoutes = require("./routes/activityRoutes");
app.use("/api/projects/:projectId/activity", activityRoutes);

const requirementRoutes = require("./routes/requirementRoutes");
app.use("/api/projects/:projectId/requirements", requirementRoutes);

const featureRoutes = require("./routes/featureRoutes");
app.use("/api/projects/:projectId/features", featureRoutes);

const paymentsRoutes = require("./routes/paymentsRoutes");
app.use("/api/payments", paymentsRoutes);

const authMiddleware = require("./middleware/authMiddleware");




const PORT = process.env.PORT || 5000;

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running ✅",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});