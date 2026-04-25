const db = require("../db");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

exports.uploadLeads = [
  upload.single("file"),
  async (req, res) => {
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        for (let lead of results) {
          await db.query(
            "INSERT INTO leads(name,phone,email,source) VALUES($1,$2,$3,$4)",
            [lead.name, lead.phone, lead.email, "imported"]
          );
        }

        res.send("Uploaded");
      });
  },
];

exports.getLeads = async (req, res) => {
  const leads = await db.query("SELECT * FROM leads ORDER BY id DESC");
  res.json(leads.rows);
};