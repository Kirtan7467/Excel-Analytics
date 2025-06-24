const {
  signup,
  adminSignup,
  login,
  adminLogin,
} = require("../Controllers/AuthController");
const {
  signupValidation,
  adminSignupValidation,
  loginValidation,
  adminLoginValidation,
} = require("../Middlewares/AuthValidation");

const router = require("express").Router();

router.post("/signup", signupValidation, signup);
router.post("/admin-signup", adminSignupValidation, adminSignup);
router.post("/login", loginValidation, login);
router.post("/admin-login", adminLoginValidation, adminLogin);

module.exports = router;
