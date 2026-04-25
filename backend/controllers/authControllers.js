const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO users(name,email,password) VALUES($1,$2,$3)",
    [name, email, hashed]
  );

  res.json({ message: "Waiting for admin approval" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await db.query("SELECT * FROM users WHERE email=$1", [email]);

  if (!user.rows.length) return res.status(400).send("User not found");

  const u = user.rows[0];

  if (u.status !== "approved")
    return res.status(403).send("Not approved");

  const match = await bcrypt.compare(password, u.password);

  if (!match) return res.status(400).send("Wrong password");

  const token = jwt.sign({ id: u.id, role: u.role }, "SECRET");

  res.json({ token, role: u.role });
};

exports.approveUser = async (req, res) => {
  await db.query("UPDATE users SET status='approved' WHERE id=$1", [
    req.params.id,
  ]);

  res.send("Approved");
};