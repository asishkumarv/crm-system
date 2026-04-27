const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// EMAIL CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
  res.json({ token, userId: u.id });
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

// ─────────────────────────────────────────────
// 🔐 FORGOT PASSWORD (OTP-based password reset)
// ─────────────────────────────────────────────

// Step 1: Request OTP
exports.employeeForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const emp = await db.query("SELECT * FROM employees WHERE email=$1", [email]);
    if (!emp.rows.length) return res.status(404).json({ message: "No employee account found with this email." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.query(
      `INSERT INTO password_reset_otps (email, otp, expires_at, role)
       VALUES ($1, $2, $3, 'employee')
       ON CONFLICT (email, role) DO UPDATE SET otp=$2, expires_at=$3, used=false`,
      [email, otp, expiresAt]
    );

    await transporter.sendMail({
      from: `"CRM System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "CRM - Password Reset OTP",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#f8fafc;padding:32px;border-radius:16px;">
          <h2 style="color:#00796B;margin-bottom:8px;">Password Reset Request</h2>
          <p style="color:#475569;">You requested to reset your CRM Employee account password.</p>
          <div style="background:#00796B;color:#fff;font-size:32px;font-weight:900;letter-spacing:8px;text-align:center;padding:24px;border-radius:12px;margin:24px 0;">
            ${otp}
          </div>
          <p style="color:#64748B;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color:#94A3B8;font-size:12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email successfully." });
  } catch (err) {
    console.error("Employee ForgotPassword Error:", err);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// Step 2: Verify OTP
exports.employeeVerifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await db.query(
      `SELECT * FROM password_reset_otps 
       WHERE email=$1 AND otp=$2 AND role='employee' AND used=false AND expires_at > NOW()`,
      [email, otp]
    );
    if (!result.rows.length) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }
    res.json({ message: "OTP verified successfully." });
  } catch (err) {
    console.error("Employee VerifyOTP Error:", err);
    res.status(500).json({ message: "OTP verification failed." });
  }
};

// Step 3: Reset password
exports.employeeResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const result = await db.query(
      `SELECT * FROM password_reset_otps 
       WHERE email=$1 AND otp=$2 AND role='employee' AND used=false AND expires_at > NOW()`,
      [email, otp]
    );
    if (!result.rows.length) {
      return res.status(400).json({ message: "OTP is invalid or expired. Please restart the process." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE employees SET password=$1 WHERE email=$2", [hashed, email]);

    await db.query(
      "UPDATE password_reset_otps SET used=true WHERE email=$1 AND role='employee'",
      [email]
    );

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Employee ResetPassword Error:", err);
    res.status(500).json({ message: "Failed to reset password." });
  }
};

// ─────────────────────────────────────────────
// 👤 EMPLOYEE PROFILE
// ─────────────────────────────────────────────

exports.getEmployeeProfile = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || id === "undefined") return res.status(400).json({ message: "ID is required" });
    const result = await db.query(
      "SELECT id, name, email, phone, department, status, created_at FROM employees WHERE id=$1",
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Employee not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GetEmployeeProfile Error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

exports.updateEmployeeProfile = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || id === "undefined") return res.status(400).json({ message: "ID is required" });
    const { name, phone, department } = req.body;
    await db.query(
      "UPDATE employees SET name=COALESCE($1,name), phone=COALESCE($2,phone), department=COALESCE($3,department) WHERE id=$4",
      [name, phone, department, id]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("UpdateEmployeeProfile Error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

exports.changeEmployeePassword = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || id === "undefined") return res.status(400).json({ message: "ID is required" });
    const { currentPassword, newPassword } = req.body;

    const result = await db.query("SELECT password FROM employees WHERE id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Employee not found" });

    const match = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect." });

    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE employees SET password=$1 WHERE id=$2", [hashed, id]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("ChangeEmployeePassword Error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};