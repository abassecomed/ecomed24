const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const SampleManagementController = require("../controllers/sample-management.contoller");


router.get("/", VerifyToken, SampleManagementController.getList);
router.get("/by-id/:id", SampleManagementController.getByID);
router.post("/add", VerifyToken, SampleManagementController.add);
router.patch("/update/:id", VerifyToken, SampleManagementController.update);
router.delete("/delete/:id", VerifyToken, SampleManagementController.delete);
router.patch("/status/:id", VerifyToken, SampleManagementController.status);

module.exports = router;
