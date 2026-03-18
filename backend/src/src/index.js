require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Protected test route
app.get("/api/profile", protect, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});
