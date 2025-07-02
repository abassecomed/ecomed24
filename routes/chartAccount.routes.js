const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const ChartAccountController = require("../controllers/chartAccount.controller");


router.get("/", VerifyToken, ChartAccountController.getList);
router.get("/by-id/:id", ChartAccountController.getByID);
router.post("/add", VerifyToken, ChartAccountController.add);
router.patch("/update/:id", VerifyToken, ChartAccountController.update);
router.delete("/delete/:id", VerifyToken, ChartAccountController.delete);

module.exports = router;
