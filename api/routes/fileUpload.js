const express = require("express");
const router = express.Router();

// const checkAuth = require("../middleware/check-auth");

const FileUploadController = require("../controllers/fileUpload");

// router.post("sign_s3", checkAuth, FileUploadController.sign_s3);
router.post("/sign_s3", FileUploadController.sign_s3);

module.exports = router;
