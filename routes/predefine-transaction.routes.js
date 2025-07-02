const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const PredefineTransactionController = require("../controllers/predefineTransaction.controller");


router.get("/", VerifyToken, PredefineTransactionController.getList);
router.get("/by-id/:id", PredefineTransactionController.getByID);
 router.post("/add", VerifyToken, PredefineTransactionController.add);
router.patch("/update/:id", VerifyToken, PredefineTransactionController.update);
router.delete("/delete/:id", VerifyToken, PredefineTransactionController.delete);

module.exports = router;
