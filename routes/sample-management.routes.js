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
router.post("/lab-test",VerifyToken,SampleManagementController.addLabTest);
router.get("/lab-test", VerifyToken, SampleManagementController.getLabTestList);
router.get("/lab-test/by-id/:id", SampleManagementController.getLabTestByID)

module.exports = router;
