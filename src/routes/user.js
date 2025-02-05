const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const authMiddleware = require("../middleware/auth");

router.get("/user", authMiddleware, userController.getUser);

router.post("/add-favorite", authMiddleware, userController.addFavorite);

module.exports = router;
