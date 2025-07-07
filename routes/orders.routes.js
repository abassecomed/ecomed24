const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const OrdersController = require("../controllers/orders.controller");

router.get("/", VerifyToken, OrdersController.getList);
router.get("/by-id/:id", OrdersController.getByID);
router.post("/add", VerifyToken, OrdersController.add);
router.patch("/update/:id", VerifyToken, OrdersController.update);
router.delete("/delete/:id", VerifyToken, OrdersController.delete);
router.patch("/status/:id", VerifyToken, OrdersController.status);
router.post("/lab-test",VerifyToken,OrdersController.addLabTest);
router.get("/lab-test", VerifyToken, OrdersController.getLabTestList);
router.get("/lab-test/by-id/:id", OrdersController.getLabTestByID)

module.exports = router;
