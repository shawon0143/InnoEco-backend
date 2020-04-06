const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const KnowledgeController = require("../controllers/knowledge");

router.get("/", KnowledgeController.knowledge_get_all);

router.post("/", checkAuth, KnowledgeController.knowledge_create );

router.get("/:knowledgeId", KnowledgeController.knowledge_find_by_id);

router.patch("/:knowledgeId", checkAuth, KnowledgeController.knowledge_update);

router.delete("/:knowledgeId", checkAuth, KnowledgeController.knowledge_delete);


module.exports = router;
