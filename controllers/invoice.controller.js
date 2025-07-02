const Sequelize = require("sequelize");
const { Op } = Sequelize;
const moment = require("moment");
// const { jsPDF } = require('jspdf'); // PDF: décommente si tu utilises jsPDF
const Mailer = require('../helpers/Mailer'); // Assure-toi que ce helper est bien créé
// const generateInvoicePDF = require('../helpers/pdfHelper'); // PDF: décommente si tu utilises la génération PDF
const { sequelize } = require('../config');
const PDFDocument = require('pdfkit');



var Invoice = require("../models/Invoice");
var InvoiceItem = require("../models/InvoiceItem");
var Organisation = require('../models/Organisation');
var GeneratedInvoiceItem = require('../models/GeneratedInvoiceItem');
var GeneratedInvoice = require('../models/GeneratedInvoice');
// var GeneratedInvoiceItem = require('../models/GeneratedInvoiceItem'); // Importer le modèle GeneratedInvoiceItem   


// Remplacer l'import direct du modèle par l'import du service

Organisation.hasMany(Invoice, {
  foreignKey: 'id_organisation_destinataire',
  as: 'factures_reçues'
});
// 🧩 Importer les modèles nécessaires

// 🧩 Définir les associations au tout début
Invoice.hasMany(InvoiceItem, {
  foreignKey: "invoice_id",
  as: "items",
});
InvoiceItem.belongsTo(Invoice, {
  foreignKey: "invoice_id",
  as: "invoice",
});

Invoice.belongsTo(Organisation, {
  foreignKey: 'id_organisation_origine',
  as: 'origine'
});

Invoice.belongsTo(Organisation, {
  foreignKey: 'id_organisation_destinataire',
  as: 'destinataire'
});


// 📌 Génération automatique de numéro unique (FAC-YYYY-XXXX)
exports.generateNumero = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne({
      order: [["id", "DESC"]],
    });
    const nextId = lastInvoice ? lastInvoice.id + 1 : 1;
    const numero = `FAC-${new Date().getFullYear()}-${String(nextId).padStart(4, "0")}`;
    res.json({ success: true, numero });
  } catch (error) {
    console.error("Erreur lors de la génération du numéro de facture :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ✅ Créer une facture
exports.createInvoice = async (req, res) => {
  try {
    const { id_organisation_origine, id_organisation_destinataire, date_facture, envoyee_a, par, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Aucune ligne de facture fournie." });
    }

    const numero = await generateNumero();

    const montantTotal = items.reduce((sum, item) => {
      const qte = Number(item.quantity || 0);
      const prix = Number(item.unit_price || 0);
      return sum + qte * prix;
    }, 0);

    const invoice = await Invoice.create({
      numero,
      date_facture,
      envoyee_a,
      par,
      montant: montantTotal,
      statut: "EN ATTENTE DU PAIEMENT",
      notes,
      id_organisation_origine,
      id_organisation_destinataire
    });

    const invoiceItems = items.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      beneficiaire: item.beneficiaire,
      reference: item.reference,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.unit_price * item.quantity,
      service_code: item.service_code,
    }));

    await InvoiceItem.bulkCreate(invoiceItems);

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [{ model: InvoiceItem, as: "items" }],
    });

    res.status(201).json({
      success: true,
      message: "Facture créée avec succès",
      data: fullInvoice,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la facture :", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur lors de la création de la facture.",
      });
  }
};

// ✅ Récupérer une facture par ID
exports.getInvoiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await Invoice.findByPk(id, {
      include: [{ model: InvoiceItem, as: "items" }],
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Facture non trouvée." });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ✅ Lister toutes les factures
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [{ model: InvoiceItem, as: "items" }],
      order: [["date_facture", "DESC"]],
    });

    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Erreur lors de la récupération des factures :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

exports.getInvoicesByOrigine = async (req, res) => {
  const { id_organisation } = req.params;

  try {
    const invoices = await Invoice.findAll({
      where: { id_organisation_origine: id_organisation },
      include: [{ model: InvoiceItem, as: 'items' }],
      order: [['date_facture', 'DESC']]
    });

    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Erreur lors de la récupération des factures par origine :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

exports.getPartnersByOrigine = async (req, res) => {
  const { id } = req.params;

  try {
    // On récupère les bénéficiaires distincts (id organisation) pour lesquels il existe au moins un item de facture créé par l'organisation d'origine
    const partners = await InvoiceItem.findAll({
      where: { organisation_origine: id },
      attributes: [
        [Sequelize.col('organisation_destinataire'), 'id'],
        [Sequelize.literal('(SELECT nom FROM Organisation WHERE Organisation.id = InvoiceItem.organisation_destinataire)'), 'nom'],
        [Sequelize.col('type'), 'type']
      ],
      group: ['organisation_destinataire', 'type'],
      raw: true
    });

    res.json({ success: true, data: partners });
  } catch (error) {
    console.error('Erreur récupération bénéficiaires :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};


exports.generateInvoiceFromItems = async (req, res) => {
  const { items, par, note, email, date_facture } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Aucun item sélectionné." });
  }

  try {
    // 1. Récupération des items
    const invoiceItems = await InvoiceItem.findAll({
      where: { id: items, statut: 'LIBRE' },
      include: [{ model: Invoice, as: 'invoice' }]
    });

    if (invoiceItems.length === 0) {
      return res.status(404).json({ success: false, message: "Aucun item libre trouvé." });
    }

    // 2. Vérification de cohérence : tous les items ont le même destinataire
    const destinataireIds = [...new Set(invoiceItems.map(it => it.invoice.id_organisation_destinataire))];
    const origineIds = [...new Set(invoiceItems.map(it => it.invoice.id_organisation_origine))];

    if (destinataireIds.length !== 1 || origineIds.length !== 1) {
      return res.status(400).json({ success: false, message: "Tous les items doivent appartenir à une même organisation origine et destinataire." });
    }

    const id_organisation_destinataire = destinataireIds[0];
    const id_organisation_origine = origineIds[0];

    // 3. Calcul du montant total
    const montant = invoiceItems.reduce((sum, item) => sum + parseFloat(item.total), 0);

    // 4. Génération du numéro
    const numero = await generateNumero(); // ex: FAC-2025-009

    // 5. Création de la facture
    const invoice = await Invoice.create({
      numero,
      date_facture: date_facture || new Date(),
      envoyee_a: id_organisation_destinataire,
      par,
      montant,
      notes: note,
      statut: 'EN ATTENTE DU PAIEMENT',
      id_organisation_origine,
      id_organisation_destinataire
    });

    // 6. Mise à jour des items sélectionnés
    await InvoiceItem.update(
      { invoice_id: invoice.id, statut: 'FACTURÉ' },
      { where: { id: items } }
    );

    // 7. Génération PDF (placeholder ici)
    // const pdfBuffer = await generateInvoicePDF(invoice.id); // PDF: décommente si tu utilises la génération PDF

    // 8. Envoi email si fourni
    // if (email) {
    //   await Mailer({
    //     to: email,
    //     subject: `Facture ${invoice.numero}`,
    //     text: 'Veuillez trouver en pièce jointe votre facture.',
    //     attachments: [{
    //       filename: `Facture-${invoice.numero}.pdf`,
    //       content: pdfBuffer
    //     }]
    //   });
    // }

    res.status(201).json({
      success: true,
      message: 'Facture générée avec succès',
      data: invoice
    });

  } catch (error) {
    console.error("Erreur création facture:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Créer un GeneratedInvoice
exports.createGeneratedInvoice = async (req, res) => {
  try {
    const { invoice_id, total, pdf_path, qr_code_path, sent_to, sent_at, statut, envoyee_a, envoyee_par, created_at, items } = req.body;
    // Création du generated_invoice
    const generatedInvoice = await GeneratedInvoice.create({
      invoice_id,
      total,
      pdf_path,
      qr_code_path,
      sent_to,
      sent_at,
      statut,
      envoyee_a,
      envoyee_par,
      created_at
    });
    // Création des liaisons avec les items
    if (Array.isArray(items) && items.length > 0) {
      const generatedItems = items.map(invoice_item_id => ({
        generated_invoice_id: generatedInvoice.id,
        invoice_item_id
      }));
      await bulkCreateGeneratedInvoiceItems(generatedItems);
    }
    res.status(201).json({ success: true, data: generatedInvoice });
  } catch (error) {
    console.error("Erreur lors de la création du generated_invoice :", error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la création du generated_invoice." });
  }
};

// Fonction utilitaire pour créer les GeneratedInvoiceItems un par un (sans bulkCreate)
async function bulkCreateGeneratedInvoiceItems(items) {
  // items = [{ generated_invoice_id, invoice_item_id }, ...]
  const results = [];
  for (const item of items) {
    const created = await GeneratedInvoiceItem.create(item);
    results.push(created);
  }
  return results;
}

// Créer un GeneratedInvoiceItem seul
exports.createGeneratedInvoiceItem = async (req, res) => {
  try {
    const { generated_invoice_id, invoice_item_id } = req.body;
    const item = await GeneratedInvoiceItem.create({ generated_invoice_id, invoice_item_id });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("Erreur lors de la création du generated_invoice_item :", error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la création du generated_invoice_item." });
  }
};

// Récupérer les items de facture enrichis pour une organisation d'origine donnée
exports.getInvoiceItemsDetailsByOrigine = async (req, res) => {
  const { organisation_origine, organisation_destinataire } = req.params;
  try {
    const results = await sequelize.query(`
      SELECT 
        invoice_items.id,
        invoice_items.createdAt as date,
        invoice_items.organisation_origine, 
        invoice_items.organisation_destinataire, 
        org_destinataire.nom, 
        CONCAT(patient.name, ' ', patient.last_name) AS patient, 
        REPLACE(TRIM(REPLACE(REPLACE(payment_category.prestation, '  ', ' '), '  ', ' ')), '  ', ' ') AS prestation, 
        invoice_items.doit_payer_partenaire, 
        invoice_items.payer_patient, 
        invoice_items.chargeMutuelle, 
        invoice_items.statut, 
        invoice_items.type
      FROM invoice_items
      JOIN patient ON patient.id = invoice_items.beneficiaire
      JOIN payment_category ON payment_category.id = invoice_items.service_code
      JOIN organisation AS org_destinataire ON invoice_items.organisation_destinataire = org_destinataire.id
      WHERE invoice_items.organisation_origine = :organisation_origine
        AND invoice_items.organisation_destinataire = :organisation_destinataire
    `, {
      replacements: { organisation_origine, organisation_destinataire },
      type: sequelize.QueryTypes.SELECT
    });
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Erreur lors de la récupération des items de facture détaillés :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

exports.previewInvoicePDF = async (req, res) => {
  try {
    const invoiceData = req.body;

    // Création du PDF en mémoire
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
      });
      res.send(pdfData);
    });

    // --- Exemple de contenu minimal ---
    doc.fontSize(20).text('Prévisualisation Facture', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Facture N°: ${invoiceData.numero || ''}`);
    doc.text(`Date: ${invoiceData.dateFacture || ''}`);
    doc.text(`Émise par: ${invoiceData.par || ''}`);
    doc.moveDown();
    doc.text('Détail des services:');
    (invoiceData.items || []).forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item.prestation || item.description || ''} - ${item.doit_payer_partenaire || item.unitPrice || ''} FCFA`);
    });
    doc.moveDown();
    doc.text(`Total: ${invoiceData.totalAmount || ''} FCFA`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Erreur génération preview PDF:', error);
    res.status(500).json({ success: false, message: 'Erreur génération PDF' });
  }
};