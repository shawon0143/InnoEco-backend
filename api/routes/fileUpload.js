const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");

const FileUploadController = require("../controllers/fileUpload");

router.post("/sign_s3", checkAuth, FileUploadController.sign_s3);

router.delete("/s3_delete_object/:fileName", checkAuth, FileUploadController.s3_delete_object);

module.exports = router;
