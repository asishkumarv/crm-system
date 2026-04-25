const router = require("express").Router();
const { 
  createLead, 
  getLeads, 
  uploadLeadsCSV, 
  sendBulkEmail,
  assignLead 
} = require("../controllers/leadController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/", createLead);
router.get("/", getLeads);
router.post("/upload", upload.single("file"), uploadLeadsCSV);
router.post("/bulk-email", sendBulkEmail);
router.post("/assign", assignLead);

module.exports = router;