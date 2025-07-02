const express = require("express");
const router = express.Router();
const VerifyToken = require('./VerifyToken');
const invoice = require("../controllers/invoice.controller");

router.post('/create-invoice', VerifyToken, invoice.createInvoice);
router.get('/get-invoice/:id', invoice.getInvoiceById);
router.get('/list-invoices', invoice.getAllInvoices);
router.get('/list-invoices/by-origine/:id_organisation', invoice.getInvoicesByOrigine);
router.get('/partners-by-origine/:id', invoice.getPartnersByOrigine);
router.post('/create-generated-invoice', VerifyToken, invoice.createGeneratedInvoice);
router.post('/create-generated-invoice-item', VerifyToken, invoice.createGeneratedInvoiceItem);
router.get('/invoice-items-details/:organisation_origine/:organisation_destinataire', invoice.getInvoiceItemsDetailsByOrigine);
router.get('/generate-numero', invoice.generateNumero);
router.post('/preview-pdf', invoice.previewInvoicePDF);


module.exports = router;
