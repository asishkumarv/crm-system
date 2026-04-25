require("dotenv").config();
const express = require("express");
const cors = require("cors");

const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leadRoutes = require("./routes/leadRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/leads", leadRoutes);

app.listen(5000, () => console.log("Server running"));