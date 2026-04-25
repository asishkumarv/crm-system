const router = require("express").Router();
const { uploadLeads, getLeads } = require("../controllers/leadController");

router.post("/upload", uploadLeads);
router.get("/", getLeads);

module.exports = router;