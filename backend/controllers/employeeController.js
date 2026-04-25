const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.employeeRegister = async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO employees(name,email,password) VALUES($1,$2,$3)",
    [name, email, hashed]
  );

  res.send("Waiting for admin approval");
};

exports.employeeLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await db.query("SELECT * FROM employees WHERE email=$1", [email]);

  if (!user.rows.length) return res.status(400).send("User not found");

  const u = user.rows[0];

  if (u.status !== "approved")
    return res.status(403).send("Not approved yet");

  const match = await bcrypt.compare(password, u.password);

  if (!match) return res.status(400).send("Wrong password");

  const token = jwt.sign({ id: u.id, role: "employee" }, "SECRET");

  res.json({ token });
};

exports.approveEmployee = async (req, res) => {
  await db.query(
    "UPDATE employees SET status='approved' WHERE id=$1",
    [req.params.id]
  );

  res.send("Employee approved");
};

exports.getMyLeads = async (req, res) => {
  const { id } = req.params;
  
  if (!id || id === "undefined") {
    return res.status(400).send("Valid employee ID is required");
  }

  try {
    const leads = await db.query(
      "SELECT * FROM leads WHERE assigned_to=$1 ORDER BY created_at DESC",
      [id]
    );
    res.json(leads.rows);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).send("Error fetching leads");
  }
};