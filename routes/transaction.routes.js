const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const transactionController = require("../controllers/transaction.controller");

router.get("/", VerifyToken, transactionController.getList);
router.get("/by-id/:id", transactionController.getById);
router.post("/add", VerifyToken, transactionController.add);
router.patch("/update/:id", VerifyToken, transactionController.update);
router.delete("/delete/:id", VerifyToken, transactionController.delete);
router.patch("/status/:id", VerifyToken, transactionController.status);

module.exports = router;
