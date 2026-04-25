const router = require("express").Router();
const {
  adminRegister,
  verifyAdminOTP,
  adminLogin,
  getAllEmployees,
  approveEmployee
} = require("../controllers/adminController");

router.post("/register", adminRegister);
router.post("/verify-otp", verifyAdminOTP);
router.post("/login", adminLogin);

// dashboard
router.get("/employees", getAllEmployees);
router.put("/approve/:id", approveEmployee);

module.exports = router;