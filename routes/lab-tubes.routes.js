const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const labTubesController = require("../controllers/lab-tubes.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/lab-tubes/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
  const fullName = file.originalname.replace(/\s+/g, "_"); 
  cb(null, `${fullName}`);
}
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  }
});

router.get("/", VerifyToken, labTubesController.getList);
router.post("/", VerifyToken, upload.single("image"), labTubesController.add);
router.get("/by-id/:id", VerifyToken, labTubesController.getById);
router.patch("/update/:id", VerifyToken, upload.single("image"), labTubesController.update);
router.delete("/delete/:id", VerifyToken, labTubesController.delete);
router.patch("/status/:id", VerifyToken, labTubesController.status);

module.exports = router;
