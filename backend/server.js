const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
require("./config/db");

const app = express();

app.use(cors(
  {
    origin: "http://localhost:3000",
    credentials:true
  }
  
));
app.use(express.json());
app.use(cookieParser());


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const authMiddleware = require("./middleware/authMiddleware");




const PORT = process.env.PORT || 5000;

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
