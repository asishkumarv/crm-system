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
  try {
    const users = await db.query(`
      SELECT 
        e.id, e.name, e.email, e.status,
        (SELECT COUNT(*) FROM leads WHERE assigned_to = e.id AND status = 'contacted') as contacted_count,
        (SELECT COUNT(*) FROM leads WHERE assigned_to = e.id AND status = 'converted') as converted_count
      FROM employees e
    `);
    res.json(users.rows);
  } catch (err) {
    res.status(500).send("Error fetching employee stats");
  }
};

exports.getEmployeeDetails = async (req, res) => {
  const { id } = req.params;
  if (!id || id === "undefined") return res.status(400).send("ID is required");
  
  try {
    // Get leads assigned to this employee with their latest interaction note
    const leads = await db.query(`
      SELECT 
        l.id, l.name, l.phone, l.email, l.query, l.source, l.status, l.updated_at,
        i.note as last_note
      FROM leads l 
      LEFT JOIN LATERAL (
        SELECT note 
        FROM interactions 
        WHERE lead_id = l.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) i ON true
      WHERE l.assigned_to = $1::integer
      ORDER BY l.updated_at DESC
    `, [parseInt(id)]);
    
    res.json(leads.rows);
  } catch (err) {
    console.error("Fetch Details Error:", err);
    res.status(500).send("Error fetching staff details");
  }
};

exports.approveEmployee = async (req, res) => {
  await db.query(
    "UPDATE employees SET status='approved' WHERE id=$1",
    [req.params.id]
  );
  res.send("Approved");
};

// ─────────────────────────────────────────────
// 🔐 FORGOT PASSWORD (OTP-based password reset)
// ─────────────────────────────────────────────

// Step 1: Request OTP for password reset
exports.adminForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await db.query("SELECT * FROM admins WHERE email=$1", [email]);
    if (!admin.rows.length) return res.status(404).json({ message: "No admin account found with this email." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert into password_reset_otps table
    await db.query(
      `INSERT INTO password_reset_otps (email, otp, expires_at, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email, role) DO UPDATE SET otp=$2, expires_at=$3, used=false`,
      [email, otp, expiresAt]
    );

    await transporter.sendMail({
      from: `"CRM System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "CRM Admin - Password Reset OTP",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#f8fafc;padding:32px;border-radius:16px;">
          <h2 style="color:#1A237E;margin-bottom:8px;">Password Reset Request</h2>
          <p style="color:#475569;">You requested to reset your CRM Admin account password.</p>
          <div style="background:#1A237E;color:#fff;font-size:32px;font-weight:900;letter-spacing:8px;text-align:center;padding:24px;border-radius:12px;margin:24px 0;">
            ${otp}
          </div>
          <p style="color:#64748B;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color:#94A3B8;font-size:12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email successfully." });
  } catch (err) {
    console.error("Admin ForgotPassword Error:", err);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// Step 2: Verify OTP
exports.adminVerifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await db.query(
      `SELECT * FROM password_reset_otps 
       WHERE email=$1 AND otp=$2 AND role='admin' AND used=false AND expires_at > NOW()`,
      [email, otp]
    );
    if (!result.rows.length) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }
    res.json({ message: "OTP verified successfully." });
  } catch (err) {
    console.error("Admin VerifyOTP Error:", err);
    res.status(500).json({ message: "OTP verification failed." });
  }
};

// Step 3: Reset password
exports.adminResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Re-verify OTP
    const result = await db.query(
      `SELECT * FROM password_reset_otps 
       WHERE email=$1 AND otp=$2 AND role='admin' AND used=false AND expires_at > NOW()`,
      [email, otp]
    );
    if (!result.rows.length) {
      return res.status(400).json({ message: "OTP is invalid or expired. Please restart the process." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE admins SET password=$1 WHERE email=$2", [hashed, email]);

    // Mark OTP as used
    await db.query(
      "UPDATE password_reset_otps SET used=true WHERE email=$1 AND role='admin'",
      [email]
    );

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Admin ResetPassword Error:", err);
    res.status(500).json({ message: "Failed to reset password." });
  }
};

// ─────────────────────────────────────────────
// 👤 ADMIN PROFILE
// ─────────────────────────────────────────────

exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.adminId || req.query.adminId;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const result = await db.query(
      "SELECT id, name, email, phone, company, created_at FROM admins WHERE id=$1",
      [adminId]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Admin not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GetAdminProfile Error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.adminId || req.body.adminId;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { name, phone, company } = req.body;
    await db.query(
      "UPDATE admins SET name=COALESCE($1,name), phone=COALESCE($2,phone), company=COALESCE($3,company) WHERE id=$4",
      [name, phone, company, adminId]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("UpdateAdminProfile Error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.adminId || req.body.adminId;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    const result = await db.query("SELECT password FROM admins WHERE id=$1", [adminId]);
    if (!result.rows.length) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect." });

    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE admins SET password=$1 WHERE id=$2", [hashed, adminId]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("ChangeAdminPassword Error:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};