require("dotenv").config();
const express = require("express");
const cors = require("cors");

const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leadRoutes = require("./routes/leadRoutes");
const db = require("./db");

const app = express();

// Initialize Database Tables
const initDB = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        role VARCHAR(20) DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        query TEXT,
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        assigned_to INTEGER REFERENCES employees(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Ensure columns exist if table was already there
    await db.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS query TEXT");
    await db.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS source VARCHAR(100)");
    await db.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new'");
    await db.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id),
        employee_id INTEGER REFERENCES employees(id),
        note TEXT,
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables verified/created");
  } catch (err) {
    console.error("DB Initialization Error:", err);
  }
};
initDB();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/leads", leadRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));