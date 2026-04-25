const router = require("express").Router();
const { register, login, approveUser } = require("../controllers/authController");

// router.post("/register", register);
// router.post("/login", login);
// router.put("/approve/:id", approveUser);

module.exports = router; // ✅ MUST BE THIS