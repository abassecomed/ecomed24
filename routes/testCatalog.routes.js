const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const TestCatalogController = require("../controllers//test-catalog.controller");
const verifyToken = require("./VerifyToken");

router.get("/", VerifyToken, TestCatalogController.getList);
router.get("/by-id/:id", TestCatalogController.getByID);
router.post("/add", VerifyToken, TestCatalogController.add);
router.patch("/update/:id", VerifyToken, TestCatalogController.update);
router.delete("/delete/:id", VerifyToken, TestCatalogController.delete);
router.patch("/status/:id", VerifyToken, TestCatalogController.status);
router.post("/lab-test",VerifyToken,TestCatalogController.addLabTest);
router.get("/lab-test", verifyToken, TestCatalogController.getLabTestList);
router.get("/lab-test/by-id/:id", verifyToken, TestCatalogController.getLabTestByID)
module.exports = router;
