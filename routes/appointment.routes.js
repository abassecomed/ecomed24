const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const appointmentController = require("../controllers/appointment.controller");

// appointmentt
router.get("/", VerifyToken, appointmentController.getList);
router.get("/filtered", VerifyToken, appointmentController.getListFiltered); // 🎯 Nouvelle route SCRUM-106
router.get("/by-id/:appointment_id", appointmentController.getByID);
router.post("/add", VerifyToken, appointmentController.add);
router.post("/update/:appointment_id", VerifyToken, appointmentController.update);
router.put("/reschedule/:appointment_id", VerifyToken, appointmentController.reschedule);
router.delete("/delete/:appointment_id", VerifyToken, appointmentController.delete);
router.patch("/status/:appointment_id", VerifyToken, appointmentController.status);
router.post("/time-slots", VerifyToken, appointmentController.timeSlotAppontment);
router.post("/teleconference", appointmentController.createTeleconferenceLink);
module.exports = router;
