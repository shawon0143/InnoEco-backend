const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");

const KnowledgeController = require("../controllers/knowledge");

router.post("/", checkAuth, KnowledgeController.knowledge_create );

module.exports = router;
