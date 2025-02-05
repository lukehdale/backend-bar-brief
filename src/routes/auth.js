const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controllers/auth");

const authMiddleware = require("../middleware/auth");

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("please enter a valid email")
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists!");
          }
        });
      })
      .normalizeEmail(),
  ],
  authController.signUp
);

router.post("/login", authController.login);

router.post("/validate-token", authMiddleware, (req, res) => {
  if (req.isAuth) {
    return res.status(200).json({ isValid: true });
  }
  return res.status(401).json({ isValid: false });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

module.exports = router;
