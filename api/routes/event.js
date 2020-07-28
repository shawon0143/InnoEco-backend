const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");

const EventController = require("../controllers/event");

router.get("/", EventController.event_get_all);

router.post("/createEvent", checkAuth, EventController.event_create);

router.post("/register/:eventId", checkAuth, EventController.event_register);

router.get("/:eventId", EventController.event_find_by_id);




module.exports = router;