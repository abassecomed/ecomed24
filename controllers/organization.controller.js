const Sequelize = require("sequelize");
const Database = require("../config").sequelize;
const Op = Sequelize.Op;
const moment = require("moment");
moment.locale("en");
const path = require("path");
const nodemailer = require("nodemailer");
const { parseAndValidateExcelPrice } = require("../taks/excel.taks.js");

var User = require("../models/User");
var Patient = require("../models/Patient");

var Organisation = require("../models/Organisation");
var OrganisationType = require("../models/OrganizationType");
var PricingCategory = require("../models/PricingCategory");
var PatientDepositInvoice = require("../models/PatientDepositInvoice");
var Payment = require("../models/Payment");
var ServiceCategory = require("../models/ServiceCategory");
var Settings = require("../models/Settings");
var PaymentCategory = require("../models/PaymentCategory");
const multer = require("multer");
const fs = require("fs");
const formidable = require("formidable");
var PartenariatSanteAssurance = require("../models/PartenariatSanteAssurance.js");
var SettingServiceSpecialite = require("../models/SettingServiceSpecialite");
var PaymentCategoryOrganisation = require("../models/PaymentCategoryOrganisation");
var PriceGrids = require("../models/PriceGrids");
var PriceGridDetails = require("../models/PriceGridDetails");
var TiersPayant = require("../models/TiersPayant");

// Attachments

Organisation.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
Organisation.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
Organisation.belongsTo(OrganisationType, {
  as: "type_details",
  foreignKey: "type",
});
// Organisation.belongsTo(DocumentTypes, {as: 'doctypes_details',foreignKey: 'category'});

// Price Grids

// SettingServiceSpecialite.hasMany(PaymentCategory, { foreignKey: "idspe" });

PaymentCategoryOrganisation.belongsTo(PaymentCategory, {
  foreignKey: "id_presta",
});
PaymentCategory.belongsTo(SettingServiceSpecialite, { foreignKey: "id_spe" });

Organisation.belongsTo(PriceGrids, {
  foreignKey: "pricing_category",
});

PriceGrids.belongsTo(Organisation, {
  foreignKey: "organizationID",
  as: "organisation",
});

// Patient Deposit invoice
PatientDepositInvoice.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
PatientDepositInvoice.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
PatientDepositInvoice.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "id_organisation",
});

PriceGridDetails.belongsTo(PriceGrids, {
  as: "grid",
  foreignKey: "gridID",
});

//
//////Modal Relationship

exports.getOrganizationList = async (req, res) => {
  try {
    let offsetdata = parseInt(
      req.query.offset
        ? req.query.offset == undefined || req.query.offset == 1
          ? 0
          : req.query.offset
        : 0
    );
    if (isNaN(offsetdata)) {
      offsetdata = 0;
    }
    let datalimit = parseInt(
      req.query.limit ? (req.query.limit == undefined ? 5 : req.query.limit) : 5
    );
    if (isNaN(datalimit)) {
      datalimit = 5;
    }
    const { count, rows } = await Organisation.findAndCountAll();
    OrganisationModal = await Organisation.findAll({
      attributes: [
        "id",
        "code",
        "nom",
        "nom_commercial",
        "email",
        "portable_responsable_legal",
        "type",
        "adresse",
        "path_logo",
        "est_active",
        "is_light",
        "other_emails",
        "pricing_category",
        "is_whatsapp",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Organisation.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Organisation.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      order: [["id", "DESC"]],
      limit: datalimit,
      offset: offsetdata,
      include: [
        {
          model: User,
          attributes: [
            "id",
            ["id_organisation", "org_id"],
            "first_name",
            "last_name",
            "username",
            "email",
          ],
          as: "addedby_details",
        },
        {
          model: User,
          attributes: [
            "id",
            ["id_organisation", "org_id"],
            "first_name",
            "last_name",
            "username",
            "email",
          ],
          as: "updatedby_details",
        },
        {
          model: OrganisationType,
          attributes: ["id", "name"],
          as: "type_details",
        },
      ],
    });
    if (OrganisationModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Organization List",
        data: OrganisationModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getOrganizationLightList = async (req, res) => {
  try {
    let offsetdata = parseInt(req.query.offset) || 0;
    let datalimit = parseInt(req.query.limit) || 5;

    if (isNaN(offsetdata)) offsetdata = 0;
    if (isNaN(datalimit)) datalimit = 5;

    // Récupération de l'organisation à exclure via le paramètre
    const excludedOrgId = req.query.orgId ? parseInt(req.query.orgId) : null;

    const { count, rows } = await Organisation.findAndCountAll();
    console.log("🔎 ID reçu pour la requête :", req.params.org_id);

    OrganisationModal = await Organisation.findAll({
      attributes: [
        "id",
        "code",
        "nom",
        "nom_commercial",
        "email",
        "portable_responsable_legal",
        "type",
        "adresse",
        "path_logo",
        "est_active",
        "is_light",
        "other_emails",
        "pricing_category",
        "is_whatsapp",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Organisation.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Organisation.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      order: [["id", "DESC"]],
      limit: datalimit,
      offset: offsetdata,
      where: {
        is_light: 1,
        pricing_category: { [Op.ne]: null }, // pricing_category not NULL
        id: excludedOrgId ? { [Op.ne]: excludedOrgId } : { [Op.ne]: null }, // Exclure organisation passée en paramètre
      },
      include: [
        {
          model: User,
          attributes: [
            "id",
            ["id_organisation", "org_id"],
            "first_name",
            "last_name",
            "username",
            "email",
          ],
          as: "addedby_details",
        },
        {
          model: User,
          attributes: [
            "id",
            ["id_organisation", "org_id"],
            "first_name",
            "last_name",
            "username",
            "email",
          ],
          as: "updatedby_details",
        },
        {
          model: OrganisationType,
          attributes: ["id", "name"],
          as: "type_details",
        },
        {
          model: PriceGrids,
          required: false,
          attributes: [],
          where: {
            gridID: Sequelize.col("Organisation.pricing_category"),
            organizationID: req.params.org_id,
          },
        },
      ],
    });

    if (!OrganisationModal || OrganisationModal.length === 0) {
      return res.json({ status: 0, message: "No Data Found" });
    }

    res.json({
      status: 1,
      message: "Organization List",
      data: OrganisationModal,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

exports.getOrganizationByID = async (req, res) => {
  try {
    OrganisationModal = await Organisation.findAll({
      attributes: [
        "id",
        "code",
        "nom",
        "path_logo",
        "nom_commercial",
        "email",
        "portable_responsable_legal",
        "adresse",
        "region",
        "departement",
        "type",
        "est_active",
        "is_light",
        "other_emails",
        "pricing_category",
        "is_whatsapp",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: { id: req.params.org_id },
    });
    if (OrganisationModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Organization List",
        data: OrganisationModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.addOrganization = async (req, res) => {
  try {
    console.log("📥 Requête reçue :", req.body);
    console.log("🆔 Utilisateur ID :", req.userId);

    if (!req.userId) {
      console.error("🚨 Erreur : Utilisateur non authentifié.");
      return res.status(401).json({
        status: 0,
        message: "Non autorisé. Veuillez vous reconnecter.",
      });
    }

    // Vérification des champs requis
    if (
      !req.body.name ||
      !req.body.type ||
      !req.body.phone ||
      !req.body.email ||
      !req.body.pricing_category
    ) {
      console.error("⚠️ Champs requis manquants :", req.body);
      return res.status(400).json({
        status: 0,
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Création de l'organisation
    const OrganisationModal = await Organisation.create({
      nom: req.body.name,
      type: req.body.type,
      portable_responsable_legal: req.body.phone,
      is_light: req.body.is_light || 1, // Valeur par défaut
      email: req.body.email,
      pricing_category: req.body.pricing_category,
      adresse: req.body.address,
      country: req.body.country || null,
      region: req.body.region || null,
      district: req.body.district || null,
      entete: req.body.entete || "--------------------",
      added_by: req.userId,
      status: 1,
    });

    if (!OrganisationModal) {
      console.error("❌ Erreur : Organisation non créée.");
      return res.status(500).json({
        status: 0,
        message: "Erreur serveur : Impossible d'ajouter l'organisation.",
      });
    }

    console.log("✅ Organisation créée avec succès :", OrganisationModal);
    res.json({
      status: 1,
      message: "Nouvelle organisation ajoutée avec succès.",
      data: OrganisationModal,
    });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    res.status(500).json({
      status: 0,
      message: "Erreur serveur : Veuillez réessayer plus tard.",
    });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    OrganisationModal = await Organisation.update(
      {
        nom: req.body.name,
        type: req.body.type,
        portable_responsable_legal: req.body.phone,
        is_whatsapp: req.body.is_whatsapp,
        is_light: req.body.is_light,
        email: req.body.email,
        other_emails: req.body.other_emails,
        adresse: req.body.address,
        pays: req.body.country,
        region: req.body.region,
        departement: req.body.district,
        updated_by: req.userId,
      },
      {
        where: { id: req.params.org_id },
      }
    );
    if (OrganisationModal === null) {
      res.json({
        status: 0,
        message: "Something Went Wrong, Please Try Againg Later!!",
      });
    } else {
      res.json({
        status: 1,
        message: "Organization has been updated.",
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.statusOrganization = async (req, res) => {
  try {
    OrganisationModal = await Organisation.update(
      { status: req.body.status },
      { where: { id: req.params.id } }
    );
    if (OrganisationModal === null) {
      res.json({
        status: 0,
        message: "Something Went Wrong, Please Try Againg Later!!",
      });
    } else {
      res.json({
        status: 1,
        message: "Organization status has been Updated.",
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.updatePricing = async (req, res) => {
  try {
    OrganisationModal = await Organisation.update(
      { pricing_category: req.body.pricing_category },
      { where: { id: req.params.id } }
    );
    if (OrganisationModal === null) {
      res.json({
        status: 0,
        message: "Something Went Wrong, Please Try Againg Later!!",
      });
    } else {
      res.json({
        status: 1,
        message: "Organization status has been Updated.",
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getPricingCategory = async (req, res) => {
  try {
    PricingCategoryModal = await PricingCategory.findAll({
      attributes: [
        "id",
        "name",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("createdAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("updatedAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "updatedAt",
        ],
      ],
      order: [["id", "DESC"]],
    });
    if (PricingCategoryModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Pricing Category List",
        data: PricingCategoryModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getOrganizationType = async (req, res) => {
  try {
    OrganisationTypeModal = await OrganisationType.findAll({
      attributes: [
        "id",
        "name",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("createdAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("updatedAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "updatedAt",
        ],
      ],
      order: [["id", "DESC"]],
    });
    if (OrganisationTypeModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Organization Types List",
        data: OrganisationTypeModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getInvoicePaymentsByORG = async (req, res) => {
  try {
    let offsetdata = parseInt(
      req.query.offset
        ? req.query.offset == undefined || req.query.offset == 1
          ? 0
          : req.query.offset
        : 0
    );
    if (isNaN(offsetdata)) {
      offsetdata = 0;
    }
    let datalimit = parseInt(
      req.query.limit ? (req.query.limit == undefined ? 5 : req.query.limit) : 5
    );
    if (isNaN(datalimit)) {
      datalimit = 5;
    }
    id_organisation = req.params.org_id;
    OrganisationModal = await Database.query(
      `SELECT 
      payment_pro.idpro,
      (select organisation.nom from organisation where organisation.id = payment_pro.id_organisation limit 1) as nom,
      (select organisation.nom from organisation where organisation.id = payment_pro.id_organisation_destinataire limit 1) as destinataire,
      payment_pro.statut,
      payment_pro.codepro,
      payment_pro.codefacture,
      DATE_FORMAT(FROM_UNIXTIME(payment_pro.date), '%d/%m/%Y %H:%i') AS date,
      DATE_FORMAT(FROM_UNIXTIME(payment_pro.dateDebut), '%d/%m/%Y %H:%i') AS dateDebut,
      DATE_FORMAT(FROM_UNIXTIME(payment_pro.dateFin), '%d/%m/%Y %H:%i') AS dateFin,
      payment_pro.amount,
      payment_pro.users_valided,
      DATE_FORMAT(FROM_UNIXTIME(payment_pro.date_paiement), '%d/%m/%Y %H:%i') AS date_paiement,
      payment_pro.canal_paiement,
      payment_pro.transfer,
      payment_pro.reference
      from payment_pro
      where payment_pro.id_organisation_destinataire = ${id_organisation} ORDER BY payment_pro.idpro DESC LIMIT ${offsetdata}, ${datalimit}`,
      { type: Database.QueryTypes.SELECT }
    );
    if (OrganisationModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Organization Invoice List",
        data: OrganisationModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getPaymentReceipt = async (req, res) => {
  try {
    let payment_id = req.params.payment_id;
    PaymentReceipt = await Database.query(
      "select payment_pro.codefacture,CONCAT(codefacture, '.pdf') AS file,'/uploads/invoicefile/' AS url from payment_pro where idpro=" +
        payment_id,
      { type: Database.QueryTypes.SELECT }
    );
    if (PaymentReceipt === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({ status: 1, message: "Payment Receipt", data: PaymentReceipt });
    }
  } catch (error) {
    throw error;
  }
};

exports.getPaymentDetails = async (req, res) => {
  let data = {};
  let payment_id = req.params.payment_id;
  data.settings = await Settings.findOne();
  PaymentDetails = await Database.query(
    `select payment_pro.idpro as id,
                                        (select organisation.nom from organisation where organisation.id = payment_pro.id_organisation_destinataire limit 1) as destinataire,
                                        payment_pro.codefacture,
                                        payment_pro.dateDebut,
                                        payment_pro.dateFin,
                                        payment_pro.amount,
                                        (SELECT SUM(deposited_amount) AS total_deposited_amount FROM patient_deposit_invoice where payment_id=payment_pro.idpro) as total_deposited_amount,
                                        (payment_pro.amount - (SELECT SUM(deposited_amount) AS total_deposited_amount 
                                        FROM patient_deposit_invoice where payment_id=payment_pro.idpro)) as total_due,
                                        payment_pro.id_organisation_destinataire 
                                        from payment_pro where idpro=${payment_id}`,
    { type: Database.QueryTypes.SELECT }
  );

  //console.log(data.services);

  res.json({ status: 1, message: "Payment Details", data: PaymentDetails });
};

exports.getDepositList = async (req, res) => {
  try {
    let offsetdata = parseInt(
      req.query.offset
        ? req.query.offset == undefined || req.query.offset == 1
          ? 0
          : req.query.offset
        : 0
    );
    if (isNaN(offsetdata)) {
      offsetdata = 0;
    }
    let datalimit = parseInt(
      req.query.limit ? (req.query.limit == undefined ? 5 : req.query.limit) : 5
    );
    if (isNaN(datalimit)) {
      datalimit = 5;
    }
    let payment_id = req.params.payment_id;
    Deposits = await Database.query(
      `select 
      payment_pro.codefacture, 
      patient_deposit_invoice.id,  
      patient_deposit_invoice.id_organisation, 
      patient_deposit_invoice.payment_id, 
      DATE_FORMAT(FROM_UNIXTIME(patient_deposit_invoice.date), '%d/%m/%Y %H:%i') AS date,
      DATE_FORMAT(FROM_UNIXTIME(payment_pro.dateDebut), '%d/%m/%Y %H:%i') AS start_date,
      DATE_FORMAT(FROM_UNIXTIME(payment_pro.dateFin), '%d/%m/%Y %H:%i') AS end_date,
      patient_deposit_invoice.deposited_amount, 
      patient_deposit_invoice.amount_received_id, 
      patient_deposit_invoice.deposit_type, 
      patient_deposit_invoice.gateway, 
      patient_deposit_invoice.id_transaction_externe, 
      patient_deposit_invoice.user, 
      patient_deposit_invoice.status, 
      patient_deposit_invoice.added_by, 
      patient_deposit_invoice.updated_by, 
      patient_deposit_invoice.createdAt, 
      patient_deposit_invoice.updatedAt 
      from patient_deposit_invoice, payment_pro where payment_pro.idpro = patient_deposit_invoice.payment_id and patient_deposit_invoice.payment_id=${payment_id} ORDER BY patient_deposit_invoice.id DESC LIMIT  ${offsetdata}, ${datalimit}`,
      { type: Database.QueryTypes.SELECT }
    );
    if (Deposits === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Organization Deposit List",
        data: Deposits,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.addDeposit = async (req, res) => {
  try {
    let getData = [],
      getRelationData = [],
      results;
    console.log(req.body);
    PatientDepositInvoiceModal = await PatientDepositInvoice.create({
      date: moment().unix(),
      deposited_amount: req.body.deposited_amount,
      payment_id: req.body.payment_id,
      amount_received_id: req.body.amount_received_id,
      deposit_type: req.body.deposit_type,
      partner_id: req.body.partner_id,
      reference: req.body.reference,
      id_organisation: req.org_id,
      user: req.userId,
      added_by: req.userId,
    });
    if (PatientDepositInvoiceModal === null) {
      return res.json({ status: 0, message: langCommon.errormessage });
    } else {
      return res.json({
        status: 1,
        message: "New Deposit has been saved",
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getOrganisationPrestation = async (req, res) => {
  try {
    if (req.params.type_id == "1") {
      const PaymentCategoryOrganisationModal =
        await PaymentCategoryOrganisation.findAll({
          attributes: [
            "idpco",
            [
              Sequelize.fn(
                "ROUND",
                Sequelize.col(
                  "PaymentCategoryOrganisation.tarif_professionnel"
                ),
                0
              ),
              "tarif_arrondi",
            ], // Arrondi à l'entier le plus proche
          ],
          include: [
            {
              model: PaymentCategory,
              attributes: ["prestation"],
              include: [
                {
                  model: SettingServiceSpecialite,
                  attributes: ["name_specialite"],
                },
              ],
            },
          ],
          where: { id_organisation: req.params.org_id },
        });
      if (PaymentCategoryOrganisationModal === null) {
        res.json({ status: 0, message: "Not Data Found" });
      } else {
        res.json({
          status: 1,
          message: "Payment Category Organisation List",
          data: PaymentCategoryOrganisationModal,
        });
      }
    } else if (req.params.type_id == "2") {
      PaymentCategoryOrganisationModal =
        await PaymentCategoryOrganisation.findAll({
          attributes: [
            "idpco",
            [
              Sequelize.fn(
                "ROUND",
                Sequelize.col("PaymentCategoryOrganisation.prix_public"),
                0
              ),
              "tarif_arrondi",
            ],
          ], // Sélection des attributs nécessaires du modèle principal
          include: [
            {
              model: PaymentCategory,
              attributes: ["prestation"], // Sélection des attributs nécessaires du modèle associé
              include: [
                {
                  model: SettingServiceSpecialite,
                  attributes: ["name_specialite"], // Sélection des attributs du modèle inclus de manière imbriquée
                },
              ],
            },
          ],
          where: { id_organisation: req.params.org_id },
        });
      if (PaymentCategoryOrganisationModal === null) {
        res.json({ status: 0, message: "Not Data Found" });
      } else {
        res.json({
          status: 1,
          message: "Payment Category Organisation List",
          data: PaymentCategoryOrganisationModal,
        });
      }
    } else {
      res.json({ status: 0, message: "Not Data Found" });
    }
  } catch (error) {
    throw error;
  }
};

exports.addPriceGrids = async (req, res) => {
  try {
    console.log(req.body);
    const priceGridsModel = await PriceGrids.create({
      organizationID: req.body.organizationID,
      gridName: req.body.gridName,
      description: req.body.description,
      effectiveDate: req.body.effectiveDate,
      expiryDate: req.body.expiryDate,
      lastModifiedDate: req.body.lastModifiedDate,
      lastModifiedBy: req.body.lastModifiedBy,
    });

    // Si aucun modèle n'est renvoyé, cela indique généralement une erreur non gérée.
    if (priceGridsModel === null) {
      res.json({
        status: 0,
        message: "Something went wrong, please try again later.",
      });
    } else {
      res.json({
        status: 1,
        message: "New PriceGrid has been added.",
        data: priceGridsModel,
      });
    }
  } catch (error) {
    // Intercepter spécifiquement les erreurs de violation de contrainte d'unicité
    if (error.name === "SequelizeUniqueConstraintError") {
      res.json({
        status: 0,
        message: "This grid name already exists. Please use a different name.",
      });
    } else {
      res.json({
        status: 0,
        message: "Server error, please try again later.",
        error: error.message, // Fournir plus de détails sur l'erreur
      });
    }
  }
};

exports.importPriceGridDetails = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.multiples = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ wsMessage: "Error parsing the form data." });
      return;
    }

    // Normalisation des champs pour éviter des erreurs de type avec Sequelize
    const organizationID = Array.isArray(fields.organizationID)
      ? fields.organizationID[0]
      : fields.organizationID;
    const gridName = Array.isArray(fields.gridName)
      ? fields.gridName[0]
      : fields.gridName;
    const description = Array.isArray(fields.description)
      ? fields.description[0]
      : fields.description;
    const effectiveDate = Array.isArray(fields.effectiveDate)
      ? fields.effectiveDate[0]
      : moment().format("YYYY-MM-DD HH:mm:ss");
    const expiryDate = Array.isArray(fields.expiryDate)
      ? fields.expiryDate[0]
      : moment().format("YYYY-MM-DD HH:mm:ss");
    const lastModifiedDate = Array.isArray(fields.lastModifiedDate)
      ? fields.lastModifiedDate[0]
      : moment().format("YYYY-MM-DD HH:mm:ss");
    const adjustmentType = Array.isArray(fields.adjustmentType)
      ? fields.adjustmentType[0]
      : "increaseAbsolute";
    const adjustmentValue = Array.isArray(fields.adjustmentValue)
      ? fields.adjustmentValue[0]
      : "0";
    const lastModifiedBy = Array.isArray(fields.lastModifiedBy)
      ? fields.lastModifiedBy[0]
      : fields.lastModifiedBy;

    // Création du modèle
    let priceGridsModel;
    try {
      priceGridsModel = await PriceGrids.create({
        organizationID,
        gridName,
        description,
        effectiveDate,
        expiryDate,
        lastModifiedDate,
        adjustmentType,
        adjustmentValue,
        lastModifiedBy,
      });
    } catch (error) {
      console.error("Error creating PriceGrids model:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        res.json({
          status: 0,
          message:
            "Ce nom de grille existe déjà. Veuillez utiliser un nom différent.",
        });
      } else {
        res.json({
          status: 500,
          message:
            "Erreur de base de données, impossible de créer la grille tarifaire.",
        });
      }
    }

    // Traitement des fichiers, si le modèle est correctement créé
    if (
      !files.priceGrid ||
      !files.priceGrid.length ||
      !files.priceGrid[0].filepath
    ) {
      res.json({
        status: 400,
        message: "No file uploaded or file path missing.",
      });
    }

    const filepath = files.priceGrid[0].filepath;
    console.log("File path:", filepath);

    const result = await parseAndValidateExcelPrice(filepath);
    if (typeof result === "string") {
      res.json({
        status: 400,
        message: result,
      });
    } else {
      // Vérification des ID avant insertion
      const validGridDetails = [];
      for (const elt of result) {
        const paymentCategoryOrg = await PaymentCategoryOrganisation.findOne({
          where: { idpco: elt.ID },
          include: [
            {
              model: PaymentCategory,
              attributes: [
                "id",
                "code_prestation",
                "prestation",
                "cotation",
                "coefficient",
                "description",
                "keywords",
                "tarif_public",
                "tarif_professionnel",
                "tarif_assurance",
                "tarif_ipm",
                "id_service",
                "id_spe",
                "nomenclature_prestation",
              ],
              required: true,
            },
          ],
        });

        if (paymentCategoryOrg && paymentCategoryOrg.PaymentCategory) {
          validGridDetails.push({
            gridID: priceGridsModel.gridID,
            productID: elt.ID,
            adjustedPrice: elt.Prix,
            effectiveDate: priceGridsModel.effectiveDate,
            expiryDate: priceGridsModel.expiryDate,
          });
        }
      }

      if (validGridDetails.length > 0) {
        try {
          console.log("Details prix :", validGridDetails);

          const insertedGridDetails = await PriceGridDetails.bulkCreate(
            validGridDetails
          );
          res.json({
            status: 1,
            message: "New PriceGrid Details List.",
            data: insertedGridDetails,
          });
        } catch (error) {
          console.error("Error inserting grid details:", error);
          res.status(500).json({
            status: 0,
            message: "Failed to insert price grid details.",
            error: error.toString(),
          });
        }
      } else {
        res.json({
          status: 0,
          message: "No valid details found for the price grid.",
          data: [],
        });
      }
    }
  });
};

exports.getPriceGridsAll = async (req, res) => {
  try {
    PriceGridsAll = await PriceGrids.findAll({
      attributes: [
        "gridID",
        "gridName",
        "organizationID",
        "description",
        "effectiveDate",
        "expiryDate",
        "lastModifiedDate",
        "lastModifiedBy",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("effectiveDate"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "effectiveDate",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("lastModifiedDate"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "lastModifiedDate",
        ],
      ],
      where: { organizationID: req.params.org_id },
      order: [["gridID", "DESC"]],
    });
    if (PriceGridsAll === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Price Grid List",
        data: PriceGridsAll,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getPriceGridByID = async (req, res) => {
  try {
    const PriceGrid = await PriceGrids.findOne({
      // Utilisation de findOne pour récupérer un seul enregistrement
      where: {
        gridID: req.params.gridID, // Condition où gridID est égal à req.params.gridID
      },
      attributes: [
        "gridID",
        "gridName",
        "organizationID",
        "description",
        "effectiveDate",
        "expiryDate",
        "lastModifiedDate",
        "lastModifiedBy",
        "adjustmentType",
        "adjustmentValue",
        "isShared",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("effectiveDate"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "effectiveDate",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("lastModifiedDate"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "lastModifiedDate",
        ],
      ],
      order: [["gridID", "DESC"]],
    });

    if (PriceGrid === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Price Grid Details",
        data: PriceGrid,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error retrieving data",
      error: error.message,
    });
  }
};

exports.getPriceGridDetailsAll = async (req, res) => {
  try {
    PriceGridDetailsAll = await PriceGridDetails.findAll({
      attributes: [
        "detailID",
        "gridID",
        "productID",
        "adjustedPrice",
        "adjustmentType",
        "adjustmentValue",
        "effectiveDate",
        "expiryDate",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("effectiveDate"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "effectiveDate",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("expiryDate"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "expiryDate",
        ],
      ],
      order: [["detailID", "DESC"]],
    });
    if (PriceGridDetailsAll === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Price Grid Details List",
        data: PriceGridDetailsAll,
      });
    }
  } catch (error) {
    throw error;
  }
};

const getOrCreatePriceGrid = async (gridName, tarifColumn, orgId, byID) => {
  const priceGrid = await PriceGrids.findOne({
    where: { gridName },
    attributes: [
      "gridID",
      "organizationID",
      "description",
      "effectiveDate",
      "expiryDate",
      "lastModifiedDate",
      "lastModifiedBy",
      [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("effectiveDate"),
          "%d-%m-%Y %H:%i:%s"
        ),
        "effectiveDate",
      ],
      [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("lastModifiedDate"),
          "%d-%m-%Y %H:%i:%s"
        ),
        "lastModifiedDate",
      ],
    ],
    order: [["gridID", "DESC"]],
  });

  if (priceGrid === null) {
    const paymentCategoryOrganisation =
      await PaymentCategoryOrganisation.findAll({
        attributes: [
          "idpco",
          "id_presta",
          tarifColumn,
          [
            Sequelize.fn(
              "ROUND",
              Sequelize.col(`PaymentCategoryOrganisation.${tarifColumn}`),
              0
            ),
            "tarif_arrondi",
          ],
        ],
        include: [
          {
            model: PaymentCategory,
            attributes: ["id", "prestation"],
            include: [
              {
                model: SettingServiceSpecialite,
                attributes: ["name_specialite"],
              },
            ],
          },
        ],
        where: { id_organisation: orgId },
      });

    const validPaymentCategoryOrganisation = paymentCategoryOrganisation.filter(
      (elt) => elt.PaymentCategory
    );

    if (validPaymentCategoryOrganisation.length === 0) {
      return {
        status: 0,
        message: `No valid details found for ${gridName}`,
        data: [],
      };
    }

    let priceGridsModel;
    try {
      priceGridsModel = await PriceGrids.create({
        organizationID: orgId,
        gridName,
        description: `Tarif ${gridName} généré automatiquement`,
        effectiveDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        lastModifiedDate: moment().format("YYYY-MM-DD HH:mm:ss"),
        lastModifiedBy: byID,
        adjustmentType: "increaseAbsolute",
      });
    } catch (error) {
      console.error("Error creating PriceGrids model:", error);
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error(
          "This grid name already exists. Please use a different name."
        );
      } else {
        throw new Error("Database error, unable to create price grid.");
      }
    }

    const gridDetails = validPaymentCategoryOrganisation.map((elt) => ({
      gridID: priceGridsModel.gridID,
      productID: elt.idpco,
      adjustedPrice: elt[tarifColumn],
      effectiveDate: moment().format("YYYY-MM-DD HH:mm:ss"),
    }));

    try {
      await PriceGridDetails.bulkCreate(gridDetails);
      return {
        status: 1,
        message: `New PriceGrid Details List for ${gridName}`,
        data: gridDetails,
      };
    } catch (error) {
      console.error("Error inserting grid details:", error);
      throw new Error("Failed to insert price grid details.");
    }
  } else {
    return {
      status: 1,
      message: `Price Grid ${gridName} Details`,
      data: priceGrid,
    };
  }
};

exports.getPriceIpmAssurancePriceGrid = async (req, res) => {
  try {
    const orgId = req.params.org_id;
    const byID = req.params.byID;

    const assuranceResult = await getOrCreatePriceGrid(
      "Assurance",
      "tarif_assurance",
      orgId,
      byID
    );
    const ipmResult = await getOrCreatePriceGrid(
      "IPM",
      "tarif_ipm",
      orgId,
      byID
    );

    res.json({
      status: 1,
      message: "Price Grids Retrieved",
      data: {
        assurance: assuranceResult,
        ipm: ipmResult,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error retrieving data",
      error: error.message,
    });
  }
};

exports.getPriceGridsDetails = async (req, res) => {
  try {
    const organizationID = req.params.org_id;

    // Récupérer les grilles de prix pour l'organisation
    const grids = await PriceGrids.findAll({
      where: { organizationID },
      order: [["gridID", "DESC"]],
      limit: 5,
    });

    if (grids.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "No price grids found for the organization",
      });
    }

    const gridIds = grids.map((grid) => grid.gridID);
    const gridNames = grids.map((grid) => grid.gridName);

    // Récupérer les détails des grilles de prix
    const priceDetails = await PriceGridDetails.findAll({
      where: { gridID: gridIds },
      include: [
        {
          model: PriceGrids,
          as: "grid",
          attributes: ["gridName"],
          required: false, // Faire une jointure LEFT JOIN
        },
      ],
    });

    // Récupérer les catégories de paiement et les spécialités associées
    const paymentCategoryDetails = await PaymentCategoryOrganisation.findAll({
      attributes: ["idpco", "id_presta"],
      include: [
        {
          model: PaymentCategory,
          required: true, // Assurer que seules les lignes où PaymentCategory existe sont incluses
          attributes: ["id", "prestation", "id_spe"],
          include: [
            {
              model: SettingServiceSpecialite,
              required: true, // Assurer que seules les lignes où SettingServiceSpecialite existe sont incluses
              attributes: ["idspe", "name_specialite"],
            },
          ],
        },
      ],
      where: { id_organisation: req.params.org_id },
    });

    // Mapper les catégories de paiement et les spécialités
    const paymentCategoryMap = {};
    paymentCategoryDetails.forEach((detail) => {
      if (detail.PaymentCategory) {
        const { id, prestation, id_spe } = detail.PaymentCategory;
        const { name_specialite } =
          detail.PaymentCategory.SettingServiceSpecialite;
        paymentCategoryMap[detail.idpco] = { prestation, name_specialite };
      }
    });

    // Construire le résultat final
    const result = {};

    priceDetails.forEach((detail) => {
      const paymentCategory = paymentCategoryMap[detail.productID];
      if (!result[detail.productID]) {
        result[detail.productID] = {
          productID: detail.productID,
          service: paymentCategory
            ? paymentCategory.name_specialite
            : "Unknown",
          prestation: paymentCategory ? paymentCategory.prestation : "Unknown",
        };
        gridNames.forEach((name) => {
          result[detail.productID][name] = "0"; // Initialiser avec '0'
        });
      }
      result[detail.productID][detail.grid.gridName] = detail.adjustedPrice;
    });

    // S'assurer que chaque produit a toutes les grilles avec au moins '0' si non présent
    Object.values(result).forEach((product) => {
      gridNames.forEach((name) => {
        if (!product[name]) {
          product[name] = "0";
        }
      });
    });

    const finalResult = Object.values(result);

    res.json({
      status: 1,
      message: "Price Grids Retrieved",
      data: finalResult,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error retrieving data",
      error: error.message,
    });
  }
};

exports.getPriceGridProductID = async (req, res) => {
  try {
    const { org_id: organizationID, product_id: productID } = req.params;

    // Récupérer les grilles de prix pour l'organisation et le produit
    const grids = await PriceGrids.findAll({
      where: { organizationID },
      order: [["effectiveDate", "DESC"]],
    });

    if (grids.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "No price grids found for the organization",
      });
    }

    const gridIds = grids.map((grid) => grid.gridID);
    const gridNames = grids.map((grid) => grid.gridName);

    // Récupérer les détails des grilles de prix pour le productID
    const priceDetails = await PriceGridDetails.findAll({
      where: {
        gridID: gridIds,
        productID,
      },
      include: [
        {
          model: PriceGrids,
          as: "grid",
          attributes: ["gridID", "gridName"],
          required: false, // Faire une jointure LEFT JOIN
        },
      ],
    });

    // Récupérer les catégories de paiement et les spécialités associées
    const paymentCategoryDetails = await PaymentCategoryOrganisation.findAll({
      attributes: ["idpco", "id_presta"],
      include: [
        {
          model: PaymentCategory,
          required: true, // Assurer que seules les lignes où PaymentCategory existe sont incluses
          attributes: ["id", "prestation", "id_spe"],
          include: [
            {
              model: SettingServiceSpecialite,
              required: true, // Assurer que seules les lignes où SettingServiceSpecialite existe sont incluses
              attributes: ["idspe", "name_specialite"],
            },
          ],
        },
      ],
      where: { id_organisation: organizationID },
    });

    // Mapper les catégories de paiement et les spécialités
    const paymentCategoryMap = {};
    paymentCategoryDetails.forEach((detail) => {
      if (detail.PaymentCategory) {
        const { id, prestation, id_spe } = detail.PaymentCategory;
        const { name_specialite } =
          detail.PaymentCategory.SettingServiceSpecialite;
        paymentCategoryMap[detail.idpco] = { prestation, name_specialite };
      }
    });

    // Construire le résultat final
    const result = {};

    priceDetails.forEach((detail) => {
      if (!result[detail.productID]) {
        const paymentCategory = paymentCategoryMap[detail.productID];
        result[detail.productID] = {
          productID: detail.productID,
          service: paymentCategory
            ? paymentCategory.name_specialite
            : "Unknown",
          prestation: paymentCategory ? paymentCategory.prestation : "Unknown",
          Grids: [],
        };
      }
      result[detail.productID].Grids.push({
        gridID: detail.grid.gridID,
        gridName: detail.grid.gridName,
        adjustedPrice: detail.adjustedPrice || "0",
      });
    });

    const finalResult = Object.values(result);

    res.json({
      status: 1,
      message: "Price Grids Retrieved",
      data: finalResult,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error retrieving data",
      error: error.message,
    });
  }
};

exports.updatePriceGridDetailsByProductID = async (req, res) => {
  try {
    const { productID } = req.params;
    const { updates } = req.body;

    const updatePromises = updates.map((update) =>
      PriceGridDetails.update(
        { adjustedPrice: update.adjustedPrice },
        { where: { gridID: update.gridID, productID } }
      )
    );

    await Promise.all(updatePromises);

    res.json({
      status: 1,
      message: "Price Grid Details updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error updating price grid details",
      error: error.message,
    });
  }
};

exports.getOrganisationPrestationsAll = async (req, res) => {
  try {
    const PaymentCategoryOrganisationModal =
      await PaymentCategoryOrganisation.findAll({
        attributes: [
          "idpco",
          [
            Sequelize.fn(
              "ROUND",
              Sequelize.col("PaymentCategoryOrganisation.tarif_professionnel"),
              0
            ),
            "prive",
          ],
          [
            Sequelize.fn(
              "ROUND",
              Sequelize.col("PaymentCategoryOrganisation.prix_public"),
              0
            ),
            "public",
          ],
          [
            Sequelize.fn(
              "ROUND",
              Sequelize.col("PaymentCategoryOrganisation.tarif_public"),
              0
            ),
            "paf",
          ],
          [
            Sequelize.fn(
              "ROUND",
              Sequelize.col("PaymentCategoryOrganisation.tarif_assurance"),
              0
            ),
            "assurance",
          ],
          [
            Sequelize.fn(
              "ROUND",
              Sequelize.col("PaymentCategoryOrganisation.tarif_ipm"),
              0
            ),
            "ipm",
          ], // Arrondi à l'entier le plus proche
        ],
        include: [
          {
            model: PaymentCategory,
            attributes: ["prestation"],
            required: true, // Cette ligne assure que seulement les enregistrements avec PaymentCategory non null seront inclus
            include: [
              {
                model: SettingServiceSpecialite,
                attributes: ["name_specialite"],
              },
            ],
          },
        ],
        where: { id_organisation: req.params.org_id },
      });

    if (PaymentCategoryOrganisationModal.length === 0) {
      res.json({ status: 0, message: "Not Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Payment Category Organisation List",
        data: PaymentCategoryOrganisationModal,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};

exports.getPriceGridDetailByGridID = async (req, res) => {
  try {
    const PriceGridDetailsAll = await Database.query(
      `select pricegriddetails.detailID, id as idpco,setting_service_specialite.name_specialite,payment_category.prestation, pricegriddetails.adjustedPrice from pricegriddetails
      join payment_category on payment_category.id=pricegriddetails.productID
      join setting_service_specialite on setting_service_specialite.idspe = payment_category.id_spe
      join setting_service on setting_service.idservice=setting_service_specialite.id_service
      where pricegriddetails.gridID=${req.params.gridID} and pricegriddetails.status = 'actived' order by pricegriddetails.detailID desc`,
      { type: Database.QueryTypes.SELECT }
    );
    if (PriceGridDetailsAll === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Price Grid Details List",
        data: PriceGridDetailsAll,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.addPriceGridDetails = async (req, res) => {
  try {
    const {
      gridName,
      gridReference,
      startDate,
      endDate,
      adjustmentType,
      adjustmentValue,
      details,
      organizationID,
      lastModifiedBy,
      isShared, // Ajouter isShared
    } = req.body;

    console.log("details .. ", details);

    const newPriceGrid = await PriceGrids.create({
      organizationID: organizationID,
      gridName: gridName,
      description: gridReference,
      effectiveDate: startDate || new Date(),
      expiryDate: endDate || new Date(),
      lastModifiedDate: new Date(),
      lastModifiedBy: lastModifiedBy,
      isActive: true,
      adjustmentType: adjustmentType || "increasePercent",
      adjustmentValue: adjustmentValue || 0,
      isShared: isShared ? 1 : 0, // Définir isShared en fonction de la valeur reçue
    });
    console.log("le body envoyé ", newPriceGrid);

    // Créer les entrées dans la table PriceGridDetails
    const priceGridDetails = details.map((detail) => ({
      gridID: newPriceGrid.gridID,
      productID: detail.idpco,
      adjustedPrice: detail.adjustedPrice,
      adjustmentType,
      adjustmentValue,
      effectiveDate: startDate
        ? startDate
        : moment().format("YYYY-MM-DD HH:mm:ss"),
      expiryDate: endDate ? endDate : moment().format("YYYY-MM-DD HH:mm:ss"),
      lastModifiedBy: detail.lastModifiedBy,
      status: "actived",
      organizationID: organizationID,
    }));

    await PriceGridDetails.bulkCreate(priceGridDetails);

    res.json({
      status: 1,
      message: "Price Grid and Details added successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error adding price grid and details",
      error: error.message,
    });
  }
};

exports.getPrestation = async (req, res) => {
  try {
    const Prestation = await Database.query(
      `select id, name_service, name_specialite, prestation
from payment_category pc
join setting_service_specialite on setting_service_specialite.idspe = pc.id_spe 
join setting_service on setting_service_specialite.id_service = setting_service.idservice
WHERE pc.id NOT IN (
    SELECT pd.productID
    FROM pricegriddetails pd
    WHERE pd.organizationID = ${req.params.org_id}
);
`,
      { type: Database.QueryTypes.SELECT }
    );
    if (Prestation === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Prestation List",
        data: Prestation,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.createOrUpdatePriceGridsAndDetails = async (req, res) => {
  const { organizationID, lastModifiedBy, prestations } = req.body;

  if (
    !organizationID ||
    !Array.isArray(prestations) ||
    prestations.length === 0
  ) {
    return res.status(400).json({
      status: 0,
      message:
        "Invalid input. Please provide organizationID and a list of IDs.",
    });
  }

  try {
    let assuranceGrid = await PriceGrids.findOne({
      where: {
        organizationID: organizationID,
        gridName: "Assurance",
      },
    });

    let ipmGrid = await PriceGrids.findOne({
      where: {
        organizationID: organizationID,
        gridName: "IPM",
      },
    });

    if (!assuranceGrid) {
      assuranceGrid = await PriceGrids.create({
        organizationID: organizationID,
        gridName: "Assurance",
        description: "Price grid for Assurance",
        effectiveDate: new Date(),
        expiryDate: null,
        lastModifiedDate: new Date(),
        lastModifiedBy: lastModifiedBy,
        isActive: true,
        adjustmentType: "increasePercent",
        adjustmentValue: 0,
      });
    }

    if (!ipmGrid) {
      ipmGrid = await PriceGrids.create({
        organizationID: organizationID,
        gridName: "IPM",
        description: "Price grid for IPM",
        effectiveDate: new Date(),
        expiryDate: null,
        lastModifiedDate: new Date(),
        lastModifiedBy: lastModifiedBy,
        isActive: true,
        adjustmentType: "increasePercent",
        adjustmentValue: 0,
      });
    }

    const paymentCategoryIds = prestations.map((item) => item.id);
    const paymentCategories = await PaymentCategory.findAll({
      where: {
        id: paymentCategoryIds,
      },
    });

    for (const category of paymentCategories) {
      const tiersPayant = await TiersPayant.findOne({
        where: { code: category.cotation },
      });

      const coefficient = parseFloat(category.coefficient) || 0;
      let adjustedPriceAssurance = 0;
      let adjustedPriceIPM = 0;

      // Calculate adjusted prices if `tiersPayant` exists
      if (tiersPayant) {
        const prixAssurance = parseFloat(tiersPayant.prix_assurance) || 0;
        const prixIPM = parseFloat(tiersPayant.prix_ipm) || 0;
        adjustedPriceAssurance = Math.round(coefficient * prixAssurance);
        adjustedPriceIPM = Math.round(coefficient * prixIPM);
      }

      // Create Assurance grid detail
      const existingAssuranceDetail = await PriceGridDetails.findOne({
        where: {
          gridID: assuranceGrid.gridID,
          productID: category.id,
        },
      });

      if (!existingAssuranceDetail) {
        await PriceGridDetails.create({
          gridID: assuranceGrid.gridID,
          productID: category.id,
          adjustedPrice: adjustedPriceAssurance, // Use 0 if no `tiersPayant` or coefficient found
          adjustmentType: "increasePercent",
          adjustmentValue: 0,
          effectiveDate: new Date(),
          expiryDate: null,
          status: "actived",
          organizationID: organizationID,
        });
      }

      // Create IPM grid detail
      const existingIPMDetail = await PriceGridDetails.findOne({
        where: {
          gridID: ipmGrid.gridID,
          productID: category.id,
        },
      });

      if (!existingIPMDetail) {
        await PriceGridDetails.create({
          gridID: ipmGrid.gridID,
          productID: category.id,
          adjustedPrice: adjustedPriceIPM, // Use 0 if no `tiersPayant` or coefficient found
          adjustmentType: "increasePercent",
          adjustmentValue: 0,
          effectiveDate: new Date(),
          expiryDate: null,
          status: "actived",
          organizationID: organizationID,
        });
      }
    }

    res.json({
      status: 1,
      message: "Price grids and details created or updated successfully",
      data: {
        assuranceGrid,
        ipmGrid,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({
        status: 0,
        message:
          "Erreur de saisie en double. Le nom du grille tarifaire existe déjà au sein de l'organisation",
        error: error.message,
      });
    } else {
      console.error(
        "Error creating or updating price grids and details:",
        error
      );
      res.status(500).json({
        status: 0,
        message:
          "Erreur lors de la création ou de la mise à jour des grilles de prix et des détails",
        error: error.message,
      });
    }
  }
};

exports.updatePriceGridDetails = async (req, res) => {
  try {
    const {
      gridID,
      gridName,
      gridReference,
      startDate,
      endDate,
      adjustmentType,
      adjustmentValue,
      details,
      organizationID,
      lastModifiedBy,
      isShared, // Ajouter isShared
    } = req.body;

    console.log("req body ", req.body);

    // Vérifiez que gridID est défini
    if (!gridID) {
      return res.status(400).json({
        status: 0,
        message: "Missing gridID",
      });
    }

    // Mettre à jour la grille de prix existante
    const [updatedPriceGrid] = await PriceGrids.update(
      {
        organizationID: organizationID,
        gridName: gridName,
        description: gridReference,
        effectiveDate: startDate || new Date(),
        expiryDate: endDate || new Date(),
        lastModifiedDate: new Date(),
        lastModifiedBy: lastModifiedBy,
        isActive: true,
        adjustmentType: adjustmentType || "increasePercent",
        adjustmentValue: adjustmentValue || 0,
        isShared: isShared ? 1 : 0, // Ajouter isShared
      },
      {
        where: { gridID: gridID },
      }
    );

    if (!updatedPriceGrid) {
      return res.status(404).json({
        status: 0,
        message: "Price Grid not found",
      });
    }

    // Mettre à jour les détails existants de PriceGridDetails
    for (const detail of details) {
      const [updated] = await PriceGridDetails.update(
        {
          adjustedPrice: detail.adjustedPrice,
          adjustmentType,
          adjustmentValue,
          effectiveDate: startDate
            ? startDate
            : moment().format("YYYY-MM-DD HH:mm:ss"),
          expiryDate: endDate
            ? endDate
            : moment().format("YYYY-MM-DD HH:mm:ss"),
          lastModifiedBy: detail.lastModifiedBy,
        },
        {
          where: { detailID: detail.detailID },
        }
      );

      if (!updated) {
        // Si aucune ligne n'a été mise à jour, cela signifie que la ligne n'existe pas et doit être créée
        await PriceGridDetails.create({
          gridID: gridID,
          productID: detail.idpco,
          adjustedPrice: detail.adjustedPrice,
          adjustmentType,
          adjustmentValue,
          effectiveDate: startDate
            ? startDate
            : moment().format("YYYY-MM-DD HH:mm:ss"),
          expiryDate: endDate
            ? endDate
            : moment().format("YYYY-MM-DD HH:mm:ss"),
          lastModifiedBy: detail.lastModifiedBy,
        });
      }
    }

    res.json({
      status: 1,
      message: "Price Grid and Details updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error updating price grid and details",
      error: error.message,
    });
  }
};

exports.getPrestationImported = async (req, res) => {
  console.log("la recuperation de limport ", req.params.org_id);
  try {
    const Prestation = await Database.query(
      `SELECT 
    payment_category.id, 
    setting_service.name_service, 
    setting_service_specialite.name_specialite, 
    payment_category.prestation, 
    pricegriddetails.status,
    MAX(pricegriddetails.detailID) AS latest_detailID
FROM payment_category
JOIN setting_service_specialite ON setting_service_specialite.idspe = payment_category.id_spe
JOIN setting_service ON setting_service_specialite.id_service = setting_service.idservice
JOIN pricegriddetails ON pricegriddetails.productID = payment_category.id
WHERE pricegriddetails.organizationID = ${req.params.org_id} 
GROUP BY 
    payment_category.id, 
    setting_service.name_service, 
    setting_service_specialite.name_specialite, 
    payment_category.prestation, 
    pricegriddetails.status
ORDER BY latest_detailID DESC`,
      { type: Database.QueryTypes.SELECT }
    );
    if (Prestation === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Prestation Importation List",
        data: Prestation,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.updatePrestationStatus = async (req, res) => {
  try {
    console.log("Request received:", req.params, req.body); // Add logging
    const { organizationID, productID } = req.params;
    const { status } = req.body;

    const updated = await PriceGridDetails.update(
      { status },
      {
        where: {
          organizationID,
          productID,
        },
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({
        status: 0,
        message: "PriceGridDetails not found or no update made",
      });
    }

    res.json({
      status: 1,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Error updating status:", error); // Add logging
    res.status(500).json({
      status: 0,
      message: "Error updating status",
      error: error.message,
    });
  }
};

exports.createPriceGridDetails = async (req, res) => {
  const {
    organizationID,
    gridID,
    adjustmentType,
    adjustmentValue,
    effectiveDate,
    status,
    pricegriddetails,
  } = req.body;

  if (
    !organizationID ||
    !gridID ||
    !Array.isArray(pricegriddetails) ||
    pricegriddetails.length === 0
  ) {
    return res.status(400).json({
      status: 0,
      message:
        "Invalid input. Please provide organizationID, gridID, adjustmentType, adjustmentValue, effectiveDate, status and a list of pricegriddetails.",
    });
  }

  try {
    // Parcourir chaque détail de price grid pour créer les nouveaux détails
    for (const detail of pricegriddetails) {
      const { productID, adjustedPrice } = detail;

      // Créer un nouveau détail de price grid
      await PriceGridDetails.create({
        gridID: gridID,
        productID: productID,
        adjustedPrice: adjustedPrice,
        adjustmentType: adjustmentType,
        adjustmentValue: adjustmentValue,
        effectiveDate: effectiveDate,
        expiryDate: null,
        status: status,
        organizationID: organizationID,
      });
    }

    res.json({
      status: 1,
      message: "Price grid details created successfully",
    });
  } catch (error) {
    console.error("Error creating price grid details:", error);
    res.status(500).json({
      status: 0,
      message: "Error creating price grid details",
      error: error.message,
    });
  }
};

exports.getPrestationPriceGrids = async (req, res) => {
  try {
    const Prestation = await Database.query(
      `SELECT 
    payment_category.prestation, 
    pricegriddetails.*
FROM 
    pricegriddetails
JOIN 
    payment_category 
ON 
    payment_category.id = pricegriddetails.productID
WHERE 
    pricegriddetails.organizationID = ${req.params.org_id}
    AND pricegriddetails.gridID != ${req.params.gridID} 
    AND pricegriddetails.productID NOT IN (
        SELECT 
            productID 
        FROM 
            pricegriddetails 
        WHERE 
            gridID = ${req.params.gridID}
    ) 
    AND pricegriddetails.status = 'actived'
GROUP BY 
    pricegriddetails.productID`,
      { type: Database.QueryTypes.SELECT }
    );
    if (Prestation === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Prestation List Grid",
        data: Prestation,
      });
    }
  } catch (error) {
    throw error;
  }
};

// controllers/priceGridsController.js
exports.updateIsShared = async (req, res) => {
  try {
    const { gridID } = req.params;
    const { isShared } = req.body;

    const updated = await PriceGrids.update(
      { isShared },
      {
        where: {
          gridID,
        },
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({
        status: 0,
        message: "PriceGrid not found or no update made",
      });
    }

    res.json({
      status: 1,
      message: "isShared updated successfully",
    });
  } catch (error) {
    console.error("Error updating isShared:", error);
    res.status(500).json({
      status: 0,
      message: "Error updating isShared",
      error: error.message,
    });
  }
};
exports.getPriceGridShareOrganisation = async (req, res) => {
  try {
    PriceGridsAll = await PriceGrids.findAll({
      attributes: [
        "gridID",
        "gridName",
        "isShared",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("effectiveDate"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "effectiveDate",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("lastModifiedDate"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "lastModifiedDate",
        ],
      ],
      where: { organizationID: req.params.orgId, isShared: "1" },
      order: [["gridID", "DESC"]],
    });
    if (PriceGridsAll === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Price Grid List",
        data: PriceGridsAll,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getAssuranceByOrganisation = async (req, res) => {
  try {
    const Assurance = await Database.query(
      `select organisation.id, organisation.nom from partenariat_sante_assurance join organisation on organisation.id = partenariat_sante_assurance.id_organisation_assurance where partenariat_sante_assurance.id_organisation_sante = ${req.params.orgId}`,
      { type: Database.QueryTypes.SELECT }
    );
    if (Assurance === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Assurance List Organisation",
        data: Assurance,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getPaymentOrganisation = async (req, res) => {
  try {
    const Prestation = await Database.query(
      `SELECT 
  servicerequest.requestID, 
  patient.name, 
  patient.last_name, 
   ROUND(paymentbis.amount, 0) AS montant_du, 
   ROUND(paymentbis.amountDue, 0) AS montant_payer, 
  ROUND(paymentbis.amount - paymentbis.amountDue, 0) AS reste_a_payer, 
  paymentbis.date_created, 
  paymentbis.walletType,
  servicerequest.status
FROM servicerequest 
JOIN patient ON patient.id = servicerequest.patientID 
JOIN paymentbis ON paymentbis.serviceRequestID = servicerequest.requestID
where servicerequest.organisationID=${req.params.org_id} order by servicerequest.requestID desc`,
      { type: Database.QueryTypes.SELECT }
    );
    if (Prestation === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Payment List",
        data: Prestation,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getPaymentOrdresOrganisation = async (req, res) => {
  try {
    const Prestation = await Database.query(
      `select serviceinstance.instanceID, name_specialite, payment_category.prestation, ROUND(serviceinstance.priceProduct, 0) as priceProduct, serviceinstance.lastModifiedAt, serviceinstance.status from serviceinstance join payment_category on payment_category.id=serviceinstance.productID join servicerequest on  servicerequest.requestID = serviceinstance.serviceID join setting_service_specialite on setting_service_specialite.idspe = payment_category.id_spe where servicerequest.requestID=${req.params.serviceID}`,
      { type: Database.QueryTypes.SELECT }
    );
    if (Prestation === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Payment Ordre List",
        data: Prestation,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getActeDemandeAutresActes = async (req, res) => {
  const id_organisation = req.body.id_organisation;

  try {
    // Fetching initial payment data
    const paymentData = await Database.query(
      `SELECT * FROM payment 
       WHERE (id_organisation = ${Database.escape(id_organisation)} 
       OR (etat = 1 AND organisation_destinataire = ${Database.escape(
         id_organisation
       )}))
       ORDER BY date_string DESC`,
      { type: Database.QueryTypes.SELECT }
    );

    // Step 2: Extract unique organisation_destinataire IDs
    const organisationIds = [
      ...new Set(paymentData.map((p) => p.organisation_destinataire)),
    ];

    // Step 3: Fetch organisation destinataire information
    const organisationsData = await Database.query(
      `SELECT * FROM organisation WHERE id IN (${organisationIds
        .map((id) => Database.escape(id))
        .join(", ")})`,
      { type: Database.QueryTypes.SELECT }
    );

    // Step 4: Create organisation mapping for quick lookup
    const organisationMap = organisationsData.reduce((map, organisation) => {
      map[organisation.id] = organisation;
      return map;
    }, {});

    // Fetching all needed data in parallel
    let categoryIds = new Set();
    paymentData.forEach((payment) => {
      if (payment.category_name) {
        payment.category_name.split(",").forEach((category) => {
          const [categoryId] = category.split("*");
          categoryIds.add(categoryId);
        });
      }
    });

    const [
      categoriesData,
      servicesData,
      specialitesData,
      prestationsData,
      patientsData,
      labsData,
      allLabData,
    ] = await Promise.all([
      Database.query(
        `SELECT * FROM payment_category WHERE id IN (${[...categoryIds]
          .map((id) => Database.escape(id))
          .join(", ")})`,
        { type: Database.QueryTypes.SELECT }
      ),
      Database.query(`SELECT * FROM setting_service`, {
        type: Database.QueryTypes.SELECT,
      }),
      Database.query(`SELECT * FROM setting_service_specialite`, {
        type: Database.QueryTypes.SELECT,
      }),
      Database.query(
        `SELECT * FROM payment_category_parametre WHERE id_prestation IN (${[
          ...categoryIds,
        ]
          .map((id) => Database.escape(id))
          .join(", ")})`,
        { type: Database.QueryTypes.SELECT }
      ),
      Database.query(
        `SELECT * FROM patient WHERE id IN (${paymentData
          .map((p) => Database.escape(p.patient))
          .join(", ")})`,
        { type: Database.QueryTypes.SELECT }
      ),
      Database.query(
        `SELECT * FROM lab WHERE payment IN (${paymentData
          .map((p) => Database.escape(p.id))
          .join(", ")})`,
        { type: Database.QueryTypes.SELECT }
      ),
      Database.query(
        `SELECT * FROM lab_data WHERE id_payment IN (${paymentData
          .map((p) => Database.escape(p.id))
          .join(", ")})`,
        { type: Database.QueryTypes.SELECT }
      ),
    ]);

    // Creating maps for quick lookup
    const serviceMap = servicesData.reduce((map, service) => {
      map[service.idservice] = service;
      return map;
    }, {});

    const specialiteMap = specialitesData.reduce((map, specialite) => {
      map[specialite.idspe] = specialite;
      return map;
    }, {});

    const patientMap = patientsData.reduce((map, patient) => {
      map[patient.id] = patient;
      return map;
    }, {});

    const labMap = labsData.reduce((map, lab) => {
      map[lab.payment] = lab;
      return map;
    }, {});

    const labDataMap = allLabData.reduce((map, labData) => {
      const key = `${labData.id_para}-${labData.id_payment}`;
      map[key] = labData;
      return map;
    }, {});

    // Building the final labData array with filtering for the specified services
    let labData = [];
    paymentData.forEach((payment) => {
      const paymentCategories = payment.category_name
        ? payment.category_name.split(",")
        : [];
      paymentCategories.forEach((categoryString) => {
        const [categoryId, , , , status_number] = categoryString.split("*");
        const category = categoriesData.find(
          (cat) => cat.id.toString() === categoryId
        );
        if (category) {
          const service = serviceMap[category.id_service];
          const specialite = specialiteMap[category.id_spe];
          const patient = patientMap[payment.patient];
          const lab = labMap[payment.id];
          const prestationParams = prestationsData
            .filter((p) => p.id_prestation === category.id)
            .map((p) => {
              const labKey = `${p.idpara}-${payment.id}`;
              return {
                ...p,
                prestationSaisie: labDataMap[labKey]
                  ? labDataMap[labKey]
                  : null,
              };
            });

          // Filter to include services that are NOT "Laboratoire d'Analyses Médicales" or "Biologie médicale"
          if (
            service &&
            service.name_service !== "Laboratoire d'Analyses Médicales" &&
            service.name_service !== "Biologie médicale"
          ) {
            const organisationInfo =
              organisationMap[payment.organisation_destinataire];
            labData.push({
              id_payment: payment.id,
              payment_code: payment.code,
              amount: payment.amount,
              payment_etat: payment.etat,
              payment_etatlight: payment.etatlight,
              organnisation_destinataire: payment.organisation_destinataire,
              code: payment.code + category.id,
              date_string: payment.date_string,
              patient_name: payment.patient_name,
              id_service: category.id_service,
              name_service: service ? service.name_service : null,
              id_specialite: category.id_spe,
              name_specialite: specialite ? specialite.name_specialite : null,
              code_specialite: specialite ? specialite.code_specialite : null,
              id_prestation: category.id,
              prestation: category.prestation,
              id_organisation: payment.id_organisation,
              id_doctor: payment.doctor,
              doctor_name: payment.doctor_name,
              status_number: status_number,
              status:
                ["UNKNOWN", "EN ATTENTE", "EN COURS", "TERMINÉ"][
                  status_number
                ] || "UNKNOWN",
              date_prelevement: lab ? lab.date_prelevement : null,
              clinique: payment.renseignementClinique,
              patient_data: patient,
              prestationDetails: prestationParams,
              lab: lab,
              motifVoyage: payment.motifVoyage,

              // Add organisation destinataire information
              organisation_destinataire_info: organisationInfo
                ? {
                    id: organisationInfo.id,
                    name: organisationInfo.name,
                    address: organisationInfo.address,
                  }
                : null,
            });
          }
        }
      });
    });

    // Sorting and sending response
    labData.sort((a, b) => new Date(b.date_string) - new Date(a.date_string));
    if (labData.length > 0) {
      res.json({
        status: 1,
        message: "Act non labo",
        data: labData,
      });
    } else {
      res.status(404).send("Pas de données trouvées pour cet id_organisation");
    }
  } catch (error) {
    console.error("Erreur :", error);
    res
      .status(500)
      .send("Une erreur s'est produite lors de la récupération des données");
  }
};

// Endpoint pour récupérer les partenaires d'un partenariat santé à partir d'une organisation d'origine
exports.getPartenairesSanteByOrigine = async (req, res) => {
  try {
    const id_organisation_origin = req.params.id_organisation_origin;
    const partenaires = await Database.query(
      `SELECT partenariat_sante.id_organisation_destinataire, organisation.nom 
      FROM partenariat_sante 
      JOIN organisation ON partenariat_sante.id_organisation_destinataire = organisation.id
      WHERE partenariat_sante.id_organisation_origin = :id_organisation_origin`,
      {
        replacements: { id_organisation_origin },
        type: Database.QueryTypes.SELECT,
      }
    );
    res.json({
      status: 1,
      message: "Liste des partenaires santé pour l'organisation d'origine",
      data: partenaires,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Erreur lors de la récupération des partenaires santé",
      error: error.message,
    });
  }
};
