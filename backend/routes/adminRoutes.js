const router = require("express").Router();
const {
  adminRegister,
  verifyAdminOTP,
  adminLogin,
  getAllEmployees,
  approveEmployee,
  getEmployeeDetails,
  // Forgot Password
  adminForgotPassword,
  adminVerifyResetOtp,
  adminResetPassword,
  // Profile
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/auth");

// Auth
router.post("/register", adminRegister);
router.post("/verify-otp", verifyAdminOTP);
router.post("/login", adminLogin);

// Forgot Password (public — no auth needed)
router.post("/forgot-password", adminForgotPassword);
router.post("/verify-reset-otp", adminVerifyResetOtp);
router.post("/reset-password", adminResetPassword);

// Dashboard
router.get("/employees", getAllEmployees);
router.get("/employee-details/:id", getEmployeeDetails);
router.put("/approve/:id", approveEmployee);

// Profile (protected)
router.get("/profile", authMiddleware, getAdminProfile);
router.put("/profile", authMiddleware, updateAdminProfile);
router.put("/change-password", authMiddleware, changeAdminPassword);

module.exports = router;