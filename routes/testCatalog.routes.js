const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const TestCatalogController = require("../controllers//test-catalog.controller");

router.get("/", VerifyToken, TestCatalogController.getList);
router.get("/by-id/:id", TestCatalogController.getByID);
router.post("/add", VerifyToken, TestCatalogController.add);
router.patch("/update/:id", VerifyToken, TestCatalogController.update);
router.delete("/delete/:id", VerifyToken, TestCatalogController.delete);
router.patch("/status/:id", VerifyToken, TestCatalogController.status);

module.exports = router;
