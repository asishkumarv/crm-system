require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.listen(5000, () => console.log("Server running on 5000"));