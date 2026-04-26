const db = require("../db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// EMAIL CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// TWILIO CONFIG for WhatsApp
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.createLead = async (req, res) => {
  const { name, phone, email, source, query } = req.body;
  try {
    await db.query(
      "INSERT INTO leads(name,phone,email,source,query) VALUES($1,$2,$3,$4,$5)",
      [name, phone, email, source, query]
    );
    res.send("Lead added successfully");
  } catch (err) {
    console.error("Error adding lead:", err);
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
      "UPDATE leads SET status=$1 WHERE id=$2::integer", 
      [status, parseInt(id)]
    );

    // 2. Log Interaction
    await db.query(
      "INSERT INTO interactions(lead_id, employee_id, type,note) VALUES($1::integer, $2::integer, $3, $4)",
      [parseInt(id), parseInt(employeeId),status, note]
    );

    res.send("Interaction logged and status updated");
  } catch (err) {
    console.error("Interaction Logging Error:", err);
    // If table doesn't exist or logging fails, fallback to just updating the status
    try {
       await db.query("UPDATE leads SET status=$1 WHERE id=$2::integer", [status, parseInt(id)]);
       res.send("Status updated (Interaction logging failed)");
    } catch (innerErr) {
       res.status(500).send("Error updating lead state");
    }
  }
};

exports.sendBulkWhatsApp = async (req, res) => {
  const { message, leadIds } = req.body;
  const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"; // Default sandbox number

  try {
    let query = "SELECT phone FROM leads WHERE phone IS NOT NULL";
    let params = [];

    if (leadIds && leadIds !== "all") {
      query += " AND id = ANY($1)";
      params.push(leadIds);
    }

    const result = await db.query(query, params);
    const phones = result.rows.map((r) => r.phone);

    if (phones.length === 0) return res.status(400).send("No valid phone numbers found");

    const results = await Promise.allSettled(
      phones.map((phone) => {
        // Ensure phone is in whatsapp format: whatsapp:+1234567890
        const formattedPhone = phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone.startsWith("+") ? phone : "+" + phone}`;
        
        return twilioClient.messages.create({
          from: twilioNumber,
          to: formattedPhone,
          body: message,
        });
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    res.send(`WhatsApp messages processed: ${successful} sent, ${failed} failed.`);
  } catch (err) {
    console.error("WhatsApp Bulk Error:", err);
    res.status(500).send("Error sending bulk WhatsApp messages");
  }
};