const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");

const UserController = require("../controllers/user");

router.post("/signup", UserController.user_signup);

router.post("/login", UserController.user_login);

router.delete("/:userId", checkAuth, UserController.user_delete);

router.get("/verifyAccount/:token", UserController.user_verify);

router.post("/resendToken", UserController.user_resend_token);

module.exports = router;
