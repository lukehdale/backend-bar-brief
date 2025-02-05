const express = require("express");
const commentsController = require("../controllers/comments");

const router = express.Router();

router.post("/:barId/comments", commentsController.addComment);

router.get("/:barId/comments", commentsController.getComments);

module.exports = router;
