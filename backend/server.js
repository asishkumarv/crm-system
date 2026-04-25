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
    
    // Fix: Ensure 'id' is SERIAL/Auto-increment if it was created manually as just 'integer'
    try {
      await db.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'interactions_id_seq') THEN
            CREATE SEQUENCE interactions_id_seq;
            ALTER TABLE interactions ALTER COLUMN id SET DEFAULT nextval('interactions_id_seq');
            ALTER SEQUENCE interactions_id_seq OWNED BY interactions.id;
            PERFORM setval('interactions_id_seq', COALESCE((SELECT MAX(id)+1 FROM interactions), 1), false);
          END IF;
        END $$;
      `);
    } catch (e) { console.log("Sequence check skipped"); }

    // Ensure the column name matches user's expectation (status vs type)
    await db.query("ALTER TABLE interactions ADD COLUMN IF NOT EXISTS status VARCHAR(50)");
    
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