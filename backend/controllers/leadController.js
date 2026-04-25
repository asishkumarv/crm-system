const db = require("../db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

exports.createLead = async (req, res) => {
  const { name, phone, email, source } = req.body;

  await db.query(
    "INSERT INTO leads(name,phone,email,source) VALUES($1,$2,$3,$4)",
    [name, phone, email, source]
  );

  res.send("Lead added");
};

exports.getLeads = async (req, res) => {
  const leads = await db.query("SELECT * FROM leads");
  res.json(leads.rows);
};