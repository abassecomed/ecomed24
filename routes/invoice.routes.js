const express = require("express");
const router = express.Router();
const VerifyToken = require("./VerifyToken");
const invoice = require("../controllers/invoice.controller");

router.post("/create-invoice", VerifyToken, invoice.createInvoice);
router.get("/get-invoice/:id", invoice.getInvoiceById);
router.get("/list-invoices", invoice.getAllInvoices);
router.get(
  "/list-invoices/by-origine/:id_organisation",
  invoice.getInvoicesByOrigine
);
router.get("/partners-by-origine/:id", invoice.getPartnersByOrigine);
router.post(
  "/create-generated-invoice",
  VerifyToken,
  invoice.createGeneratedInvoice
);
router.post(
  "/create-generated-invoice-item",
  VerifyToken,
  invoice.createGeneratedInvoiceItem
);
router.get(
  "/invoice-items-details/:organisation_origine/:organisation_destinataire",
  invoice.getInvoiceItemsDetailsByOrigine
);
router.get("/generate-numero", invoice.generateNumero);
router.post("/preview-pdf", invoice.previewInvoicePDF);
// router.post("/validate", invoice.validateInvoice);
router.post("/create", invoice.createInvoice);
router.get("/invoices", invoice.listInvoices);


// Route pour upload PDF
router.post("/validate", invoice.validateInvoiceFromPreview);
router.post(
  "/upload-pdf",
  invoice.uploadInvoicePDFMiddleware,
  invoice.uploadInvoicePDF
);

router.get("/:invoiceId/download", invoice.downloadInvoicePDF);
router.get('/:invoiceId/payments', invoice.getInvoicePayments);
router.post('/:invoiceId/pay', invoice.processPayment);
router.post("/:invoiceId/:userId/send-reminder", invoice.sendReminderEmail);



module.exports = router;
