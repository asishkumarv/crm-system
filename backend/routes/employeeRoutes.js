const router = require("express").Router();
const {
  employeeRegister,
  employeeLogin,
  getMyLeads
} = require("../controllers/employeeController");

router.post("/register", employeeRegister);
router.post("/login", employeeLogin);

router.get("/my-leads/:id", getMyLeads);

module.exports = router;    