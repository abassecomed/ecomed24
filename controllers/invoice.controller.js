const Sequelize = require("sequelize");
const { Op } = Sequelize;
const moment = require("moment");
const multer = require("multer");
// const { jsPDF } = require('jspdf'); // PDF: décommente si tu utilises jsPDF
const Mailer = require("../helpers/Mailer"); // Assure-toi que ce helper est bien créé
// const generateInvoicePDF = require('../helpers/pdfHelper'); // PDF: décommente si tu utilises la génération PDF
const { sequelize } = require("../config");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
var Invoice = require("../models/Invoice");
var InvoiceItem = require("../models/InvoiceItem");
var Organisation = require("../models/Organisation");
var GeneratedInvoiceItem = require("../models/GeneratedInvoiceItem");
var GeneratedInvoice = require("../models/GeneratedInvoice");
const Email = require("../models/Email");
const AutoEmailTemplate = require("../models/AutoEmailTemplate");
const InvoicePayment = require("../models/InvoicePayment");
const dayjs = require("dayjs");
const DaysLater = process.env.DaysLater;
InvoicePayment.belongsTo(Invoice, {
  foreignKey: "invoice_id",
  as: "invoice",
});

InvoicePayment.associate = (models) => {
  InvoicePayment.belongsTo(models.User, {
    foreignKey: "created_by", // clé étrangère vers users.id
    as: "auteur",
  });
};

// var GeneratedInvoiceItem = require('../models/GeneratedInvoiceItem'); // Importer le modèle GeneratedInvoiceItem
Invoice.belongsTo(Organisation, {
  foreignKey: "id_organisation_destinataire",
  as: "OrganisationDestinataire",
});
require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
  extensions: [".js", ".jsx"],
  ignore: [/node_modules/],
});
require("ignore-styles");

// Remplacer l'import direct du modèle par l'import du service

Organisation.hasMany(Invoice, {
  foreignKey: "id_organisation_destinataire",
  as: "factures_reçues",
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
  foreignKey: "id_organisation_origine",
  as: "origine",
});

Invoice.belongsTo(Organisation, {
  foreignKey: "id_organisation_destinataire",
  as: "destinataire",
});

// 📌 Génération automatique de numéro unique (FAC-YYYY-XXXX)
exports.generateNumero = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne({
      order: [["id", "DESC"]],
    });
    const nextId = lastInvoice ? lastInvoice.id + 1 : 1;
    const numero = `FAC-${new Date().getFullYear()}-${String(nextId).padStart(
      4,
      "0"
    )}`;
    res.json({ success: true, numero });
  } catch (error) {
    console.error("Erreur lors de la génération du numéro de facture :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
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
      include: [{ model: InvoiceItem, as: "items" }],
      order: [["date_facture", "DESC"]],
    });

    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des factures par origine :",
      error
    );
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
        [Sequelize.col("organisation_destinataire"), "id"],
        [
          Sequelize.literal(
            "(SELECT nom FROM Organisation WHERE Organisation.id = InvoiceItem.organisation_destinataire)"
          ),
          "nom",
        ],
        [Sequelize.col("type"), "type"],
      ],
      group: ["organisation_destinataire", "type"],
      raw: true,
    });

    res.json({ success: true, data: partners });
  } catch (error) {
    console.error("Erreur récupération bénéficiaires :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

exports.generateInvoiceFromItems = async (req, res) => {
  const { items, par, note, email, date_facture } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Aucun item sélectionné." });
  }

  try {
    // 1. Récupération des items
    const invoiceItems = await InvoiceItem.findAll({
      where: { id: items, statut: "LIBRE" },
      include: [{ model: Invoice, as: "invoice" }],
    });

    if (invoiceItems.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Aucun item libre trouvé." });
    }

    // 2. Vérification de cohérence : tous les items ont le même destinataire
    const destinataireIds = [
      ...new Set(
        invoiceItems.map((it) => it.invoice.id_organisation_destinataire)
      ),
    ];
    const origineIds = [
      ...new Set(invoiceItems.map((it) => it.invoice.id_organisation_origine)),
    ];

    if (destinataireIds.length !== 1 || origineIds.length !== 1) {
      return res.status(400).json({
        success: false,
        message:
          "Tous les items doivent appartenir à une même organisation origine et destinataire.",
      });
    }

    const id_organisation_destinataire = destinataireIds[0];
    const id_organisation_origine = origineIds[0];

    // 3. Calcul du montant total
    const montant = invoiceItems.reduce(
      (sum, item) => sum + parseFloat(item.total),
      0
    );

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
      statut: "EN ATTENTE DU PAIEMENT",
      id_organisation_origine,
      id_organisation_destinataire,
    });

    // 6. Mise à jour des items sélectionnés
    await InvoiceItem.update(
      { invoice_id: invoice.id, statut: "FACTURÉ" },
      { where: { id: items } }
    );

    // 7. Génération PDF (placeholder ici)
    // const pdfBuffer = await generateInvoicePDF(invoice.id); // PDF: décommente si tu utilises la génération PDF

    res.status(201).json({
      success: true,
      message: "Facture générée avec succès",
      data: invoice,
    });
  } catch (error) {
    console.error("Erreur création facture:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Créer un GeneratedInvoice
exports.createGeneratedInvoice = async (req, res) => {
  try {
    const {
      invoice_id,
      total,
      pdf_path,
      qr_code_path,
      sent_to,
      sent_at,
      statut,
      envoyee_a,
      envoyee_par,
      created_at,
      items,
    } = req.body;
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
      created_at,
    });
    // Création des liaisons avec les items
    if (Array.isArray(items) && items.length > 0) {
      const generatedItems = items.map((invoice_item_id) => ({
        generated_invoice_id: generatedInvoice.id,
        invoice_item_id,
      }));
      await bulkCreateGeneratedInvoiceItems(generatedItems);
    }
    res.status(201).json({ success: true, data: generatedInvoice });
  } catch (error) {
    console.error("Erreur lors de la création du generated_invoice :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du generated_invoice.",
    });
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
    const item = await GeneratedInvoiceItem.create({
      generated_invoice_id,
      invoice_item_id,
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error(
      "Erreur lors de la création du generated_invoice_item :",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du generated_invoice_item.",
    });
  }
};

// Récupérer les items de facture enrichis pour une organisation d'origine donnée
exports.getInvoiceItemsDetailsByOrigine = async (req, res) => {
  const { organisation_origine, organisation_destinataire } = req.params;
  try {
    const results = await sequelize.query(
      `
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
        AND invoice_items.invoice_id IS NULL
        AND invoice_items.statut IN ('LIBRE')
    `,
      {
        replacements: { organisation_origine, organisation_destinataire },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    res.json({ success: true, data: results });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des items de facture détaillés :",
      error
    );
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

exports.previewInvoicePDF = async (req, res) => {
  try {
    const {
      invoiceNumber,
      prestations,
      totalAmount,
      partnerType,
      userName,
      organisationOrigine,
      organisationPartenaire,
      invoiceDate,
      barcodeUrl,
    } = req.body;

    const pdfPath = path.join(
      __dirname,
      "..",
      "uploads",
      "invoices",
      `${invoiceNumber}.pdf`
    );

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // En-tête
    doc.fontSize(16).text(`Facture N° ${invoiceNumber}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${invoiceDate}`);
    doc.text(`Émis par: ${userName}`);
    doc.text(`Montant total: ${totalAmount} FCFA`);
    doc.moveDown();
    doc.text(`Partenaire: ${organisationPartenaire?.nom || "N/A"}`);

    doc.moveDown().fontSize(14).text("Prestations:", { underline: true });
    prestations.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${item.prestation} - ${
            item.doit_payer_partenaire
          } FCFA`
        );
    });

    doc.end();

    writeStream.on("finish", () => {
      return res.status(200).json({
        success: true,
        message: "Prévisualisation créée avec succès.",
        filePath: `uploads/invoices/${invoiceNumber}.pdf`,
      });
    });

    writeStream.on("error", (err) => {
      console.error("Erreur écriture PDF:", err);
      return res.status(500).json({
        success: false,
        message: "Erreur génération PDF",
      });
    });
  } catch (err) {
    console.error("Erreur previewInvoicePDF:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la prévisualisation de la facture.",
    });
  }
};

exports.createInvoice = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      numero,
      date_facture,
      envoyee_a,
      par,
      montant,
      notes,
      id_organisation_origine,
      id_organisation_destinataire,
      itemsSelected,
    } = req.body;

    const invoice = await Invoice.create(
      {
        numero,
        date_facture,
        envoyee_a,
        par,
        montant,
        notes: notes || null,
        id_organisation_origine,
        id_organisation_destinataire,
      },
      { transaction: t }
    );

    if (Array.isArray(itemsSelected) && itemsSelected.length > 0) {
      await InvoiceItem.update(
        { invoice_id: invoice.id },
        { where: { id: itemsSelected }, transaction: t }
      );
    }

    await t.commit();

    res.status(201).json({
      success: true,
      message: "Facture créée avec succès",
      invoiceId: invoice.id,
    });
  } catch (error) {
    await t.rollback();
    console.error("Erreur création facture :", error);
    res
      .status(500)
      .json({ success: false, message: "Erreur création facture" });
  }
};

exports.validateInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    console.log("🔹 Données reçues pour validation facture :", invoiceData);

    // 1. Chemin de sauvegarde
    const filename = `${invoiceData.numero}.pdf`;
    const uploadDir = path.join(__dirname, "..", "uploads", "invoices");
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("📁 Dossier de factures créé :", uploadDir);
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text("FACTURE", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Facture N°: ${invoiceData.numero}`);
    doc.text(`Date: ${invoiceData.date_facture}`);
    doc.text(`Émise par: ${invoiceData.par}`);
    doc.text(`Montant: ${invoiceData.montant} FCFA`);
    doc.moveDown();
    doc.text("Détail des services :");

    (invoiceData.items || []).forEach((item, idx) => {
      doc.text(
        `${idx + 1}. ${item.prestation} - ${item.doit_payer_partenaire} FCFA`
      );
    });

    doc.end();

    writeStream.on("finish", async () => {
      const transaction = await sequelize.transaction();
      try {
        const invoice = await Invoice.create(
          {
            numero: invoiceData.numero,
            date_facture: invoiceData.date_facture,
            envoyee_a: invoiceData.envoyee_a,
            par: invoiceData.par,
            montant: invoiceData.montant,
            notes: invoiceData.notes || "",
            statut: "EN ATTENTE DU PAIEMENT",
            id_organisation_origine: invoiceData.id_organisation_origine,
            id_organisation_destinataire:
              invoiceData.id_organisation_destinataire,
            pdf_path: "uploads/invoices/" + filename,
            email_envoye:
              Array.isArray(invoiceData.emails) && invoiceData.emails.length > 0
                ? invoiceData.emails.join(";")
                : null,
          },
          { transaction }
        );

        console.log("✅ Facture créée avec ID :", invoice.id);

        if (
          Array.isArray(invoiceData.itemsSelected) &&
          invoiceData.itemsSelected.length > 0
        ) {
          console.log(
            "🔄 Mise à jour des items liés :",
            invoiceData.itemsSelected
          );
          await InvoiceItem.update(
            { invoice_id: invoice.id, statut: "FACTURÉ" },
            {
              where: { id: invoiceData.itemsSelected },
              transaction,
            }
          );
        }

        await transaction.commit();

        // 🔁 Envoi des emails
        console.log(
          "📧 Envoi des emails de notification...",
          invoiceData.emails
        );
        if (invoiceData.emails) {
          try {
            const emails = Array.isArray(invoiceData.emails)
              ? invoiceData.emails
              : (invoiceData.emails || "")
                  .split(";")
                  .map((e) => e.trim())
                  .filter((e) => e);

            console.log("📧 Emails à envoyer :", emails);

            const template = await AutoEmailTemplate.findOne({
              where: { type: "facture_light" },
            });

            if (!template) {
              console.warn("📭 Template 'facture_light' non trouvé !");
            } else {
              const periode =
                invoiceData.periode_facture || invoiceData.date_facture;
              const org = await Organisation.findByPk(
                invoiceData.id_organisation_origine
              );
              const orgNom = org?.nom || "ecoMed24";

              const shortcodes = {
                nro_facture: invoiceData.numero,
                nom_organisation_prestataire: orgNom,
                periode_facture: periode,
              };

              const replaceShortcodes = (text, variables) => {
                for (const [key, value] of Object.entries(variables)) {
                  text = text.replace(new RegExp(`{${key}}`, "g"), value);
                }
                return text;
              };

              const subject = replaceShortcodes(template.name, shortcodes);
              const messageFinal = replaceShortcodes(
                template.message,
                shortcodes
              );

              for (const email of emails) {
                console.log(`📨 Enregistrement email pour ${email}`);
                await Email.create({
                  is_sent: null,
                  subject,
                  date: moment().format("YYYY-MM-DD HH:mm:ss"),
                  message: messageFinal.trim(),
                  reciepient: email,
                  attachment_path: filePath,
                  user: req.userId || null,
                });

                await Mailer({
                  to: email,
                  subject,
                  text: messageFinal,
                  attachments: [
                    {
                      filename: path.basename(filePath),
                      path: filePath,
                    },
                  ],
                });
              }

              console.log("✅ Tous les emails ont été enregistrés !");
            }
          } catch (emailError) {
            console.error(
              "❌ Erreur lors de la création des emails :",
              emailError
            );
          }
        }

        return res.status(200).json({
          success: true,
          message: "Facture validée et enregistrée.",
          filePath,
        });
      } catch (err) {
        await transaction.rollback();
        console.error("❌ Erreur enregistrement facture :", err);
        return res.status(500).json({
          success: false,
          message: "Erreur lors de l'enregistrement de la facture.",
        });
      }
    });

    writeStream.on("error", async (err) => {
      console.error("❌ Erreur d'écriture du PDF :", err);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la génération du fichier PDF.",
      });
    });
  } catch (error) {
    console.error("❌ Erreur validation facture:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la validation de la facture.",
    });
  }
};

exports.listInvoices = async (req, res) => {
  try {
    const { status, search } = req.query;

    console.log("📥 Requête liste factures avec :", { status, search });

    let where = {};
    if (status && status !== "TOUT") {
      where.statut = status;
    }

    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { numero: { [Op.like]: `%${search}%` } },
          { "$OrganisationDestinataire.nom$": { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // 🔄 Met à jour les factures en retard (plus de 5 jours)
    await Invoice.update(
      { statut: "RETARD" },
      {
        where: {
          statut: "EN ATTENTE DU PAIEMENT",
          date_facture: {
            [Op.lte]: dayjs().subtract(DaysLater, "day").toDate(),
          },
        },
      }
    );

    const invoices = await Invoice.findAll({
      where,
      include: [
        {
          model: Organisation,
          as: "OrganisationDestinataire",
          attributes: ["nom"],
        },
      ],
      order: [["date_facture", "DESC"]],
    });

    const data = invoices.map((inv) => ({
      id: inv.id,
      numero: inv.numero,
      dateFacture: inv.date_facture,
      envoyeeA: inv.OrganisationDestinataire?.nom || "",
      par: inv.par,
      montant: inv.montant,
      statut: inv.statut,
      pdf_path: inv.pdf_path,
      email_envoye: inv.email_envoye,
      emailDestinataire: inv.OrganisationDestinataire?.email || "",
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Erreur récupération factures :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.validateInvoiceFromPreview = async (req, res) => {
  const {
    numero,
    date_facture,
    envoyee_a,
    par,
    montant,
    notes,
    id_organisation_origine,
    id_organisation_destinataire,
    itemsSelected = [],
  } = req.body;

  // const filePath = path.join(__dirname, "..", "uploads", "invoices", `${numero}.pdf`);

  try {
    // if (!fs.existsSync(filePath)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "PDF manquant. Merci de prévisualiser avant de valider.",
    //   });
    // }

    // ➕ Enregistrement en base
    const invoice = await Invoice.create({
      numero,
      date_facture,
      envoyee_a,
      par,
      montant,
      notes: notes || "",
      statut: "EN ATTENTE DU PAIEMENT",
      id_organisation_origine,
      id_organisation_destinataire,
      pdf_path: `uploads/invoices/${numero}.pdf`,
    });

    if (itemsSelected.length > 0) {
      await InvoiceItem.update(
        { invoice_id: invoice.id, statut: "FACTURÉ" },
        { where: { id: itemsSelected } }
      );
    }

    res
      .status(201)
      .json({ success: true, message: "Facture validée", data: invoice });
  } catch (error) {
    console.error("Erreur validateInvoiceFromPreview :", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de la facture.",
    });
  }
};

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/invoices"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // ex: FAC-2025-0013.pdf
  },
});

const upload = multer({ storage });

exports.uploadInvoicePDFMiddleware = upload.single("file");

exports.uploadInvoicePDF = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const file = req.file;

    console.log("📥 Reçu dans uploadInvoicePDF:");
    console.log("🧾 invoiceId:", invoiceId);
    console.log("📄 Nom du fichier:", file?.originalname);

    if (!file) {
      console.warn("⚠️ Aucun fichier reçu !");
      return res
        .status(400)
        .json({ success: false, message: "Fichier manquant" });
    }

    let invoice = null;

    // Vérifie si c'est un ID numérique ou un numéro de facture
    if (!isNaN(invoiceId)) {
      console.log("🔍 Recherche via ID (findByPk)");
      invoice = await Invoice.findByPk(invoiceId);
    } else {
      console.log("🔍 Recherche via numéro de facture (findOne)");
      invoice = await Invoice.findOne({ where: { numero: invoiceId } });
    }

    if (!invoice) {
      console.warn("❌ Facture introuvable !");
      return res
        .status(403)
        .json({ success: false, message: "Facture introuvable" });
    }

    invoice.pdf_path = `uploads/invoices/${file.filename}`;
    const emails = (req.body.emails || "")
      .split(";")
      .map((e) => e.trim())
      .filter((e) => e);

    if (emails.length > 0) {
      try {
        const template = await AutoEmailTemplate.findOne({
          where: { type: "facture_light" },
        });

        if (template) {
          const organisation = await Organisation.findByPk(
            invoice.id_organisation_origine
          );
          const shortcodes = {
            nro_facture: invoice.numero,
            nom_organisation_prestataire: organisation?.nom || "ecoMed24",
            periode_facture: invoice.date_facture || "",
          };

          const replaceShortcodes = (text, variables) => {
            for (const [key, value] of Object.entries(variables)) {
              text = text.replace(new RegExp(`{${key}}`, "g"), value);
            }
            return text;
          };

          const subject = replaceShortcodes(template.name, shortcodes);
          const messageFinal = replaceShortcodes(template.message, shortcodes);

          for (const email of emails) {
            await Email.create({
              is_sent: null,
              subject,
              date: moment().format("YYYY-MM-DD HH:mm:ss"),
              message: messageFinal.trim(),
              reciepient: email,
              attachment_path: `uploads/invoices/${file.filename}`,
              user: req.userId || null,
            });
          }

          console.log("📧 Emails enregistrés depuis uploadInvoicePDF !");
        } else {
          console.warn("📭 Aucun template 'facture_light' trouvé !");
        }
      } catch (emailErr) {
        console.error(
          "❌ Erreur d'envoi d'email dans uploadInvoicePDF :",
          emailErr
        );
      }
    }

    await invoice.save();

    console.log("✅ Fichier enregistré :", invoice.pdf_path);
    res.json({
      success: true,
      message: "PDF enregistré avec succès",
      path: invoice.pdf_path,
    });
  } catch (err) {
    console.error("❌ Erreur uploadInvoicePDF :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// GET /invoice/:invoiceId/download
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Cherche par ID ou numéro
    let invoice;
    if (!isNaN(invoiceId)) {
      invoice = await Invoice.findByPk(invoiceId);
    } else {
      invoice = await Invoice.findOne({ where: { numero: invoiceId } });
    }

    if (!invoice || !invoice.pdf_path) {
      return res.status(404).json({ message: "PDF non trouvé." });
    }

    const filePath = path.join(__dirname, "..", invoice.pdf_path);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Fichier introuvable sur le serveur." });
    }

    return res.download(filePath, path.basename(filePath));
  } catch (err) {
    console.error("❌ Erreur téléchargement PDF :", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// GET /invoice/:invoiceId/payments
exports.getInvoicePayments = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const payments = await sequelize.query(
      `
      SELECT 
        ip.id AS id,
        ip.invoice_id,
        ip.date_paiement,
        ip.montant,
        ip.mode_paiement,
        ip.reference,
        u.first_name,
        u.last_name
      FROM invoice_payments ip
      LEFT JOIN users u ON ip.created_by = u.id
      WHERE ip.invoice_id = :invoiceId
      ORDER BY ip.date_paiement DESC
      `,
      {
        replacements: { invoiceId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error("Erreur getInvoicePayments:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { montant, mode_paiement, reference, commentaire, created_by } =
      req.body;

    // 1. Vérifications de base
    if (!montant || montant <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Montant invalide." });
    }

    if (!mode_paiement) {
      return res
        .status(400)
        .json({ success: false, message: "Mode de paiement requis." });
    }

    // 2. Vérifie si la facture existe
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Facture introuvable." });
    }
    // 3. Insère le paiement
    const paiement = await InvoicePayment.create({
      invoice_id: invoice.id,
      montant,
      mode_paiement,
      reference: reference || null,
      commentaire: commentaire || null,
      date_paiement: new Date(),
      created_by: created_by || null,
    });

    console.log("✅ Paiement enregistré :", paiement?.id);

    // 4. Recalcul du total payé
    const allPayments = await InvoicePayment.findAll({
      where: { invoice_id: invoice.id },
    });

    const totalPayé = allPayments.reduce(
      (sum, p) => sum + parseFloat(p.montant),
      0
    );

    // 5. Mise à jour du statut si solde atteint
    if (totalPayé >= invoice.montant && invoice.statut !== "PAYÉ") {
      invoice.statut = "PAYÉ";
      await invoice.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Paiement enregistré." });
  } catch (error) {
    console.error("❌ Erreur processPayment :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

exports.sendReminderEmail = async (req, res) => {
  try {
    const { invoiceId, userId } = req.params;

    // 1. Récupérer la facture
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Facture introuvable." });
    }

    // 2. Récupérer l'organisation via envoyeeA
    console.log(
      "🔍 Récupération de l'organisation pour envoyeeA :",
      invoice.envoyee_a
    );
    const organisation = await Organisation.findByPk(invoice.envoyee_a);
    if (!organisation) {
      return res.status(404).json({ message: "Organisation introuvable." });
    }

    // 3. Charger le template actif
    const template = await AutoEmailTemplate.findOne({
      where: { type: "invoice_reminder", status: "ACTIVE" },
    });

    if (!template) {
      return res.status(404).json({ message: "Template d'email non trouvé." });
    }

    // 4. Préparer le message
    const messageFinal = template.message
      .replace(/{{invoice.numero}}/g, invoice.numero || "")
      .replace(
        /{{invoice.dateFacture}}/g,
        dayjs(invoice.dateFacture).format("DD/MM/YYYY")
      )
      .replace(
        /{{invoice.montant}}/g,
        parseFloat(invoice.montant).toLocaleString()
      )
      .replace(/{{organisation.nom}}/g, organisation.nom || "");

    const subject = template.name;
    const email = organisation.email;
    const filePath = null; // à remplir si tu ajoutes un PDF

    // 5. Simulation d'envoi
    console.log("Envoi de l'email à :", email);
    console.log("Sujet :", subject);
    console.log("Contenu :", messageFinal);

    // 6. Historiser dans Email
    await Email.create({
      is_sent: null,
      subject,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
      message: messageFinal.trim(),
      reciepient: email,
      attachment_path: filePath,
      user: userId || null,
    });

    // 7. Réponse au client
    res.json({
      success: true,
      message: "Rappel envoyé avec succès.",
      email: {
        to: email,
        subject,
        body: messageFinal,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du rappel:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
