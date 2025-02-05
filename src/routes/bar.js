const express = require("express");
const router = express.Router();

const barController = require("../controllers/bar");

router.get("/nearby", barController.getBarsNearby);

module.exports = router;
