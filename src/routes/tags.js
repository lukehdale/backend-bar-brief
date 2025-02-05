const express = require("express");
const router = express.Router();

const tagsController = require("../controllers/tags");

router.post("/:barId/add-tag", tagsController.addTag);

router.get("/:barId/tags", tagsController.getTags);

module.exports = router;
