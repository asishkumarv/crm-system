const router = require("express").Router();
const { createLead, getLeads } = require("../controllers/leadController");

router.post("/", createLead);
router.get("/", getLeads);

module.exports = router;