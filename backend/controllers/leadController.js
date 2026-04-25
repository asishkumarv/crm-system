const db = require("../db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const nodemailer = require("nodemailer");

// EMAIL CONFIG for bulk emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.createLead = async (req, res) => {
  const { name, phone, email, source } = req.body;
  try {
    await db.query(
      "INSERT INTO leads(name,phone,email,source) VALUES($1,$2,$3,$4)",
      [name, phone, email, source]
    );
    res.send("Lead added successfully");
  } catch (err) {
    res.status(500).send("Error adding lead");
  }
};

exports.getLeads = async (req, res) => {
  try {
    const leads = await db.query("SELECT * FROM leads ORDER BY created_at DESC");
    res.json(leads.rows);
  } catch (err) {
    res.status(500).send("Error fetching leads");
  }
};

exports.uploadLeadsCSV = async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        for (let lead of results) {
          const { name, phone, email, source } = lead;
          await db.query(
            "INSERT INTO leads(name,phone,email,source) VALUES($1,$2,$3,$4)",
            [name, phone, email, source || 'CSV Upload']
          );
        }
        fs.unlinkSync(req.file.path); // Delete file after processing
        res.send(`${results.length} leads imported successfully`);
      } catch (err) {
        res.status(500).send("Error importing leads");
      }
    });
};

exports.sendBulkEmail = async (req, res) => {
  const { subject, message, leadIds } = req.body; // leadIds is an array of IDs or "all"

  try {
    let query = "SELECT email FROM leads WHERE email IS NOT NULL";
    let params = [];
    
    if (leadIds && leadIds !== "all") {
      query += " AND id = ANY($1)";
      params.push(leadIds);
    }

    const result = await db.query(query, params);
    const emails = result.rows.map(r => r.email);

    if (emails.length === 0) return res.status(400).send("No valid emails found");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emails.join(","),
      subject: subject,
      text: message,
    });

    res.send(`Email sent to ${emails.length} leads`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending bulk emails");
  }
};

exports.assignLead = async (req, res) => {
  const { leadId, employeeId } = req.body;
  try {
    await db.query("UPDATE leads SET assigned_to=$1 WHERE id=$2", [employeeId, leadId]);
    res.send("Lead assigned successfully");
  } catch (err) {
    res.status(500).send("Error assigning lead");
  }
};

exports.logInteraction = async (req, res) => {
  const { id } = req.params;
  const { status, note, employeeId } = req.body;
  
  if (!note || note.length < 5) {
    return res.status(400).send("A descriptive note is required to update status.");
  }

  try {
    // 1. Update Lead Status
    await db.query(
      "UPDATE leads SET status=$1 WHERE id=$2", 
      [status, id]
    );

    // 2. Log Interaction (Assuming we might have an interactions table or just storing last note)
    // For now, let's update a 'last_note' column or similar in leads if interactions table isn't ready
    // But let's try to be robust and add it to a log
    await db.query(
      "INSERT INTO interactions(lead_id, employee_id, note, type) VALUES($1, $2, $3, $4)",
      [id, employeeId, note, status]
    );

    res.send("Interaction logged and status updated");
  } catch (err) {
    console.error(err);
    // If table doesn't exist, fallback to just updating the status for now
    try {
       await db.query("UPDATE leads SET status=$1 WHERE id=$2", [status, id]);
       res.send("Status updated (Interaction logging failed - system check required)");
    } catch (innerErr) {
       res.status(500).send("Error updating lead state");
    }
  }
};