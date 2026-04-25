const router = require("express").Router();
const {
  adminRegister,
  verifyAdminOTP,
  adminLogin,
  getAllEmployees,
  approveEmployee,
  getEmployeeDetails
} = require("../controllers/adminController");

router.post("/register", adminRegister);
router.post("/verify-otp", verifyAdminOTP);
router.post("/login", adminLogin);

// dashboard
router.get("/employees", getAllEmployees);
router.get("/employee-details/:id", getEmployeeDetails);
router.put("/approve/:id", approveEmployee);

module.exports = router;