const db = require("../db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// EMAIL CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Admin Register (Send OTP)
exports.adminRegister = async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO admins(name,email,password) VALUES($1,$2,$3)",
    [name, email, hashed]
  );

  const otp = Math.floor(100000 + Math.random() * 900000);

  await db.query(
    "INSERT INTO admin_otps(email,otp,expires_at) VALUES($1,$2,NOW()+INTERVAL '5 minutes')",
    [email, otp]
  );

  await transporter.sendMail({
    from: "asishkumarv@gmail.com",
    to: email,
    subject: "Admin OTP",
    text: `Your OTP is ${otp}`,
  });

  res.send("OTP sent to email");
};

exports.verifyAdminOTP = async (req, res) => {
  const { email, otp } = req.body;

  const result = await db.query(
    "SELECT * FROM admin_otps WHERE email=$1 AND otp=$2",
    [email, otp]
  );

  if (!result.rows.length) return res.status(400).send("Invalid OTP");

  await db.query(
    "UPDATE admins SET is_verified=true WHERE email=$1",
    [email]
  );

  res.send("Admin verified");
};

const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await db.query("SELECT * FROM admins WHERE email=$1", [email]);

  if (!user.rows.length) return res.status(400).send("Admin not found");

  const u = user.rows[0];

  if (!u.is_verified) return res.status(403).send("Verify OTP first");

  const match = await bcrypt.compare(password, u.password);

  if (!match) return res.status(400).send("Wrong password");

  const token = jwt.sign({ id: u.id, role: "admin" }, "SECRET");
  res.json({ token, adminId: u.id });
};

exports.getAllEmployees = async (req, res) => {
  const users = await db.query("SELECT * FROM employees");
  res.json(users.rows);
};

exports.approveEmployee = async (req, res) => {
  await db.query(
    "UPDATE employees SET status='approved' WHERE id=$1",
    [req.params.id]
  );
  res.send("Approved");
};