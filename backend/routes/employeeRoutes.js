const router = require("express").Router();
const {
  employeeRegister,
  employeeLogin,
  getMyLeads,
  // Forgot Password
  employeeForgotPassword,
  employeeVerifyResetOtp,
  employeeResetPassword,
  // Profile
  getEmployeeProfile,
  updateEmployeeProfile,
  changeEmployeePassword,
} = require("../controllers/employeeController");

// Auth
router.post("/register", employeeRegister);
router.post("/login", employeeLogin);

// Forgot Password (public — no auth needed)
router.post("/forgot-password", employeeForgotPassword);
router.post("/verify-otp", employeeVerifyResetOtp);
router.post("/reset-password", employeeResetPassword);

// Leads
router.get("/my-leads/:id", getMyLeads);

// Profile
router.get("/profile/:id", getEmployeeProfile);
router.put("/profile/:id", updateEmployeeProfile);
router.put("/change-password/:id", changeEmployeePassword);

module.exports = router;