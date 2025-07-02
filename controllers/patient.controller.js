const i18n = require("i18n");
const langPatientModule = i18n.__("patientModule");
const langCommon = i18n.__("common");
const Sequelize = require("sequelize");
const Database = require("../config").sequelize;
const Op = Sequelize.Op;
const moment = require("moment");
moment.locale("en");
const levenshtein = require("fast-levenshtein");
const path = require("path");
const nodemailer = require("nodemailer");

var User = require("../models/User");
var Patient = require("../models/Patient");
var Region = require("../models/Region");
var District = require("../models/District");
var Country = require("../models/Country");
var Appointment = require("../models/Appointment");
var SettingService = require("../models/SettingService");
var SettingServiceSpecialiteOrganisation = require("../models/SettingServiceSpecialiteOrganisation");
var HolidaysService = require("../models/HolidaysService");
var TimeSlotService = require("../models/TimeSlotService");
var CurrentMedications = require("../models/CurrentMedications");
var PreConditions = require("../models/PreConditions");
var HealthIssueType = require("../models/HealthIssueType");
var HealthIssue = require("../models/HealthIssue");
var PatientRelation = require("../models/PatientRelation");
var PatientMaterial = require("../models/PatientMaterial");
var DocumentTypes = require("../models/DocumentTypes");
var VitalSign = require("../models/VitalSign");
var Organisation = require("../models/Organisation");
var PatientMutuelle = require("../models/PatientMutuelle");
var Payment = require("../models/Payment");
var ServiceCategory = require("../models/ServiceCategory");
var PatientDeposit = require("../models/PatientDeposit");
var Settings = require("../models/Settings");
var LabTest = require("../models/LabTest");
var PaymentCategory = require("../models/PaymentCategory");
var MasterMedicine = require("../models/MasterMedicine");
var ClinicalNotes = require("../models/ClinicalNotes");
var ReferenceForm = require("../models/ReferenceForm");
var MiseEnObservation = require("../models/MiseEnObservation");
var ConfidentialNotes = require("../models/ConfidentialNotes");
var DeathRecord = require("../models/DeathRecord");
var PatientHospitalization = require("../models/PatientHospitalization");
var PatientLogs = require("../models/PatientLogs");
var Prescriptions = require("../models/Prescriptions");
var TestRequests = require("../models/TestRequests");
var Illness = require("../models/Illness");
var NosologieIllness = require("../models/NosologieIllness");
var IllnessConsultation = require("../models/IllnessConsultation");
var PartenariatSanteAssurance = require("../models/PartenariatSanteAssurance");
var TestItems = require("../models/TestItems");
var PrescribedMedicins = require("../models/PrescribedMedicins");
var ClinicalDesease = require("../models/ClinicalDesease");
var ServiceRequest = require("../models/ServiceRequest");
var ServiceInstance = require("../models/ServiceInstance");
var PaymentBIS = require("../models/PaymentBis");
const multer = require("multer");
const fs = require("fs");
const Docmosis = require("../helpers/DocmosisHelper");
var Transaction = require("../models/Transaction");
var Drug = require("../models/Drug");
var Prelevement = require("../models/Prelevement");
var InvoiceItem = require("../models/InvoiceItem");
//////Modal Relationship

Patient.belongsTo(Region, { as: "region_details", foreignKey: "region" });
Patient.belongsTo(District, { as: "district_details", foreignKey: "district" });
Patient.belongsTo(Country, { as: "country_details", foreignKey: "country" });

// Current Medications
CurrentMedications.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
CurrentMedications.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
CurrentMedications.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

// known Health issue
PreConditions.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
PreConditions.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
PreConditions.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

PreConditions.belongsTo(HealthIssueType, {
  as: "type_details",
  foreignKey: "type_id",
});
PreConditions.belongsTo(HealthIssue, {
  as: "issue_details",
  foreignKey: "issue_id",
});

// Attachments

PatientMaterial.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
PatientMaterial.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
PatientMaterial.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "id_organisation",
});
PatientMaterial.belongsTo(DocumentTypes, {
  as: "doctypes_details",
  foreignKey: "category",
});
// Vital Sign
VitalSign.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
VitalSign.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
VitalSign.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "id_organisation",
});

// Appointment
Appointment.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
Appointment.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
Appointment.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "id_organisation",
});

// Invoice & Payments
Payment.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
Payment.belongsTo(User, { as: "updatedby_details", foreignKey: "updated_by" });
Payment.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "id_organisation",
});

// Patient Deposit
PatientDeposit.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
PatientDeposit.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
PatientDeposit.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "id_organisation",
});

// Assurance
PatientMutuelle.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
PatientMutuelle.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
PatientMutuelle.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "id_organisation",
});
PatientMutuelle.belongsTo(Organisation, {
  as: "nom_mutuelle_details",
  foreignKey: "pm_idmutuelle",
});

// Dependants
PatientRelation.belongsTo(Patient, {
  as: "parent_details",
  foreignKey: "parent_id",
});
PatientRelation.belongsTo(Patient, {
  as: "dependant_details",
  foreignKey: "relative_id",
});
PatientRelation.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
PatientRelation.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
PatientRelation.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

// Clinical Notes
ClinicalNotes.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
ClinicalNotes.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
ClinicalNotes.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

// Confidential Notes
ConfidentialNotes.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
ConfidentialNotes.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
ConfidentialNotes.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

// Death Record
DeathRecord.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
DeathRecord.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
DeathRecord.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

// Hospitalization
PatientHospitalization.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
PatientHospitalization.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
PatientHospitalization.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

// Prescriptions
Prescriptions.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
Prescriptions.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
Prescriptions.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

// Requests
TestRequests.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
TestRequests.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
TestRequests.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});

// Timeline
PatientLogs.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
PatientLogs.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});
PatientLogs.belongsTo(Organisation, {
  as: "org_details",
  foreignKey: "org_id",
});
const BASEPATH = process.env.BASE_PATH;
const BASEURL = process.env.SITE_URL;
const APP_URL = process.env.APP_URL;
exports.getAllPatients = async (req, res) => {
  try {
    let search = req.query.search;
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

    let whereClause = {
      id_organisation: req.org_id,
      parent_id: null,
    };

    if (search && search.trim() !== "") {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn(
              "concat",
              Sequelize.col("name"),
              " ",
              Sequelize.col("last_name")
            ),
            {
              [Op.like]: `%${search}%`,
            }
          ),
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { unique_id: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await Patient.findAndCountAll({
      where: {
        id_organisation: req.org_id,
        parent_id: null,
      },
    });
    PatientModal = await Patient.findAll({
      attributes: [
        "id",
        "unique_id",
        "name",
        "last_name",
        ["patient_id", "code"],
        ["sex", "gender"],
        "age",
        "email",
        "phone",
        "address",
        "region",
        ["registration_time", "register"],
        "grade",
        "estCivil",
        "passport",
        "matricule",
        ["bloodgroup", "blood_type"],
        "birthdate",
        ["birth_position", "birth_place"],
        "religion",
        "img_url",
        ["nom_contact", "emergency_contact_name"],
        ["phone_contact", "emergency_contact_no"],
        [
          Sequelize.literal(
            '(SELECT ((SUM(p.gross_total) + SUM(p.frais_service)) - (select SUM(patient_deposit.deposited_amount) as sum_deposit from patient_deposit where patient = p.patient)) as total_due from payment as p where p.bulletinAnalyse like "" and p.patient = Patient.id and id_organisation=' +
              req.org_id +
              ")"
          ),
          "due_amount",
        ],
      ],
      order: [["id", "DESC"]],
      limit: datalimit,
      offset: offsetdata,
      where: whereClause,
    });
    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.patientListFetched,
        data: PatientModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.createPrelevement = async (req, res) => {
  try {
    const {
      service_instance_id,
      date_prelevement,
      method_prelevement,
      type_echantillon,
      statut_prelevement,
      resultat_disponible,
      commentaire,
    } = req.body;

    // Vérifier si le service_instance existe
    const serviceInstance = await ServiceInstance.findByPk(service_instance_id);
    if (!serviceInstance) {
      return res.status(404).json({ message: "ServiceInstance non trouvé" });
    }

    // Créer l'entrée de prélèvement
    const newPrelevement = await Prelevement.create({
      service_instance_id,
      date_prelevement,
      method_prelevement,
      type_echantillon,
      statut_prelevement,
      resultat_disponible,
      commentaire,
    });

    return res.status(201).json({
      message: "Prélèvement enregistré avec succès",
      prelevement: newPrelevement,
    });
  } catch (error) {
    console.error("Erreur lors de la création du prélèvement :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updateUniqueID = async (req, res) => {
  try {
    PatientModal = await Patient.findAll({ unique_id: null });
    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      PatientModal.map(async (patient) => {
        await Patient.update(
          { unique_id: "2101" + patient.id_organisation + patient.id },
          { where: { id: patient.id } }
        );
      });
      res.json({ status: 1, message: "Unique Patient ID Generated", data: "" });
    }
  } catch (error) {
    throw error;
  }
};

async function filterObjectsByMatchingPercentage(
  objects,
  fieldQueryPairs,
  minPercentage
) {
  // Remove empty values from fieldQueryPairs
  fieldQueryPairs = Object.fromEntries(
    Object.entries(fieldQueryPairs).filter(([field, query]) => query !== "")
  );

  const bestMatchingObjs = [];

  for (const obj of objects) {
    const matchingFields = {};
    let combinedPercentage = 0;
    const totalFields = Object.keys(fieldQueryPairs).length;

    for (const [field, query] of Object.entries(fieldQueryPairs)) {
      const propertyValue = obj.get(field); // Use the get method to access the property
      if (propertyValue !== null && propertyValue !== undefined) {
        const distance = levenshtein.get(
          propertyValue.toString(),
          query.toString()
        );
        const percentage =
          (1 - distance / Math.max(query.length, propertyValue.length)) * 100 ||
          0;

        matchingFields[field] = percentage;
        combinedPercentage += percentage;
      } else {
        // Handle the case when the property is null or undefined
      }
    }

    // Convert the Sequelize object to a plain JavaScript object
    const plainObject = obj.toJSON();

    // Add the matchingFields and overallPercentage properties
    plainObject.matchingFields = matchingFields;
    plainObject.overallPercentage =
      totalFields > 0 ? combinedPercentage / totalFields : 0;

    if (
      plainObject.overallPercentage >= minPercentage &&
      (bestMatchingObjs.length === 0 ||
        plainObject.overallPercentage >= bestMatchingObjs[0].overallPercentage)
    ) {
      if (
        bestMatchingObjs.length > 0 &&
        plainObject.overallPercentage > bestMatchingObjs[0].overallPercentage
      ) {
        bestMatchingObjs.length = 0;
      }
      bestMatchingObjs.push(plainObject);
    }
  }

  return bestMatchingObjs;
}

async function checkDuplicatePatients(
  name,
  lastname,
  phone,
  birthdate,
  email,
  cin = ""
) {
  if (cin != "") {
    PatientModal = await Patient.findAll({
      attributes: [
        "id",
        "unique_id",
        "name",
        "last_name",
        ["patient_id", "code"],
        ["sex", "gender"],
        "age",
        "email",
        "phone",
        "address",
        "region",
        ["registration_time", "register"],
        "grade",
        "estCivil",
        "passport",
        "matricule",
        ["bloodgroup", "blood_type"],
        "birthdate",
        ["birth_position", "birth_place"],
        "religion",
        "img_url",
        ["nom_contact", "emergency_contact_name"],
        ["phone_contact", "emergency_contact_no"],
      ],
      order: [["id", "DESC"]],
      where: { cin: cin },
    });
    return {
      status_code: 1,
      message: "Patient Already Exists With Exact match.",
      data: data,
    };
  }

  if (cin == "") {
    // $this->db->like('name', $name,'both');
    // $this->db->like('last_name', $lastname,'both');
    PatientModal = await Patient.findAll({
      attributes: [
        "id",
        "unique_id",
        "name",
        "last_name",
        ["patient_id", "code"],
        ["sex", "gender"],
        "age",
        "email",
        "phone",
        "address",
        "region",
        ["registration_time", "register"],
        "grade",
        "estCivil",
        "passport",
        "matricule",
        ["bloodgroup", "blood_type"],
        "birthdate",
        ["birth_position", "birth_place"],
        "religion",
        "img_url",
        ["nom_contact", "emergency_contact_name"],
        ["phone_contact", "emergency_contact_no"],
      ],
      order: [["id", "DESC"]],
    });
    fieldQueryPairs = {
      name: name,
      last_name: lastname,
      phone: phone,
      birthdate: birthdate,
      email: email,
    };
    maxDistance = 2; // Maximum Levenshtein distance
    minPercentage = 80;
    filteredData = await filterObjectsByMatchingPercentage(
      PatientModal,
      fieldQueryPairs,
      minPercentage
    );

    return {
      status_code: 1,
      message: "Patient Found With Similar Details.",
      data: filteredData,
    };
  }
}
exports.addPatient = async (req, res) => {
  try {
    duplicatesRefdata = await checkDuplicatePatients(
      req.body.name,
      req.body.last_name,
      req.body.phone,
      moment(req.body.birthdate).format("DD/MM/YYYY"),
      req.body.email
    );

    if (duplicatesRefdata.data.length > 0) {
      return res.json({
        status: 0,
        is_duplicates: true,
        message: duplicatesRefdata.message,
        data: duplicatesRefdata.data,
      });
    }
    PatientModal = await Patient.create({
      name: req.body.name,
      last_name: req.body.last_name,
      sex: req.body.sex,
      birthdate: moment(req.body.birthdate).format("DD/MM/YYYY"),
      age: req.body.age,
      phone: req.body.phone,
      email: req.body.email,
      passport: req.body.passport,
      address: req.body.address,
      country: req.body.country,
      region: req.body.region,
      district: req.body.district,
      estCivil: req.body.estCivil,
      bloodgroup: req.body.bloodgroup,
      birth_position: req.body.birth_position,
      nom_contact: req.body.nom_contact,
      phone_contact: req.body.phone_contact,
      religion: req.body.religion,
      matricule: req.body.matricule,
      grade: req.body.grade,
      parent_id: req.body.parent_id,
      registration_time: moment().unix(),
      add_date: moment().format("MM/DD/YY"),
      id_organisation: req.org_id,
      added_by: req.userId,
      status: 1,
    });

    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      if (req.files.profile) {
        await Patient.update(
          { img_url: req.files.profile[0].filename },
          { where: { id: PatientModal.id } }
        );
      }

      await Patient.update(
        {
          unique_id:
            PatientModal.country +
            "01" +
            PatientModal.id_organisation +
            PatientModal.id,
        },
        { where: { id: PatientModal.id } }
      );
      res.json({
        status: 1,
        message: langPatientModule.patientAdd,
        data: {
          id: PatientModal.id,
          name: PatientModal.name,
          last_name: PatientModal.last_name,
          unique_id:
            PatientModal.country +
            "01" +
            PatientModal.id_organisation +
            PatientModal.id,
        },
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getGeneralInfo = async (req, res) => {
  try {
    let getData = {};
    PatientModal = await Patient.findOne({
      attributes: [
        "id",
        "unique_id",
        "name",
        "last_name",
        ["patient_id", "code"],
        ["sex", "gender"],
        "sex",
        "age",
        "email",
        "phone",
        "address",
        "country",
        "region",
        "district",
        ["registration_time", "register"],
        "grade",
        "estCivil",
        "passport",
        "matricule",
        ["bloodgroup", "blood_type"],
        "birthdate",
        ["birth_position", "birth_place"],
        "religion",
        "img_url",
        ["nom_contact", "emergency_contact_name"],
        ["phone_contact", "emergency_contact_no"],
      ],
      where: { id: req.params.patient_id },
      include: [
        {
          model: Region,
          attributes: ["id", "name"],
          as: "region_details",
        },
        {
          model: District,
          attributes: ["id", "name"],
          as: "district_details",
        },
      ],
    });
    // console.log(PatientModal.birthdate);
    // PatientModal.birthdate = moment(PatientModal.birthdate).format('d/m/Y')
    // console.log(PatientModal);
    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      if (PatientModal.img_url) {
        PatientModal.img_url =
          BASEURL + "/uploads/imgUsers/" + PatientModal.img_url;
      } else {
        PatientModal.img_url =
          BASEURL + "/uploads/user-profile-placeholder.png";
      }
      next_appointment = await Appointment.findOne({
        attributes: [
          "id",
          "patient",
          "id_organisation",
          "time_slot",
          "s_time",
          "e_time",
          [
            Sequelize.fn(
              "DATE_FORMAT",
              Sequelize.col("appointment_date"),
              "%d/%m/%Y"
            ),
            "appointment_date",
          ],
        ],
        where: {
          status: 1,
          patient: req.params.patient_id,
          appointment_date: { [Op.gte]: moment().format("YYYY-MM-DD") },
        },
        order: [["appointment_date", "ASC"]],
      });
      last_appointment = await Appointment.findOne({
        attributes: [
          "id",
          "patient",
          "id_organisation",
          "time_slot",
          "s_time",
          "e_time",
          [
            Sequelize.fn(
              "DATE_FORMAT",
              Sequelize.col("appointment_date"),
              "%d/%m/%Y"
            ),
            "appointment_date",
          ],
        ],
        where: {
          status: 2,
          patient: req.params.patient_id,
          appointment_date: { [Op.lte]: moment().format("YYYY-MM-DD") },
        },
        order: [["appointment_date", "DESC"]],
      });
      // console.log(PatientModal.dataValues);
      res.json({
        status: 1,
        message: langPatientModule.patientGeneralInfo,
        data: PatientModal,
        next_appointment: next_appointment,
        last_appointment: last_appointment,
      });
    }
  } catch (error) {
    res.json({ status: 0, message: error, data: "" });
    // throw error;
  }
};

exports.getDetailsPatient = async (req, res) => {
  try {
    let getData = {};
    PatientModal = await Patient.findOne({
      attributes: [
        "id",
        "unique_id",
        "name",
        "last_name",
        ["patient_id", "code"],
        ["sex", "gender"],
        "age",
        "email",
        "phone",
        "address",
        "country",
        "region",
        "district",
        ["registration_time", "register"],
        "grade",
        "estCivil",
        "passport",
        "matricule",
        ["bloodgroup", "blood_type"],
        "birthdate",
        ["birth_position", "birth_place"],
        "religion",
        "img_url",
        ["nom_contact", "emergency_contact_name"],
        ["phone_contact", "emergency_contact_no"],
      ],
      where: { id: req.params.id },
    });
    // console.log(PatientModal.birthdate);
    // PatientModal.birthdate = moment(PatientModal.birthdate).format('d/m/Y')
    // console.log(PatientModal);
    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      if (PatientModal.img_url) {
        PatientModal.img_url =
          APP_URL + "/uploads/imgUsers/" + PatientModal.img_url;
      } else {
        PatientModal.img_url =
          APP_URL + "/uploads/user-profile-placeholder.png";
      }

      // console.log(PatientModal.dataValues);
      res.json({
        status: 1,
        message: langPatientModule.patientGeneralInfo,
        data: PatientModal,
      });
    }
  } catch (error) {
    res.json({ status: 0, message: error, data: "" });
    // throw error;
  }
};

exports.updateGeneralInfo = async (req, res) => {
  try {
    let getData,
      getProfile = [],
      file,
      results;
    getData = {
      name: req.body.name,
      last_name: req.body.last_name,
      sex: req.body.sex,
      birthdate: moment(req.body.birthdate).format("MM/DD/YYYY"),
      age: req.body.age,
      phone: req.body.phone,
      email: req.body.email,
      passport: req.body.passport,
      address: req.body.address,
      country: req.body.country,
      region: req.body.region,
      district: req.body.district,
      estCivil: req.body.estCivil,
      bloodgroup: req.body.bloodgroup,
      birth_position: req.body.birth_position,
      nom_contact: req.body.nom_contact,
      phone_contact: req.body.phone_contact,
      religion: req.body.religion,
      matricule: req.body.matricule,
      grade: req.body.grade,
      updated_by: req.userId,
    };

    if (req.files.profile) {
      getData.img_url = req.files.profile[0].filename;
    }
    // console.log(getData);
    PatientModal = await Patient.update(getData, {
      where: { id: req.params.patient_id },
    });
    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.patientUpdate,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Appointment
exports.getAppontments = async (req, res) => {
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
    const { count, rows } = await Appointment.findAndCountAll({
      where: { patient: req.params.patient_id },
    });

    let whereClause = {
      patient: req.params.patient_id,
    };

    AppointmentModal = await Appointment.findAll({
      attributes: [
        "id",
        "date",
        "time_slot",
        "service",
        "servicename",
        "tele_consultation",
        "remarks",
        "status",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Appointment.appointment_date"),
            "%d/%m/%Y"
          ),
          "appointment_date",
        ],
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
      where: { patient: req.params.patient_id },
      order: [["id", "DESC"]],
      limit: datalimit,
      offset: offsetdata,
    });
    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.appointment.list,
        data: AppointmentModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getAppointmentByID = async (req, res) => {
  try {
    let getData = [];
    AppointmentModal = await Appointment.findOne({
      attributes: [
        "id",
        "date",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Appointment.appointment_date"),
            "%d/%m/%Y"
          ),
          "appointment_date",
        ],
        "time_slot",
        "service",
        "servicename",
        "tele_consultation",
        "remarks",
        "status",
      ],
      where: { id: req.params.appointment_id },
    });
    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.appointment.individual,
        data: AppointmentModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addAppontment = async (req, res) => {
  try {
    PatientModal = await Patient.findOne({ where: { id: req.body.uniqueID } });
    let room_id =
      "teleconsultation_ecomed24-" +
      PatientModal.phone +
      "-" +
      Math.floor(Math.random() * 444444 + 1000000);
    let live_meeting_link = "https://teleconsultation.ecomed24.com/" + room_id;
    AppointmentModal = await Appointment.create({
      patient: req.body.uniqueID,
      code: req.body.code,
      id_organisation: req.org_id,
      doctor: req.body.doctor,
      date: moment(req.body.date).unix(),
      time_slot: req.body.time_slot,
      s_time: req.body.s_time,
      e_time: req.body.e_time,
      remarks: req.body.remarks,
      add_date: moment().format("MM/DD/YYYY"),
      registration_time: moment().unix(),
      s_time_key: req.body.s_time_key,
      status: req.body.status,
      user: req.userId,
      request: req.body.request,
      patientname: req.body.patientname,
      doctorname: req.body.doctorname,
      service: req.body.service,
      servicename: req.body.servicename,
      room_id: room_id,
      live_meeting_link: live_meeting_link,
      appointment_date: moment(req.body.date).format("YYYY-MM-DD"),
      tele_consultation: req.body.tele_consultation == 1 ? 1 : 0,
      added_by: req.userId,
    });

    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: AppointmentModal.patient,
        org_id: req.org_id,
        description: "New Appointment has been generated.",
        type: "appointment",
        action: "add",
        relation_id: AppointmentModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.appointment.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateAppontment = async (req, res) => {
  try {
    let getData = [],
      getProfile = [],
      file,
      results;
    console.log();
    // PatientModal = await Patient.findOne({where : {id:req.body.uniqueID}});

    AppointmentModal = await Appointment.update(
      {
        date: moment(req.body.date).unix(),
        time_slot: req.body.time_slot,
        s_time: req.body.s_time,
        e_time: req.body.e_time,
        remarks: req.body.remarks,
        s_time_key: req.body.s_time_key,
        status: req.body.status,
        service: req.body.service,
        servicename: req.body.servicename,
        appointment_date: moment(req.body.date).format("YYYY-MM-DD"),
        updated_by: req.userId,
        tele_consultation: req.body.tele_consultation == 1 ? 1 : 0,
      },
      {
        where: { id: req.params.id },
      }
    );

    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      AppointmentData = await Appointment.findOne({
        attributes: ["id", "patient"],
        where: { id: req.params.id },
      });
      console.log(AppointmentData);
      await PatientLogs.create({
        patient_id: AppointmentData.patient,
        org_id: req.org_id,
        description: "Appointment has been Updated.",
        type: "appointment",
        action: "update",
        relation_id: AppointmentData.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.appointment.update,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.deleteAppontment = async (req, res) => {
  try {
    AppointmentModal = await Appointment.destroy({
      where: { id: req.params.id },
    });
    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.appointment.delete,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.statusAppontment = async (req, res) => {
  try {
    AppointmentData = await Appointment.findOne({
      attributes: ["id", "patient"],
      where: { id: req.params.id },
    });
    console.log(AppointmentData);
    AppointmentModal = await Appointment.update(
      { status: req.body.status },
      { where: { id: req.params.id } }
    );
    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: AppointmentData.patient,
        org_id: req.org_id,
        description: "Appointment status has been Updated.",
        type: "appointment",
        action: "status",
        relation_id: AppointmentData.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.appointment.status,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.serviceAppontment = async (req, res) => {
  try {
    let getData = [];
    SettingServiceModal = await SettingService.findAll({
      attributes: ["idservice", "name_service"],
      where: { status_service: 1 },
    });
    if (SettingServiceModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.appointment.services,
        data: SettingServiceModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.timeSlotAppontment = async (req, res) => {
  try {
    let getData = [];
    // HolidaysServiceModal = await HolidaysService.findAll();
    // TimeSlotServiceModal = await TimeSlotService.findAll({
    //   attributes: [
    //     "id",
    //     "service",
    //     "s_time",
    //     "e_time",
    //     [
    //       Sequelize.fn(
    //         "CONCAT",
    //         Sequelize.col(`s_time`),
    //         " - ",
    //         Sequelize.col(`e_time`)
    //       ),
    //       "time_slots",
    //     ],
    //   ],
    //   where: {
    //     service: req.body.service,
    //     weekday: moment(req.body.date).format("dddd"),
    //   },
    //   order: [["s_time_key", "asc"]],
    // });
    TimeSlotServiceModal = await Database.query(
      `
      SELECT 
    s.id,
    s.service_id AS service,
    s.start_time AS s_time,
    s.end_time AS e_time,
    CONCAT(s.start_time, ' - ', s.end_time) AS time_slots
FROM slots s
LEFT JOIN appointment a 
  ON s.weekday = DAYOFWEEK(:appointment_date)
     AND a.appointment_date = :appointment_date
     AND (
         (s.start_time = a.s_time AND s.end_time = a.e_time)
     )
WHERE a.id IS NULL
  AND s.weekday = DAYOFWEEK(:appointment_date)
  AND s.service_id = :service   
  AND (
      :appointment_date > CURDATE()  
      OR (:appointment_date = CURDATE() AND CURTIME() < s.start_time) 
  );

    `,
      {
        replacements: {
          service: req.body.service,
          appointment_date: req.body.date,
        },
        type: Database.QueryTypes.SELECT,
      }
    );
    // if(HolidaysServiceModal.length === 0){
    //     AppointmentModal = await Appointment.findAll({where: {date: req.params.id,service: req.params.id}});
    //     TimeSlotServiceModal = await TimeSlotService.findAll({where: {service: req.params.id,weekday: req.params.id},order: [['s_time_key', 'asc']]});
    // }
    if (TimeSlotServiceModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.appointment.timeslots,
        data: TimeSlotServiceModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

// Invoice Payments
exports.getInvoicePayments = async (req, res) => {
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
    const { count, rows } = await Payment.findAndCountAll({
      where: { patient: req.params.patient_id },
    });
    PaymentModal = await Payment.findAll({
      attributes: [
        "id",
        "date",
        "code",
        "amount",
        "gross_total",
        "amount_received",
        "status_paid",
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
      where: { patient: req.params.patient_id, bulletinAnalyse: "" },
      order: [["id", "DESC"]],
      limit: datalimit,
      offset: offsetdata,
    });
    if (PaymentModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.payment.list,
        data: PaymentModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addDepositInvoicePayments = async (req, res) => {
  try {
    let getData = [],
      getRelationData = [],
      results;
    paymentDetails = await Payment.findOne({
      where: { id: req.body.paymentid },
    });
    if (req.body.deposit_type == "Cash") {
      deposited_amount =
        parseInt(req.body.deposited_amount) +
        parseInt(
          paymentDetails.amount_received ? paymentDetails.amount_received : 0
        );
      console.log(deposited_amount);
      if (
        parseInt(paymentDetails.gross_total) +
          parseInt(paymentDetails.frais_service) <
        deposited_amount
      ) {
        return res.json({
          status: 0,
          message: langPatientModule.payment.deposit.exceederror,
        });
      }

      let status_paid = "unpaid";
      let status = paymentDetails.status;

      if (paymentDetails.gross_total == deposited_amount) {
        status_paid = "paid";
      }

      if (paymentDetails.status == "new") {
        data_amount_received = {
          amount_received: deposited_amount,
          status: "pending",
          status_paid: status_paid,
        };
      } else {
        data_amount_received = {
          amount_received: deposited_amount,
          status: status,
          status_paid: status_paid,
        };
      }
      PaymentUpdate = await Payment.update(data_amount_received, {
        where: { id: paymentDetails.id },
      });

      PatientDepositModal = await PatientDeposit.create({
        patient: req.body.patient_id,
        id_organisation: req.org_id,
        payment_id: req.body.paymentid,
        date: moment().unix(),
        deposited_amount: req.body.deposited_amount,
        deposit_type: req.body.deposit_type,
        user: req.userId,
        status: 1,
        added_by: req.userId,
      });
      if (PatientDepositModal === null) {
        return res.json({ status: 0, message: langCommon.errormessage });
      } else {
        return res.json({
          status: 1,
          message: langPatientModule.payment.deposit.add,
          data: PatientDepositModal,
        });
      }
    } else if (req.body.deposit_type == "OrangeMoney") {
      return res.json({ status: 0, message: "Orange Money not integrated" });
    }
  } catch (error) {
    throw error;
  }
};
exports.getReceiptInvoicePayments = async (req, res) => {
  try {
    let data = {};
    // getData.push(req.params.invoice_id);
    SettingsModal = await Settings.findOne({ attributes: ["discount"] });
    PaymentModal = await Payment.findOne({
      where: { id: req.params.invoice_id },
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
            "phone",
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    SettingsModalAll = await Settings.findOne();
    OrganisationModal = await Organisation.findOne({
      attributes: ["path_logo", "nom", "entete", "footer", "signature"],
      where: { id: req.org_id },
    });
    /*OrganisationModal = await Organisation.findOne({where: { id: req.org_id} });*/
    data.discount_type = SettingsModal.discount;
    data.payment = PaymentModal;
    data.patient = await Patient.findOne({
      where: { id: PaymentModal.patient },
    });
    var str_array = PaymentModal.category_name.split(",");
    console.log(str_array);
    let items = [];
    for (var i = 0; i < str_array.length; i++) {
      // Trim the excess whitespace.
      items[i] = str_array[i]
        .replace(/^\s*/, "")
        .replace(/\s*$/, "")
        .split("*");
      // Add additional code here, such as:
      if (items[i][5] == "service") {
        Pycategory = await PaymentCategory.findOne({
          where: { id: items[i][0] },
        });
        items[i][0] = Pycategory.prestation;
      } else {
        Pycategory = await LabTest.findOne({ where: { id: items[i][0] } });
        items[i][0] = Pycategory.name;
      }
      let amount = items[i][1];
      items[i][1] = parseInt(amount).toFixed(1);

      items[i][3] = parseInt(amount) * parseInt(items[i][3]);
    }
    data.items = items;
    console.log(items);
    data.settings = SettingsModalAll;
    data.id_organisation = req.org_id;
    /*data.organisation = OrganisationModal;*/
    data.path_logo = OrganisationModal.path_logo
      ? BASEURL + "/" + OrganisationModal.path_logo
      : null;
    data.nom_organisation = OrganisationModal.nom;
    data.entete = OrganisationModal.entete
      ? BASEURL + "/" + OrganisationModal.entete
      : null;
    data.footer = OrganisationModal.footer
      ? BASEURL + "/" + OrganisationModal.footer
      : null;
    data.signature = OrganisationModal.signature
      ? BASEURL + "/" + OrganisationModal.signature
      : null;

    res.json({
      status: 1,
      message: langPatientModule.payment.paymentreceipt,
      data: data,
    });
  } catch (error) {
    throw error;
  }
};
exports.getServiceInvoicePayments = async (req, res) => {
  try {
    let getData = [];
    getData.push(req.org_id);
    ServiceCategoryModal = await ServiceCategory.findAll({
      attributes: ["id", "category", "montant", "amount", "id_organisation"],
      where: { id_organisation: req.org_id },
    });

    if (ServiceCategoryModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.payment.services,
        data: ServiceCategoryModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getPartnerOrgInvoicePayments = async (req, res) => {
  try {
    let getData = [];
    OrganisationModal = await Organisation.findAll({
      attributes: ["id", "nom"],
      where: { is_light: 0 },
    });
    if (OrganisationModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.payment.partnerorg,
        data: OrganisationModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getLightOrgInvoicePayments = async (req, res) => {
  try {
    let getData = [];
    OrganisationModal = await Organisation.findAll({
      attributes: ["id", "nom"],
      where: { is_light: 1 },
    });
    if (OrganisationModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.payment.lightorg,
        data: OrganisationModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
//getPaymentDetailsPriceGrids
exports.getPaymentDetailsPriceGrids = async (req, res) => {
  let data = {};
  data.labs = [];
  data.patient = await Patient.findOne({
    where: { id: req.params.patient_id },
  });
  SettingsModal = await Settings.findOne({ attributes: ["discount"] });
  data.discount_type = SettingsModal.discount;
  data.currentuser = await User.findOne({
    attributes: [
      "id",
      ["id_organisation", "org_id"],
      "first_name",
      "last_name",
      "username",
      "email",
    ],
    where: { id: req.userId },
  });
  data.mutuelles = await PatientMutuelle.findAll({
    attributes: [
      ["idpm", "id"],
      ["pm_idmutuelle", "payer_name"],
      "pm_idmutuelle",
      "pm_numpolice",
      "pm_charge",
      "pm_datevalid",
      "added_by",
      "updated_by",
      [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("PatientMutuelle.createdAt"),
          "%d-%m-%Y %H:%i:%s"
        ),
        "createdAt",
      ],
      [
        Sequelize.fn(
          "DATE_FORMAT",
          Sequelize.col("PatientMutuelle.updatedAt"),
          "%d-%m-%Y %H:%i:%s"
        ),
        "updatedAt",
      ],
    ],
    where: { pm_idpatent: req.params.patient_id, pm_status: 1 },
    order: [["id", "DESC"]],
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
        model: Organisation,
        attributes: ["id", "nom", "email", "adresse"],
        as: "org_details",
      },
      {
        model: Organisation,
        attributes: ["id", "nom", "email", "adresse"],
        as: "nom_mutuelle_details",
      },
    ],
  });
  data.mutuelles_relation = await Patient.findAll({
    where: { parent_id: req.params.patient_id },
  });
  data.mutuellesInit = [];
  data.lien_parente = "";
  data.mutuelles_relationInit = [];
  if (data.patient.parent_id) {
    data.mutuellesInit = await PatientMutuelle.findAll({
      attributes: [
        ["idpm", "id"],
        ["pm_idmutuelle", "payer_name"],
        "pm_idmutuelle",
        "pm_numpolice",
        "pm_charge",
        "pm_datevalid",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientMutuelle.createdAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientMutuelle.updatedAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "updatedAt",
        ],
      ],
      where: { pm_idpatent: data.patient.parent_id, pm_status: 1 },
      order: [["id", "DESC"]],
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
        {
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "nom_mutuelle_details",
        },
      ],
    });
    data.mutuelles_relationInit = await Patient.findAll({
      where: { id: data.patient.parent_id },
    });
    data.lien_parente = "Autres";
    if (data.patient.lien_parente == "Pere") {
      data.lien_parente = "Enfant";
    } else if (data.patient.lien_parente == "Mere") {
      data.lien_parente = "Enfant";
    } else if (data.patient.lien_parente == "Enfant") {
      data.lien_parente = "Parent";
    }
  }
  let bonus_clause = "";
  let bonus_select = "";
  let id_organisation = req.org_id;
  // console.log(Sequelize);
  data.services = await Database.query(
    "select payment_category.id, payment_category.prestation,payment_category_organisation.tarif_public, payment_category_organisation.tarif_professionnel, payment_category_organisation.tarif_assurance, payment_category_organisation.tarif_ipm, setting_service_specialite.name_specialite " +
      bonus_select +
      " from setting_service_specialite_organisation join setting_service_specialite on setting_service_specialite.idspe = setting_service_specialite_organisation.id_specialite and setting_service_specialite_organisation.statut = 1 join setting_service on setting_service_specialite_organisation.id_service = setting_service.idservice and setting_service_specialite_organisation.id_organisation = " +
      id_organisation +
      " and setting_service_specialite_organisation.statut = 1 join payment_category on payment_category.id_service = setting_service.idservice and payment_category.id_spe = setting_service_specialite_organisation.id_specialite join payment_category_organisation on payment_category_organisation.id_presta = payment_category.id and payment_category_organisation.id_organisation = setting_service_specialite_organisation.id_organisation " +
      bonus_clause +
      " order by payment_category.prestation asc",
    { type: Database.QueryTypes.SELECT }
  );
  data.labs = await LabTest.findAll({ where: { id_organisation: req.org_id } });
  //console.log(data.services);

  res.json({
    status: 1,
    message: langPatientModule.payment.paymentdetails,
    data: data,
  });
};

exports.getPaymentDetailsInvoicePayments = async (req, res) => {
  try {
    let data = {};
    data.labs = [];

    // Récupération des informations du patient
    data.patient = await Patient.findOne({
      where: { id: req.params.patient_id },
    });

    // Récupération des paramètres de réglages
    const SettingsModal = await Settings.findOne({ attributes: ["discount"] });
    data.discount_type = SettingsModal ? SettingsModal.discount : null;

    // Récupération des informations de l'utilisateur actuel
    data.currentuser = await User.findOne({
      attributes: [
        "id",
        ["id_organisation", "org_id"],
        "first_name",
        "last_name",
        "username",
        "email",
      ],
      where: { id: req.userId },
    });

    // Récupération des informations des mutuelles du patient
    data.mutuelles = await PatientMutuelle.findAll({
      attributes: [
        ["idpm", "id"],
        ["pm_idmutuelle", "payer_name"],
        "pm_idmutuelle",
        "pm_numpolice",
        "pm_charge",
        "pm_datevalid",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientMutuelle.createdAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientMutuelle.updatedAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "updatedAt",
        ],
      ],
      where: { pm_idpatent: req.params.patient_id, pm_status: 1 },
      order: [["id", "DESC"]],
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse", "type"],
          as: "org_details",
        },
        {
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse", "type"],
          as: "nom_mutuelle_details",
        },
      ],
    });

    // Détermination du type de l'organisation
    let organisationType = "PAF"; // Valeur par défaut
    if (data.mutuelles.length > 0) {
      organisationType = data.mutuelles[0].nom_mutuelle_details?.type || "PAF";
    }

    // Construction de la requête SQL en fonction du type d'organisation
    let query = "";
    const id_organisation = req.org_id;
    if (organisationType === "IPM") {
      query = `
        SELECT 
          pricegriddetails.productID AS id, 
          payment_category.prestation, 
          pricegriddetails.adjustedPrice AS tarif_public, 
          pricegrids.gridName, 
          setting_service_specialite.name_specialite 
        FROM 
          pricegriddetails 
        JOIN payment_category ON payment_category.id = pricegriddetails.productID 
        JOIN pricegrids ON pricegrids.gridID = pricegriddetails.gridID 
        JOIN setting_service_specialite ON setting_service_specialite.idspe = payment_category.id_spe 
        JOIN organisation ON organisation.id = pricegrids.organizationID 
        WHERE 
          pricegrids.gridName = 'IPM' 
          AND pricegrids.organizationID = ${id_organisation}`;
    } else if (organisationType === "Assurance") {
      query = `
        SELECT 
          pricegriddetails.productID AS id, 
          payment_category.prestation, 
          pricegriddetails.adjustedPrice AS tarif_public, 
          pricegrids.gridName, 
          setting_service_specialite.name_specialite 
        FROM 
          pricegriddetails 
        JOIN payment_category ON payment_category.id = pricegriddetails.productID 
        JOIN pricegrids ON pricegrids.gridID = pricegriddetails.gridID 
        JOIN setting_service_specialite ON setting_service_specialite.idspe = payment_category.id_spe 
        JOIN organisation ON organisation.id = pricegrids.organizationID 
        WHERE 
          pricegrids.gridName = 'Assurance' 
          AND pricegrids.organizationID = ${id_organisation}`;
    } else {
      query = `
        SELECT 
          pricegriddetails.productID AS id, 
          payment_category.prestation, 
          pricegriddetails.adjustedPrice AS tarif_public, 
          pricegrids.gridName, 
          setting_service_specialite.name_specialite 
        FROM 
          pricegriddetails 
        JOIN payment_category ON payment_category.id = pricegriddetails.productID 
        JOIN pricegrids ON pricegrids.gridID = pricegriddetails.gridID 
        JOIN setting_service_specialite ON setting_service_specialite.idspe = payment_category.id_spe 
        JOIN organisation ON organisation.id = pricegrids.organizationID 
        WHERE 
          pricegrids.organizationID = ${id_organisation} 
          AND organisation.pricing_category = pricegrids.gridID`;
    }

    // Exécution de la requête
    data.services = await Database.query(query, {
      type: Database.QueryTypes.SELECT,
    });

    // Récupération des tests de laboratoire
    data.labs = await LabTest.findAll({
      where: { id_organisation: req.org_id },
    });

    // Retour des données au format JSON
    res.json({
      status: 1,
      message: "Détails du paiement récupérés avec succès.",
      data: data,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du paiement :",
      error
    );
    res.status(500).json({
      status: 0,
      message:
        "Une erreur est survenue lors de la récupération des détails du paiement.",
      error: error.message,
    });
  }
};

exports.getPrestationPartner = async (req, res) => {
  try {
    let data = {};

    // Récupération des détails du partenaire
    const partnerId = req.params.partner_id; // Récupération de l'ID du partenaire depuis les paramètres
    console.log("📌 ID du partenaire :", partnerId);

    // Vérification si l'organisation existe
    const organisation = await Organisation.findOne({
      where: { id: partnerId },
      attributes: ["id", "nom", "email", "adresse", "pricing_category"],
    });

    if (!organisation) {
      return res.status(404).json({
        status: 0,
        message: "Organisation non trouvée.",
      });
    }

    console.log("🔍 Détails de l'organisation :", organisation);

    // Requête pour récupérer les prestations en fonction de la grille tarifaire
    const query = `
      select pricegriddetails.productID AS id,
payment_category.prestation,
pricegriddetails.adjustedPrice AS tarif_public,
pricegrids.gridName,
setting_service_specialite.name_specialite
from organisation join pricegrids on pricegrids.gridID = organisation.pricing_category
JOIN pricegriddetails ON  pricegriddetails.gridID = pricegrids.gridID 
JOIN payment_category ON payment_category.id = pricegriddetails.productID
JOIN setting_service_specialite ON setting_service_specialite.idspe = payment_category.id_spe
where organisation.id=${partnerId}`;

    console.log("📡 Exécution de la requête SQL :", query);

    // Exécution de la requête SQL
    data.services = await Database.query(query, {
      type: Database.QueryTypes.SELECT,
    });

    // Retourner la liste des prestations du partenaire
    return res.json({
      status: 1,
      message: "Prestations du partenaire récupérées avec succès.",
      data: data,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des prestations :", error);
    return res.status(500).json({
      status: 0,
      message:
        "Une erreur est survenue lors de la récupération des prestations.",
      error: error.message,
    });
  }
};

exports.addPayments = async (req, res) => {
  try {
    let getData = [],
      getRelationData = [],
      results,
      items = [];
    let amount_received = req.body.amount_received
      ? req.body.amount_received
      : 0;
    let services = req.body.services;
    ///  console.log(req);
    for (var i = 0; i < services.length; i++) {
      if (services[i].type == "service") {
        items[i] =
          services[i].id +
          "*" +
          services[i].amount +
          "*1*1*1*" +
          services[i].type;
      } else {
        items[i] =
          services[i].id +
          "*" +
          services[i].amount +
          "*" +
          services[i].name +
          "*1*1*" +
          services[i].type;
      }
    }

    PatientModal = await Patient.findOne({
      where: { id: req.body.patient_id },
    });
    PaymentModal = await Payment.create({
      category_name: items.join(","),
      category_name_pro: req.category_name_pro,
      patient: req.body.patient_id,
      date: moment().unix(),
      amount: req.body.total_amount,
      doctor: req.userId,
      service: "1",
      discount: req.body.discount,
      flat_discount: req.body.discount,
      gross_total: req.body.hospital_amount - req.body.discount,
      hospital_amount: req.body.hospital_amount,
      doctor_amount: req.body.doctor_amount,
      user: req.userId,
      patient_name: PatientModal.name + " " + PatientModal.last_name,
      patient_phone: PatientModal.phone,
      patient_address: PatientModal.address,
      doctor_name: "",
      date_string: moment().format("DD/MM/YYYY HH:mm"),
      id_organisation: req.org_id,
      remarks: req.body.remarks,
      charge_mutuelle: req.body.charge_mutuelle,
      etat: req.body.subcontractor,
      etatlight: req.body.subcontractor_light,
      organisation_destinataire: req.body.subcontractor_id,
      organisation_light_origin: req.body.subcontractor_light_id,
      prescripteur: req.userId,
      renseignementClinique: req.body.renseignementClinique,
      purpose: req.body.purpose,
      added_by: req.userId,
      frais_service: req.body.category.amount,
      bulletinAnalyse: "",
    });
    if (PaymentModal === null) {
      return res.json({ status: 0, message: langCommon.errormessage });
    } else {
      OrganisationModal = await Organisation.findOne({
        where: { id: req.org_id },
      });
      payments = await Payment.findAndCountAll({
        where: { id_organisation: req.org_id },
      });
      codeFacture = "ABC";
      if (
        req.body.subcontractor == "1" ||
        req.body.subcontractor_light == "1"
      ) {
        codeFacture =
          "CO" +
          (OrganisationModal ? OrganisationModal.code : "") +
          payments.count;
      } else {
        codeFacture =
          "F" +
          (OrganisationModal ? OrganisationModal.code : "") +
          payments.count;
      }

      PaymentUpdateCode = await Payment.update(
        { code: codeFacture },
        { where: { id: PaymentModal.id } }
      );

      if (amount_received > 0) {
        sub_total = req.body.hospital_amount - req.body.discount;
        statuspaid = "unpaid";
        rece = amount_received + req.body.discount + req.body.charge_mutuelle;
        if (rece >= PaymentModal.amount) {
          statuspaid = "paid";
        }
        PaymentUpdate = await Payment.update(
          {
            amount_received: amount_received,
            deposit_type: req.body.deposit_type,
            status: "new",
            status_paid: statuspaid,
          },
          { where: { id: PaymentModal.id } }
        );
      }

      PatientDepositModal = await PatientDeposit.create({
        date: moment().unix(),
        patient: req.body.patient_id,
        deposited_amount: req.body.amount_received,
        payment_id: PaymentModal.id,
        amount_received_id: null,
        deposit_type: "Cash",
        user: req.userId,
        id_organisation: req.org_id,
        status: 1,
        added_by: req.userId,
      });
      await PatientLogs.create({
        patient_id: PaymentModal.patient,
        org_id: req.org_id,
        description: "New Invoice has been Generated.",
        type: "payment",
        action: "add",
        relation_id: PaymentModal.id,
        status: 1,
        added_by: req.userId,
      });

      // Inclure l'ID du paiement dans la réponse
      res.json({
        status: 1,
        message: langPatientModule.payment.add,
        data: {
          paymentID: PaymentModal.id, // Ajouter l'ID du paiement ici
        },
      });
    }
  } catch (error) {
    throw error;
  }
};

// Dependants
exports.getDependants = async (req, res) => {
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
    const { count, rows } = await PatientRelation.findAndCountAll({
      where: { parent_id: req.params.patient_id },
    });
    PatientRelationModal = await PatientRelation.findAll({
      attributes: [
        "id",
        "parent_id",
        "relative_id",
        "relation_type",
        "org_id",
        "added_by",
        "updated_by",
        "createdAt",
        "updatedAt",
      ],
      where: { parent_id: req.params.patient_id },
      order: [["id", "DESC"]],
      limit: datalimit,
      offset: offsetdata,
      include: [
        {
          model: Patient,
          attributes: [
            "id",
            ["id_organisation", "org_id"],
            "name",
            "last_name",
            "email",
          ],
          as: "parent_details",
        },
        {
          model: Patient,
          attributes: [
            "id",
            ["id_organisation", "org_id"],
            "name",
            "last_name",
            "sex",
            "birthdate",
            "age",
            "phone",
            "email",
            "passport",
            "address",
            "region",
            "estCivil",
            "bloodgroup",
            "birth_position",
            "nom_contact",
            "phone_contact",
            "religion",
            "matricule",
            "grade",
            "country",
            "region",
            "district",
          ],
          as: "dependant_details",
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (PatientRelationModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.dependent.list,
        data: PatientRelationModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getDependantByID = async (req, res) => {
  try {
    let getData = [];
    PatientRelationModal = await PatientRelation.findOne({
      attributes: [
        "id",
        "parent_id",
        "relative_id",
        "relation_type",
        "org_id",
        "added_by",
        "updated_by",
        "createdAt",
        "updatedAt",
      ],
      where: { id: req.params.dependant_id },
      order: [["id", "DESC"]],
      include: [
        {
          model: Patient,
          attributes: [
            "id",
            ["id_organisation", "org_id"],
            "name",
            "last_name",
            "email",
          ],
          as: "parent_details",
        },
        {
          model: Patient,
          attributes: [
            "id",
            ["id_organisation", "org_id"],
            "name",
            "last_name",
            "sex",
            "birthdate",
            "age",
            "phone",
            "email",
            "passport",
            "address",
            "region",
            "estCivil",
            "bloodgroup",
            "birth_position",
            "nom_contact",
            "phone_contact",
            "religion",
            "matricule",
            "grade",
            "country",
            "region",
            "district",
          ],
          as: "dependant_details",
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (PatientRelationModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.dependent.individual,
        data: PatientRelationModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addDependant = async (req, res) => {
  try {
    let getRelationData = [],
      results;
    const { count, rows } = await Patient.findAndCountAll({
      where: { id_organisation: req.org_id },
    });
    PatientModal = await Patient.create({
      name: req.body.name,
      last_name: req.body.last_name,
      sex: req.body.sex,
      birthdate: moment(req.body.birthdate).format("DD/MM/YYYY"),
      age: req.body.age,
      phone: req.body.phone,
      email: req.body.email,
      passport: req.body.passport,
      country: req.body.country,
      region: req.body.region,
      district: req.body.district,
      address: req.body.address,
      estCivil: req.body.estCivil,
      bloodgroup: req.body.bloodgroup,
      birth_position: req.body.birth_position,
      nom_contact: req.body.nom_contact,
      phone_contact: req.body.phone_contact,
      religion: req.body.religion,
      matricule: req.body.matricule,
      grade: req.body.grade,
      parent_id: req.body.parent_id,
      added_by: req.userId,
      id_organisation: req.org_id,
      patient_id: req.org_id + (count + 1),
    });

    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      PatientRelationModal = await PatientRelation.create({
        parent_id: req.body.parent_id,
        relative_id: PatientModal.id,
        relation_type: req.body.relation_type,
        user_id: req.userId,
        added_by: req.userId,
        status: 1,
        created_date: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
      await PatientLogs.create({
        patient_id: PatientRelationModal.parent_id,
        org_id: req.org_id,
        description: "New Dependant has been Added.",
        type: "dependent",
        action: "add",
        relation_id: PatientRelationModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.dependent.add,
        data: { relational_details: PatientModal, data: PatientRelationModal },
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateDependant = async (req, res) => {
  try {
    let getData = [],
      results,
      patientID;
    console.log(req.params.id);
    PatientRelationModal = await PatientRelation.findOne({
      where: { id: req.params.id },
    });
    // console.log(PatientRelationModal);
    if (PatientRelationModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      PatientRelationupdate = await PatientRelation.update(
        { relation_type: req.body.relation_type, updated_by: req.userId },
        { where: { id: req.params.id } }
      );

      PatientModal = await Patient.update(
        {
          name: req.body.name,
          last_name: req.body.last_name,
          sex: req.body.sex,
          birthdate: moment(req.body.birthdate).format("DD/MM/YYYY"),
          age: req.body.age,
          phone: req.body.phone,
          email: req.body.email,
          passport: req.body.passport,
          country: req.body.country,
          region: req.body.region,
          district: req.body.district,
          address: req.body.address,
          estCivil: req.body.estCivil,
          bloodgroup: req.body.bloodgroup,
          birth_position: req.body.birth_position,
          nom_contact: req.body.nom_contact,
          phone_contact: req.body.phone_contact,
          religion: req.body.religion,
          matricule: req.body.matricule,
          grade: req.body.grade,
          added_by: req.userId,
        },
        {
          where: { id: PatientRelationModal.relative_id },
        }
      );
      await PatientLogs.create({
        patient_id: PatientRelationModal.parent_id,
        org_id: req.org_id,
        description: "Dependent has been Updated.",
        type: "dependent",
        action: "update",
        relation_id: PatientRelationModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.dependent.update,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.deleteDependant = async (req, res) => {
  try {
    let getData = [],
      results;
    getData.push(req.params.id);
    PatientRelationModal = await PatientRelation.findOne({
      where: { id: req.params.id },
    });
    if (PatientRelationModal === null) {
      PatientRelationModal = await PatientRelation.destroy({
        where: { id: req.params.id },
      });
      PatientModal = await Patient.destroy({
        where: { id: PatientRelationModal.relative_id },
      });
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.dependent.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Assurance
exports.getAssurance = async (req, res) => {
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
    const { count, rows } = await PatientMutuelle.findAndCountAll({
      where: { pm_idpatent: req.params.patient_id },
    });
    PatientMutuelleModal = await PatientMutuelle.findAll({
      attributes: [
        ["idpm", "id"],
        ["pm_idmutuelle", "payer_name"],
        "pm_idmutuelle",
        "pm_numpolice",
        "pm_charge",
        "pm_datevalid",
        "validity_date",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientMutuelle.createdAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientMutuelle.updatedAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "updatedAt",
        ],
      ],
      where: { pm_idpatent: req.params.patient_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse", "type"],
          as: "org_details",
        },
        {
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse", "type"],
          as: "nom_mutuelle_details",
        },
      ],
    });
    if (PatientMutuelleModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.assurance.list,
        data: PatientMutuelleModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getAssuranceByID = async (req, res) => {
  try {
    let getData = [];
    getData.push(req.params.assurance_id);
    console.log("parametre id assurance", req.params.assurance_id);
    // PatientRelationModal = await PatientRelation.findAll({where: {id: req.params.id}});
    PatientMutuelleModal = await PatientMutuelle.findOne({
      attributes: [
        ["idpm", "id"],
        ["pm_idmutuelle", "payer_name"],
        "pm_idmutuelle",
        "pm_numpolice",
        "pm_charge",
        "pm_datevalid",
        "validity_date",
      ],
      where: { idpm: req.params.assurance_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse", "type"],
          as: "org_details",
        },
        {
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse", "type"],
          as: "nom_mutuelle_details",
        },
      ],
    });
    if (PatientMutuelleModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.assurance.individual,
        data: PatientMutuelleModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getAssuranceOrg = async (req, res) => {
  try {
    let getData = [];
    OrganisationModal = await Database.query(
      "SELECT o.id,o.nom FROM partenariat_sante_assurance as psa INNER JOIN organisation as o ON psa.id_organisation_assurance = o.id where id_organisation_sante =" +
        req.org_id +
        " and (o.type = 'ASSURANCE' OR o.type = 'IPM');",
      { type: Database.QueryTypes.SELECT }
    );
    if (OrganisationModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.assurance.orglist,
        data: OrganisationModal,
      });
    }

    // OrganisationModal = await Organisation.findAll({
    //   attributes: ["id", "nom"],
    //   where: {
    //     org_id: req.org_id,
    //     [Op.or]: [{ type: "ASSURANCE" }, { type: "IPM" }],
    //   },
    // });
    // if (OrganisationModal === null) {
    //   res.json({ status: 0, message: langCommon.nodatafound });
    // } else {
    //   res.json({
    //     status: 1,
    //     message: langPatientModule.assurance.orglist,
    //     data: OrganisationModal,
    //   });
    // }
  } catch (error) {
    throw error;
  }
};
exports.addAssurance = async (req, res) => {
  try {
    let getData = [],
      results;

    PatientMutuelleModal = await PatientMutuelle.create({
      pm_idpatent: req.body.patient_id,
      id_organisation: req.org_id,
      pm_idmutuelle: req.body.nom_mutuelle,
      pm_numpolice: req.body.num_police,
      pm_charge: req.body.charge_mutuelle,
      pm_datevalid: moment(req.body.date_valid).format("DD/MM/YYYY"),
      validity_date: moment(req.body.date_valid).format("YYYY-MM-DD"),
      pm_status: 1,
      added_by: req.userId,
    });
    if (PatientMutuelleModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: PatientMutuelleModal.pm_idpatent,
        org_id: req.org_id,
        description: "New Assurance has been Added.",
        type: "assurance",
        action: "add",
        relation_id: PatientMutuelleModal.idpm,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.assurance.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateAssurance = async (req, res) => {
  try {
    let results;
    console.log("req params orgs id " + req.params.org_id);
    // Mise à jour de l'assurance
    const PatientMutuelleModal = await PatientMutuelle.update(
      {
        pm_idmutuelle: req.body.nom_mutuelle,
        pm_numpolice: req.body.num_police,
        pm_charge: req.body.charge_mutuelle,
        pm_datevalid: moment(req.body.date_valid).format("DD/MM/YYYY"),
        validity_date: moment(req.body.date_valid).format("YYYY-MM-DD"),
        updated_by: req.userId,
      },
      { where: { idpm: req.params.id } }
    );

    if (!PatientMutuelleModal) {
      return res
        .status(400)
        .json({ status: 0, message: langCommon.errormessage });
    }

    // Récupérer les détails de l'assurance mise à jour
    const AssuranceD = await PatientMutuelle.findOne({
      where: { idpm: req.params.id },
    });

    if (!AssuranceD) {
      return res
        .status(404)
        .json({ status: 0, message: "Assurance non trouvée" });
    }

    // Créer un log dans PatientLogs
    await PatientLogs.create({
      patient_id: AssuranceD.pm_idpatent,
      org_id: req.params.org_id, // Assurez-vous que req.org_id est défini
      description: "Assurance has been Updated.",
      type: "assurance",
      action: "update",
      relation_id: AssuranceD.idpm,
      status: 1,
      added_by: req.userId,
    });

    return res.json({
      status: 1,
      message: langPatientModule.assurance.update,
      data: "",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    return res.status(500).json({ status: 0, message: "Erreur serveur" });
  }
};

exports.deleteAssurance = async (req, res) => {
  try {
    let getData = [],
      results;
    getData.push(req.params.id);
    PatientMutuelleModal = await PatientMutuelle.findOne({
      where: { idpm: req.params.id },
    });
    if (PatientMutuelleModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.assurance.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Attachments
exports.getAttachments = async (req, res) => {
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
      req.query.limit
        ? req.query.limit == undefined || req.query.limit == 1
          ? 5
          : req.query.limit
        : 5
    );
    if (isNaN(datalimit)) {
      datalimit = 5;
    }
    const { count, rows } = await PatientMaterial.findAndCountAll({
      where: { patient: req.params.patient_id },
    });
    PatientMaterialModal = await PatientMaterial.findAll({
      attributes: [
        "id",
        "title",
        [
          Sequelize.fn(
            "CONCAT",
            BASEURL + "/uploads/documentsPatient/",
            Sequelize.col(`url`)
          ),
          "url",
        ],
        "category",
        "prescriber",
        "id_organisation",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientMaterial.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientMaterial.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: { patient: req.params.patient_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
        {
          model: DocumentTypes,
          attributes: ["id", "name"],
          as: "doctypes_details",
        },
      ],
    });
    if (PatientMaterialModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.documents.list,
        data: PatientMaterialModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getAttachmentsByID = async (req, res) => {
  try {
    PatientMaterialModal = await PatientMaterial.findOne({
      attributes: [
        "id",
        "title",
        [
          Sequelize.fn(
            "CONCAT",
            BASEURL + "/uploads/documentsPatient/",
            Sequelize.col(`url`)
          ),
          "url",
        ],
        "prescriber",
        "date",
      ],
      where: { id: req.params.attachment_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
        {
          model: DocumentTypes,
          attributes: ["id", "name"],
          as: "doctypes_details",
        },
      ],
    });
    if (PatientMaterialModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.documents.list,
        data: PatientMaterialModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getAttachmentsTypes = async (req, res) => {
  try {
    let getData = [];
    // getData.push(req.params.patient_id);
    DocumentTypesModal = await DocumentTypes.findAll({
      attributes: ["id", "name"],
      where: { status: 1 },
    });
    if (DocumentTypesModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.documents.typelist,
        data: DocumentTypesModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addAttachments = async (req, res) => {
  if (Object.keys(req.files).length == 0) {
    res.json({
      status: 0,
      message: langPatientModule.documents.missingattachment,
    });
  }
  try {
    let Data = [],
      results;
    PatientModal = await Patient.findOne({
      attributes: [
        "id",
        "unique_id",
        "name",
        "last_name",
        ["sex", "gender"],
        "age",
        "email",
        "phone",
        "address",
        "region",
        ["registration_time", "register"],
        "grade",
        "estCivil",
        "passport",
        "matricule",
        ["bloodgroup", "blood_type"],
        "birthdate",
        ["birth_position", "birth_place"],
        "religion",
      ],
      where: { id: req.body.uniqueID },
    });

    PatientMaterialModal = await PatientMaterial.create({
      id_organisation: req.org_id,
      date: moment().unix(),
      title: req.body.title,
      prescriber: req.body.prescriber,
      category: req.body.category,
      patient: req.body.uniqueID,
      patient_name: PatientModal.name + " " + PatientModal.last_name,
      patient_address: PatientModal.address,
      patient_phone: PatientModal.phone,
      url: req.files.document[0].filename,
      added_by: req.userId,
      status: 1,
      date_string: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
    if (PatientMaterialModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: PatientMaterialModal.patient,
        org_id: req.org_id,
        description: "New Document has been uploaded.",
        type: "documents",
        action: "add",
        relation_id: PatientMaterialModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.documents.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateAttachments = async (req, res) => {
  try {
    let getData = [],
      results;
    getData.push(req.orgId);
    getData.push(req.body.date);
    getData.push(req.body.title);
    getData.push(req.body.category);
    getData.push(req.body.uniqueID);
    getData.push(req.body.patient_name);
    getData.push(req.body.patient_address);
    getData.push(req.body.patient_phone);
    getData.push(req.files.document[0].filename);
    getData.push(req.body.date_string);
    results = await patients.updateAttachment(getData);

    if (results) {
      res.json({
        status: 1,
        message: langPatientModule.documents.update,
        data: "",
      });
    } else {
      res.json({ status: 0, message: langCommon.errormessage });
    }
  } catch (error) {
    throw error;
  }
};
exports.deleteAttachments = async (req, res) => {
  try {
    let getData = [],
      results;
    getData.push(req.params.id);
    PatientMaterialModal = await PatientMaterial.findOne({
      where: { id: req.params.id },
    });
    if (PatientMaterialModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      fs.unlinkSync(
        BASEPATH + "uploads/documentsPatient/" + PatientMaterialModal.url
      );
      PatientMaterialModal = await PatientMaterial.destroy({
        where: { id: req.params.id },
      });
      res.json({
        status: 1,
        message: langPatientModule.documents.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Vital Sign
exports.getVitalSign = async (req, res) => {
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
    const { count, rows } = await VitalSign.findAndCountAll({
      where: { patient: req.params.patient_id },
    });

    VitalSignModal = await VitalSign.findAll({
      attributes: [
        "id",
        "date_string",
        ["frequenceRespiratoire", "respiratory_rate"],
        ["frequenceCardiaque", "heart_rate"],
        ["saturationArterielle", "stauration_en_o2"],
        "temperature",
        "systolique",
        "diastolique",
        ["tensionArterielle", "blood_pressure"],
        "weight",
        "blood_sugar",
        "height",
        "body_mass_index",
        "id_organisation",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: { patient: req.params.patient_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (VitalSignModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.vital_sign.list,
        data: VitalSignModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getVitalSignGraph = async (req, res) => {
  try {
    let getData = {};

    let offsetdata = parseInt(req.query.offset ? req.query.offset : 0);
    //  console.log(typeof offsetdata);
    getData.respiratory_rate = await VitalSign.findAll({
      attributes: [
        "id",
        ["frequenceRespiratoire", "respiratory_rate"],
        "id_organisation",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: {
        patient: req.params.patient_id,
        frequenceRespiratoire: { [Op.and]: { [Op.not]: null, [Op.not]: "" } },
      },
      order: [["id", "DESC"]],
      limit: 5,
      offset: offsetdata,
    });
    getData.heart_rate = await VitalSign.findAll({
      attributes: [
        "id",
        ["frequenceCardiaque", "heart_rate"],
        "id_organisation",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: {
        patient: req.params.patient_id,
        frequenceCardiaque: { [Op.or]: { [Op.not]: null, [Op.not]: "" } },
      },
      order: [["id", "DESC"]],
      limit: 5,
      offset: offsetdata,
    });
    getData.stauration_en_o2 = await VitalSign.findAll({
      attributes: [
        "id",
        ["saturationArterielle", "stauration_en_o2"],
        "id_organisation",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: {
        patient: req.params.patient_id,
        saturationArterielle: { [Op.or]: { [Op.not]: null, [Op.not]: "" } },
      },
      order: [["id", "DESC"]],
      limit: 5,
      offset: offsetdata,
    });
    getData.temperature = await VitalSign.findAll({
      attributes: [
        "id",
        "temperature",
        "id_organisation",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: {
        patient: req.params.patient_id,
        temperature: { [Op.and]: { [Op.not]: null, [Op.not]: "" } },
      },
      order: [["id", "DESC"]],
      limit: 5,
      offset: offsetdata,
    });
    getData.blood_pressure = await VitalSign.findAll({
      attributes: [
        "id",
        "systolique",
        "diastolique",
        ["tensionArterielle", "blood_pressure"],
        "id_organisation",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("VitalSign.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: {
        patient: req.params.patient_id,
        systolique: { [Op.and]: { [Op.not]: null, [Op.not]: "" } },
        diastolique: { [Op.or]: { [Op.not]: null, [Op.not]: "" } },
      },
      order: [["id", "DESC"]],
      limit: 5,
      offset: offsetdata,
    });

    res.json({
      status: 1,
      message: langPatientModule.vital_sign.graph,
      data: getData,
    });
  } catch (error) {
    throw error;
  }
};
exports.getVitalSignByID = async (req, res) => {
  try {
    let getData = [];

    VitalSignModal = await VitalSign.findOne({
      attributes: [
        "id",
        "date_string",
        ["frequenceRespiratoire", "respiratory_rate"],
        ["frequenceCardiaque", "heart_rate"],
        ["saturationArterielle", "stauration_en_o2"],
        "temperature",
        "systolique",
        "diastolique",
        ["tensionArterielle", "blood_pressure"],
        "weight",
        "blood_sugar",
        "height",
        "body_mass_index",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("createdAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "createdAt",
        ],
      ],
      where: { id: req.params.vital_id },
    });
    if (VitalSignModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.vital_sign.individual,
        data: VitalSignModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addVitalSign = async (req, res) => {
  try {
    let getData = [],
      results;

    VitalSignModal = await VitalSign.create({
      patient: req.body.uniqueID,
      id_organisation: req.org_id,
      prescripteur: req.body.prescripteur,
      frequenceRespiratoire: req.body.frequenceRespiratoire,
      frequenceCardiaque: req.body.frequenceCardiaque,
      saturationArterielle: req.body.saturationArterielle,
      temperature: req.body.temperature,
      systolique: req.body.systolique,
      diastolique: req.body.diastolique,
      tensionArterielle: req.body.tensionArterielle,
      weight: req.body.weight,
      blood_sugar: req.body.blood_sugar,
      height: req.body.height,
      body_mass_index: req.body.body_mass_index,
      ion_user_id: req.userId, //loggedin id
      add_date: moment(req.body.add_date).format("YYYY-MM-DD"),
      patient_name: "",
      patient_address: "",
      patient_phone: "",
      date_string: moment().format("DD-MM-YYYY"),
      date: moment().unix(),
      added_by: req.userId,
      status: 1,
    });
    if (VitalSignModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: VitalSignModal.patient,
        org_id: req.org_id,
        description: "New Vital Sign has been Added.",
        type: "vital_sign",
        action: "add",
        relation_id: VitalSignModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.vital_sign.add,
        data: VitalSignModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateVitalSign = async (req, res) => {
  //   try {
  //     let getData = [], results;
  //     getData.push(req.body.uniqueID);
  //     getData.push(req.orgId);
  //     getData.push(req.body.prescripteur);
  //     getData.push(req.body.frequenceRespiratoire);
  //     getData.push(req.body.frequenceCardiaque);
  //     getData.push(req.body.saturationArterielle);
  //     getData.push(req.body.temperature);
  //     getData.push(req.body.systolique);
  //     getData.push(req.body.diastolique);
  //     getData.push(req.body.tensionArterielle);
  //     getData.push(req.userId);///loggedin id
  //     getData.push(req.body.add_date);
  //     getData.push(req.body.patient_name);
  //     getData.push(req.body.patient_address);
  //     getData.push(req.body.patient_phone);
  //     getData.push(req.body.date_string);
  //     getData.push(req.body.date);
  //         results = await patients.UpdateVitalSign(getData);
  //         if (results) {
  //             res.json({ status: 1, message: langPatientModule.vital_sign.update, data: '' });
  //         } else {
  //             res.json({ status: 0, message: langCommon.errormessage });
  //         }
  //   } catch (error) {
  //       throw error;
  //   }
};
exports.deleteVitalSign = async (req, res) => {
  try {
    let getData = [],
      results;
    getData.push(req.params.id);
    VitalSignModal = await VitalSign.destroy({ where: { id: req.params.id } });
    if (VitalSignModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.vital_sign.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Medications
exports.getCurrentMedication = async (req, res) => {
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
    const { count, rows } = await CurrentMedications.findAndCountAll({
      where: { patient_id: req.params.patient_id },
    });
    CurrentMedicationsModal = await CurrentMedications.findAll({
      attributes: [
        "id",
        "patient_id",
        "doctor_id",
        "content",
        "date_time",
        "status",
        "added_by",
        "updated_by",
        "org_id",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("CurrentMedications.createdAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("CurrentMedications.updatedAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "updatedAt",
        ],
      ],
      where: { patient_id: req.params.patient_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (CurrentMedicationsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.current_medication.list,
        data: CurrentMedicationsModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getCurrentMedicationByID = async (req, res) => {
  try {
    let getData = [],
      results;
    CurrentMedicationsModal = await CurrentMedications.findOne({
      where: { id: req.params.medication_id },
    });
    if (CurrentMedicationsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.current_medication.individual,
        data: CurrentMedicationsModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addCurrentMedication = async (req, res) => {
  try {
    let getData = [],
      results;
    CurrentMedicationsModal = await CurrentMedications.create({
      patient_id: req.body.patient_id,
      doctor_id: req.body.doctor_id,
      content: req.body.content,
      added_by: req.userId,
      org_id: req.org_id,
      status: 1,
    });
    if (CurrentMedicationsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: CurrentMedicationsModal.patient_id,
        org_id: req.org_id,
        description: "New Medication has been Added.",
        type: "current_medication",
        action: "add",
        relation_id: CurrentMedicationsModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.current_medication.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateCurrentMedication = async (req, res) => {
  try {
    let getData = [],
      results;
    //getData.push(req.body.content);
    //getData.push(req.params.id);

    CurrentMedicationsModal = await CurrentMedications.update(
      { content: req.body.content, updated_by: req.userId },
      { where: { id: req.params.id } }
    );
    if (CurrentMedicationsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: CurrentMedicationsModal.patient_id,
        org_id: req.org_id,
        description: "Patient Current Medication has been updated",
        type: "current_medication",
        action: "update",
        relation_id: CurrentMedicationsModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.current_medication.update,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.deleteCurrentMedication = async (req, res) => {
  try {
    let getData = [],
      results;
    CurrentMedicationsModal = await CurrentMedications.destroy({
      where: { id: req.params.id },
    });
    if (CurrentMedicationsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.current_medication.delete,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Known Health issues
exports.getKnownHealthIssues = async (req, res) => {
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
    const { count, rows } = await PreConditions.findAndCountAll({
      where: { patient_id: req.params.patient_id },
    });

    PreConditionsModal = await PreConditions.findAll({
      attributes: [
        "id",
        "patient_id",
        "doctor_id",
        "type_id",
        "issue_id",
        "content",
        "date_time",
        "status",
        "added_by",
        "updated_by",
        "org_id",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PreConditions.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PreConditions.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: { patient_id: req.params.patient_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
        {
          model: HealthIssueType,
          attributes: ["id", "name", "code"],
          as: "type_details",
        },
        {
          model: HealthIssue,
          attributes: ["id", "name", "type_id"],
          as: "issue_details",
        },
      ],
    });
    if (PreConditionsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.know_health_issue.list,
        data: PreConditionsModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getKnownHealthIssuesByID = async (req, res) => {
  try {
    let getData = [],
      results;
    PreConditionsModal = await PreConditions.findOne({
      attributes: [
        "id",
        "patient_id",
        "type_id",
        "issue_id",
        "doctor_id",
        "content",
        "date_time",
        "status",
        "added_by",
        "updated_by",
        "org_id",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PreConditions.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PreConditions.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: { id: req.params.pre_condition_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
        {
          model: HealthIssueType,
          attributes: ["id", "name", "code"],
          as: "type_details",
        },
        {
          model: HealthIssue,
          attributes: ["id", "name", "type_id"],
          as: "issue_details",
        },
      ],
    });
    if (PreConditionsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.know_health_issue.individual,
        data: PreConditionsModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addKnownHealthIssues = async (req, res) => {
  try {
    let getData = [],
      results;

    PreConditionsModal = await PreConditions.create({
      patient_id: req.body.patient_id,
      doctor_id: req.body.doctor_id,
      content: req.body.content,
      type_id: req.body.type_id,
      issue_id: req.body.issue_id,
      added_by: req.userId,
      org_id: req.org_id,
      status: 1,
    });
    if (PreConditionsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: PreConditionsModal.patient_id,
        org_id: req.org_id,
        description: "Patient Know health issue has been added",
        type: "know_health_issue",
        action: "add",
        relation_id: PreConditionsModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.know_health_issue.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateKnownHealthIssues = async (req, res) => {
  try {
    PreConditionData = await PreConditions.findOne({
      where: { id: req.params.id },
    });
    PreConditionsModal = await PreConditions.update(
      {
        type_id: req.body.type_id,
        issue_id: req.body.issue_id,
        content: req.body.content,
        title: req.body.title,
        updated_by: req.userId,
      },
      { where: { id: req.params.id } }
    );
    if (PreConditionsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: PreConditionData.patient_id,
        org_id: req.org_id,
        description: "Patient Know health issue has been updated",
        type: "know_health_issue",
        action: "update",
        relation_id: PreConditionData.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.know_health_issue.update,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.deleteKnownHealthIssues = async (req, res) => {
  try {
    let getData = [],
      results;
    PreConditionsModal = await PreConditions.destroy({
      where: { id: req.params.id },
    });
    if (PreConditionsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.know_health_issue.delete,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getHealthIssueTypes = async (req, res) => {
  try {
    HealthIssueTypeModal = await HealthIssueType.findAll({
      attributes: [
        "id",
        "name",
        "code",
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
      order: [["id", "ASC"]],
      where: { status: 1 },
    });
    if (HealthIssueTypeModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.know_health_issue.HealthIssueTypes,
        data: HealthIssueTypeModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getHealthIssueByType = async (req, res) => {
  try {
    HealthIssueModal = await HealthIssue.findAll({
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
      where: { type_id: req.params.type_id },
    });
    if (HealthIssueModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.know_health_issue.HealthIssues,
        data: HealthIssueModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

// Confidential Notes
exports.getConfidentialNotes = async (req, res) => {
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
    const { count, rows } = await ConfidentialNotes.findAndCountAll({
      where: { patient_id: req.params.patient_id },
    });

    const ConfidentialNotesModal = await ConfidentialNotes.findAll({
      // attributes: ['id', 'description','type','relation_id', 'status','added_by','updated_by',[Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"),"%d-%m-%Y %H:%i:%s"),"createdAt"],[Sequelize.fn("DATE_FORMAT", Sequelize.col("updatedAt"),"%d-%m-%Y %H:%i:%s"),"updatedAt"],'patient_id','org_id'],
      where: { patient_id: req.params.patient_id },
      order: [["id", "desc"]],
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });

    if (ConfidentialNotesModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.confidentialnotes.list,
        data: ConfidentialNotesModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getConfidentialNotesByID = async (req, res) => {
  try {
    let getData = [],
      results;
    ConfidentialNotesModal = await ConfidentialNotes.findOne({
      where: { id: req.params.confidential_notes_id },
    });
    if (ConfidentialNotesModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.confidentialnotes.individual,
        data: ConfidentialNotesModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addConfidentialNotes = async (req, res) => {
  try {
    let getData = [],
      results;

    ConfidentialNotesModal = await ConfidentialNotes.create({
      patient_id: req.body.patient_id,
      doctor_id: req.userId,
      note: req.body.content,
      added_by: req.userId,
      org_id: req.org_id,
      status: 1,
    });
    if (ConfidentialNotesModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.confidentialnotes.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateConfidentialNotes = async (req, res) => {
  try {
    let getData = [],
      results;
    ConfidentialNotesModal = await ConfidentialNotes.update(
      { note: req.body.content, updated_by: req.userId },
      { where: { id: req.params.id } }
    );
    if (ConfidentialNotesModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.confidentialnotes.update,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.deleteConfidentialNotes = async (req, res) => {
  try {
    let getData = [],
      results;
    ConfidentialNotesModal = await ConfidentialNotes.destroy({
      where: { id: req.params.id },
    });
    if (ConfidentialNotesModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.confidentialnotes.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Clinical Notes
exports.getClinicalNotes = async (req, res) => {
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
    const { count, rows } = await ClinicalNotes.findAndCountAll({
      where: { patient_id: req.params.patient_id },
    });
    ClinicalNotesModal = await ClinicalNotes.findAll({
      attributes: [
        "id",
        "patient_id",
        "org_id",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ClinicalNotes.date_time"),
            "%d/%m/%Y %H:%i"
          ),
          "date_time",
        ],
        "channel",
        "motive",
        "known_health_issues",
        "consultation",
        "desease",
        "desease_history",
        "diagnostic",
        "treatment",
        "observation",
        "documents",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ClinicalNotes.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ClinicalNotes.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
        "nosologie",
      ],
      where: { patient_id: req.params.patient_id },
      order: [["id", "desc"]],
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (ClinicalNotesModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.clinical_notes.list,
        data: ClinicalNotesModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getClinicalNotesByID = async (req, res) => {
  try {
    let getData = [],
      results;
    ClinicalNotesModal = await ClinicalNotes.findOne({
      attributes: [
        "id",
        "patient_id",
        "org_id",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ClinicalNotes.date_time"),
            "%d/%m/%Y %H:%i"
          ),
          "date_time",
        ],
        "channel",
        "motive",
        "known_health_issues",
        "consultation",
        "desease",
        "desease_history",
        "diagnostic",
        "treatment",
        "observation",
        "documents",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ClinicalNotes.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ClinicalNotes.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
        "nosologie",
      ],
      where: { id: req.params.clinical_note_id },
    });
    if (ClinicalNotesModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.clinical_notes.individual,
        data: ClinicalNotesModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addClinicalNotes = async (req, res) => {
  try {
    const {
      patient_id: patientID,
      clinical_notes: clinicalNotesData,
      appointment: appointmentData,
      vital_sign: vitalSignData,
      lab: labData,
      imaging: imagingData,
      prescription: prescriptionData,
      hospitalization: hospitalizationData,
    } = req.body;

    // Retrieve patient data
    const PatientModal = await Patient.findOne({ where: { id: patientID } });
    if (!PatientModal) {
      return res.json({ status: 0, message: "Patient not found" });
    }

    // Prepare motive array
    const motiveArray = Array.isArray(clinicalNotesData.motive)
      ? clinicalNotesData.motive
      : [];
    const motiveArrayString = motiveArray.join(", ");

    // Create clinical notes
    const ClinicalNotesModal = await ClinicalNotes.create({
      patient_id: patientID,
      org_id: req.org_id,
      date_time: clinicalNotesData.date_time,
      channel: clinicalNotesData.channel,
      motive: motiveArrayString,
      known_health_issues: clinicalNotesData.known_health_issues,
      desease_history: clinicalNotesData.desease_history,
      consultation: clinicalNotesData.consultation,
      diagnostic: clinicalNotesData.diagnostic,
      treatment: clinicalNotesData.treatment,
      observation: clinicalNotesData.observation,
      desease: clinicalNotesData.desease,
      nosologie: clinicalNotesData.nosologie,
      status: 1,
      added_by: req.userId,
    });

    // Add DCI and nosology diseases
    if (clinicalNotesData.desease) {
      clinicalNotesData.desease.forEach(async (desease) => {
        await ClinicalDesease.create({
          patient_id: patientID,
          org_id: req.org_id,
          clinical_id: ClinicalNotesModal.id,
          disease_id: desease.id,
          name: desease.desease_name,
          type: "dci",
          status: 1,
          added_by: req.userId,
        });
      });
    }

    if (clinicalNotesData.nosologie) {
      clinicalNotesData.nosologie.forEach(async (desease) => {
        await ClinicalDesease.create({
          patient_id: patientID,
          org_id: req.org_id,
          clinical_id: ClinicalNotesModal.id,
          disease_id: desease.id,
          name: desease.desease_name,
          type: "nosologie",
          status: 1,
          added_by: req.userId,
        });
      });
    }

    // Handle appointments
    if (appointmentData) {
      const roomID = `teleconsultation_ecomed24-${
        PatientModal.phone
      }-${Math.floor(Math.random() * 444444 + 1000000)}`;
      const liveMeetingLink = `https://teleconsultation.ecomed24.com/${roomID}`;

      const AppointmentModal = await Appointment.create({
        patient: patientID,
        clinical_id: ClinicalNotesModal.id,
        code: appointmentData.code,
        id_organisation: req.org_id,
        doctor: appointmentData.doctor,
        date: moment(appointmentData.date).unix(),
        time_slot: appointmentData.time_slot,
        s_time: appointmentData.s_time,
        e_time: appointmentData.e_time,
        remarks: appointmentData.remarks,
        add_date: moment().format("MM/DD/YYYY"),
        registration_time: moment().unix(),
        s_time_key: appointmentData.s_time_key,
        status: appointmentData.status,
        user: req.userId,
        request: appointmentData.request,
        patientname: appointmentData.patientname,
        doctorname: appointmentData.doctorname,
        service: appointmentData.service,
        servicename: appointmentData.servicename,
        room_id: roomID,
        live_meeting_link: liveMeetingLink,
        appointment_date: moment(appointmentData.date).format("YYYY-MM-DD"),
        tele_consultation: appointmentData.tele_consultation == 1 ? 1 : 0,
        added_by: req.userId,
      });

      await PatientLogs.create({
        patient_id: AppointmentModal.patient,
        org_id: req.org_id,
        description: "New Appointment has been generated.",
        type: "appointment",
        action: "add",
        relation_id: AppointmentModal.id,
        status: 1,
        added_by: req.userId,
      });
    }

    // Handle Vital Signs
    if (vitalSignData) {
      const VitalSignModal = await VitalSign.create({
        patient: patientID,
        clinical_id: ClinicalNotesModal.id,
        id_organisation: req.org_id,
        prescripteur: vitalSignData.prescripteur,
        frequenceRespiratoire: vitalSignData.frequenceRespiratoire,
        frequenceCardiaque: vitalSignData.frequenceCardiaque,
        saturationArterielle: vitalSignData.saturationArterielle,
        temperature: vitalSignData.temperature,
        systolique: vitalSignData.systolique,
        diastolique: vitalSignData.diastolique,
        tensionArterielle: vitalSignData.tensionArterielle,
        weight: vitalSignData.weight,
        blood_sugar: vitalSignData.blood_sugar,
        height: vitalSignData.height,
        body_mass_index: vitalSignData.body_mass_index,
        ion_user_id: req.userId,
        add_date: moment(vitalSignData.add_date).format("YYYY-MM-DD"),
        patient_name: "",
        patient_address: "",
        patient_phone: "",
        date_string: moment().format("DD-MM-YYYY"),
        date: moment().unix(),
        added_by: req.userId,
        status: 1,
      });

      await PatientLogs.create({
        patient_id: VitalSignModal.patient,
        org_id: req.org_id,
        description: "New Vital Sign has been added.",
        type: "vital_sign",
        action: "add",
        relation_id: VitalSignModal.id,
        status: 1,
        added_by: req.userId,
      });
    }

    // Handle Lab and Imaging Data
    const handleLabOrImagingData = async (data, type) => {
      if (!data) return;

      const TestRequestsModal = await TestRequests.create({
        patient_id: patientID,
        clinical_id: ClinicalNotesModal.id,
        org_id: req.org_id,
        type: type,
        advice: req.body.advice,
        reports: data.reports,
        status: 0,
        added_by: req.userId,
      });

      const reports = data.reports;
      reports.forEach(async (report) => {
        await TestItems.create({
          patient_id: patientID,
          org_id: req.org_id,
          request_id: TestRequestsModal.id,
          test_id: report.id,
          name: report.name,
          type: report.type,
          status: 1,
          added_by: req.userId,
        });
      });

      await PatientLogs.create({
        patient_id: TestRequestsModal.patient_id,
        org_id: req.org_id,
        description: `New ${
          type === "lab" ? "Lab" : "Imaging"
        } Request has been added`,
        type: type,
        action: "add",
        relation_id: TestRequestsModal.id,
        status: 1,
        added_by: req.userId,
      });
    };

    if (labData) {
      await handleLabOrImagingData(labData, "lab");
    }

    if (imagingData) {
      await handleLabOrImagingData(imagingData, "imaging");
    }
    // Handle Prescription
    if (prescriptionData) {
      const PrescriptionsModal = await Prescriptions.create({
        patient_id: patientID,
        org_id: req.org_id,
        clinical_id: ClinicalNotesModal.id,
        patient_name: `${PatientModal.name} ${PatientModal.last_name}`,
        patient_gender: PatientModal.sex,
        patient_age: PatientModal.age,
        patient_dob: PatientModal.birthdate,
        advice: prescriptionData.advice,
        medicin: prescriptionData.medicin,
        status: 1,
        added_by: req.userId,
      });

      prescriptionData.medicin.forEach(async (medicin) => {
        await PrescribedMedicins.create({
          patient_id: PrescriptionsModal.patient_id,
          org_id: req.org_id,
          prescription_id: PrescriptionsModal.id,
          mdeicin_id: medicin.id,
          name: medicin.name,
          advice: medicin.advice,
          dosage: medicin.doses,
          posology: medicin.posology,
          status: 1,
          added_by: req.userId,
        });
      });

      await PatientLogs.create({
        patient_id: PrescriptionsModal.patient_id,
        org_id: req.org_id,
        description: "New prescription has been added",
        type: "prescription",
        action: "add",
        relation_id: PrescriptionsModal.id,
        status: 1,
        added_by: req.userId,
      });
    }

    // Handle Hospitalization
    if (hospitalizationData) {
      const PatientHospitalizationModal = await PatientHospitalization.create({
        patient_id: patientID,
        org_id: req.org_id,
        clinical_id: ClinicalNotesModal.id,
        patient_name: `${PatientModal.name} ${PatientModal.last_name}`,
        patient_dob: PatientModal.birthdate,
        patient_age: PatientModal.age,
        patient_gender: PatientModal.sex,
        patient_phone: PatientModal.phone_contact,
        patient_address: PatientModal.address,
        channel: hospitalizationData.channel,
        motive: hospitalizationData.motive,
        desease_history: hospitalizationData.desease_history,
        consultation: hospitalizationData.consultation,
        diagnostic: hospitalizationData.diagnostic,
        treatment: hospitalizationData.treatment,
        referredby: hospitalizationData.referredby,
        referred_type: hospitalizationData.referred_type,
        hospitalization_date: hospitalizationData.hospitalization_date,
        hospitalization_time: hospitalizationData.hospitalization_time,
        status: 1,
        added_by: req.userId,
      });

      await PatientLogs.create({
        patient_id: PatientHospitalizationModal.patient_id,
        org_id: req.org_id,
        description: `Patient has been hospitalized on ${PatientHospitalizationModal.hospitalization_date}`,
        type: "hospitalization",
        action: "add",
        relation_id: PatientHospitalizationModal.id,
        status: 1,
        added_by: req.userId,
      });
    }

    // Log clinical notes addition
    await PatientLogs.create({
      patient_id: ClinicalNotesModal.patient_id,
      org_id: req.org_id,
      description: "Patient New clinical notes has been added",
      type: "clinical_notes",
      action: "add",
      relation_id: ClinicalNotesModal.id,
      status: 1,
      added_by: req.userId,
    });

    return res.json({
      status: 1,
      message: "Clinical notes added successfully",
      data: "",
    });
  } catch (error) {
    console.error("Error adding clinical notes:", error);
    return res
      .status(500)
      .json({ status: 0, message: "An error occurred", error: error.message });
  }
};

exports.updateClinicalNotes = async (req, res) => {
  try {
    let getData = [],
      results;
    ClinicalNotesModal = await ClinicalNotes.update(
      { content: req.body.content, updated_by: req.userId },
      { where: { id: req.params.id } }
    );
    if (ClinicalNotesModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.clinical_notes.update,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.deleteClinicalNotes = async (req, res) => {
  try {
    let getData = [],
      results;
    ClinicalNotesModal = await ClinicalNotes.destroy({
      where: { id: req.params.id },
    });
    if (ClinicalNotesModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.clinical_notes.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Death Record
exports.getDeathRecord = async (req, res) => {
  try {
    let getData = [],
      results;
    DeathRecordModal = await DeathRecord.findOne({
      where: { patient_id: req.params.patient_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (DeathRecordModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.death_record.individual,
        data: DeathRecordModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getDeathRecordByID = async (req, res) => {
  try {
    let getData = [],
      results;
    DeathRecordModal = await DeathRecord.findOne({
      where: { id: req.params.death_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (DeathRecordModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.death_record.individual,
        data: DeathRecordModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addDeathRecord = async (req, res) => {
  try {
    let getData = [],
      results;
    PatientModal = await Patient.findOne({
      where: { id: req.body.patient_id },
    });
    DeathRecordModal = await DeathRecord.create({
      patient_id: req.body.patient_id,
      org_id: req.org_id,

      patient_name: PatientModal.name + " " + PatientModal.last_name,
      gender: PatientModal.sex,
      age: PatientModal.age,

      cause_of_death: req.body.cause_of_death,
      manner_of_death: req.body.manner_of_death,
      pregnancy_death_associated: req.body.pregnancy_death_associated,
      was_there_delivery: req.body.was_there_delivery,
      dateofdeath: req.body.dateofdeath,
      timeofdeath: req.body.timeofdeath,

      status: 1,
      added_by: req.userId,
    });
    if (DeathRecordModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: DeathRecordModal.patient_id,
        org_id: req.org_id,
        description:
          "Patient Has been died on " +
          DeathRecordModal.dateofdeath +
          " " +
          req.body.timeofdeath,
        type: "death_record",
        action: "add",
        relation_id: DeathRecordModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.death_record.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateDeathRecord = async (req, res) => {
  //   try {
  //     let getData = [], results;
  //     DeathRecordModal = await DeathRecord.update({content: req.body.content,updated_by: req.userId,}, {where: {id: req.params.id}});
  //         if(DeathRecordModal === null){
  //             res.json({ status: 0, message: langCommon.errormessage });
  //         }else{
  //             res.json({ status: 1, message: langPatientModule.death_record.update, data: '' });
  //         }
  //   } catch (error) {
  //       throw error;
  //   }

  res.json({ status: 0, message: "Not Implemented", data: "" });
};
exports.deleteDeathRecord = async (req, res) => {
  try {
    let getData = [],
      results;
    DeathRecordModal = await DeathRecord.destroy({
      where: { id: req.params.id },
    });
    if (DeathRecordModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.death_record.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
  res.json({ status: 0, message: "Not Implemented", data: "" });
};

// Hospitalization
exports.getHospitalization = async (req, res) => {
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
    const { count, rows } = await PatientHospitalization.findAndCountAll({
      where: { patient_id: req.params.patient_id },
    });

    PatientHospitalizationModal = await PatientHospitalization.findAll({
      where: { patient_id: req.params.patient_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (PatientHospitalizationModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.hospitalization.list,
        data: PatientHospitalizationModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getHospitalizationByID = async (req, res) => {
  try {
    let getData = [],
      results;
    PatientHospitalizationModal = await PatientHospitalization.findOne({
      where: { id: req.params.hospitalization_id },
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (PatientHospitalizationModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.hospitalization.individual,
        data: PatientHospitalizationModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addHospitalization = async (req, res) => {
  try {
    let getData = [],
      results;
    PatientModal = await Patient.findOne({
      where: { id: req.body.patient_id },
    });
    PatientHospitalizationModal = await PatientHospitalization.create({
      patient_id: req.body.patient_id,
      org_id: req.org_id,

      patient_name: PatientModal.name + " " + PatientModal.last_name,
      patient_dob: PatientModal.birthdate,
      patient_age: PatientModal.age,
      patient_gender: PatientModal.sex,
      patient_phone: PatientModal.phone_contact,
      patient_address: PatientModal.address,

      channel: req.body.channel,
      motive: req.body.motive,
      desease_history: req.body.desease_history,
      consultation: req.body.consultation,
      diagnostic: req.body.diagnostic,
      treatment: req.body.treatment,
      referredby: req.body.referredby,
      referred_type: req.body.referred_type,
      hospitalization_date: req.body.hospitalization_date,
      hospitalization_time: req.body.hospitalization_time,

      // reason: req.body.reason,
      // current_disease: req.body.current_disease,
      // hospitalization_date: req.body.hospitalization_date,
      // hospitalization_time: req.body.hospitalization_time,

      status: 1,
      added_by: req.userId,
    });
    if (PatientHospitalizationModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      await PatientLogs.create({
        patient_id: PatientHospitalizationModal.patient_id,
        org_id: req.org_id,
        description:
          "Patient Has been hospitalized on " +
          PatientHospitalizationModal.hospitalization_date,
        type: "hospitalization",
        action: "add",
        relation_id: PatientHospitalizationModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.hospitalization.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateHospitalization = async (req, res) => {
  //   try {
  //     let getData = [], results;
  //     PatientHospitalizationModal = await PatientHospitalization.update({content: req.body.content,updated_by: req.userId,}, {where: {id: req.params.id}});
  //         if(PatientHospitalizationModal === null){
  //             res.json({ status: 0, message: langCommon.errormessage });
  //         }else{
  //             res.json({ status: 1, message: langPatientModule.hospitalization.update, data: '' });
  //         }

  //   } catch (error) {
  //       throw error;
  //   }

  res.json({ status: 0, message: "Not Implemented", data: "" });
};
exports.deleteHospitalization = async (req, res) => {
  try {
    let getData = [],
      results;
    PatientHospitalizationModal = await PatientHospitalization.destroy({
      where: { id: req.params.id },
    });
    if (PatientHospitalizationModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.hospitalization.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Prescription
exports.getPrescription = async (req, res) => {
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
    const { count, rows } = await Prescriptions.findAndCountAll({
      where: { patient_id: req.params.patient_id },
    });

    PrescriptionsModal = await Prescriptions.findAll({
      where: { patient_id: req.params.patient_id },
      limit: datalimit,
      offset: offsetdata,
    });
    if (PrescriptionsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.precription.list,
        data: PrescriptionsModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getPrescriptionByID = async (req, res) => {
  try {
    let getData = [],
      results;
    PrescriptionsModal = await Prescriptions.findOne({
      where: { id: req.params.prescription_id },
    });
    if (PrescriptionsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.precription.individual,
        data: PrescriptionsModal,
        url: BASEURL + "/uploads/invoicefile/",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addPrescription = async (req, res) => {
  try {
    let getData = [],
      results;
    PatientModal = await Patient.findOne({
      where: { id: req.body.patient_id },
    });
    const medicins = JSON.parse(req.body.medicin);
    PrescriptionsModal = await Prescriptions.create({
      patient_id: req.body.patient_id,
      org_id: req.org_id,

      patient_name: PatientModal.name + " " + PatientModal.last_name,
      patient_gender: PatientModal.sex,
      patient_age: PatientModal.age,
      patient_dob: PatientModal.birthdate,

      advice: req.body.advice,
      medicin: JSON.parse(req.body.medicin),

      status: 1,
      added_by: req.userId,
    });
    if (PrescriptionsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      medicins.map(async (medicin) => {
        await PrescribedMedicins.create({
          patient_id: req.body.patient_id,
          org_id: req.org_id,
          prescription_id: PrescriptionsModal.id,
          mdeicin_id: medicin.id,
          name: medicin.name,
          advice: medicin.advice,
          dosage: medicin.doses,
          posology: medicin.posology,
          status: 1,
          added_by: req.userId,
        });
      });
      await PatientLogs.create({
        patient_id: PrescriptionsModal.patient_id,
        org_id: req.org_id,
        description: "New prescription has been added ",
        type: "prescription",
        action: "add",
        relation_id: PrescriptionsModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langPatientModule.precription.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.updatePrescription = async (req, res) => {
  //   try {
  //     let getData = [], results;
  //     PrescriptionsModal = await Prescriptions.update({content: req.body.content,updated_by: req.userId,}, {where: {id: req.params.id}});
  //         if(PrescriptionsModal === null){
  //             res.json({ status: 0, message: langCommon.errormessage });
  //         }else{
  //             res.json({ status: 1, message: langPatientModule.precription.add, data: '' });
  //         }

  //   } catch (error) {
  //       throw error;
  //   }

  res.json({ status: 0, message: "Not Implemented", data: "" });
};
exports.deletePrescription = async (req, res) => {
  try {
    let getData = [],
      results;
    PrescriptionsModal = await Prescriptions.destroy({
      where: { id: req.params.id },
    });
    if (PrescriptionsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.precription.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

// Lab Test
exports.getLabTest = async (req, res) => {
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
    const { count, rows } = await TestRequests.findAndCountAll({
      where: { patient_id: req.params.patient_id, type: "lab" },
    });

    TestRequestsModal = await TestRequests.findAll({
      where: { patient_id: req.params.patient_id, type: "lab" },
      limit: datalimit,
      offset: offsetdata,
    });
    if (TestRequestsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.lab.list,
        data: TestRequestsModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getLabTestByID = async (req, res) => {
  try {
    let getData = [],
      results;
    TestRequestsModal = await TestRequests.findOne({
      where: { id: req.params.request_id, type: "lab" },
    });
    if (TestRequestsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.lab.individual,
        data: TestRequestsModal,
        url: BASEURL + "/uploads/invoicefile/",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getLabTestList = async (req, res) => {
  try {
    let search = req.query.search;

    if (search) {
      LabTestList = await Database.query(
        `SELECT payment_category.id,payment_category.prestation,setting_service.code_service FROM setting_service LEFT JOIN setting_service_specialite ON setting_service.idservice=setting_service_specialite.id_service LEFT JOIN payment_category ON setting_service.idservice=payment_category.id_service where code_service='labo' and payment_category.prestation LIKE '%${search}%' LIMIT 50;`,
        { type: Database.QueryTypes.SELECT }
      );
    } else {
      LabTestList = await Database.query(
        "SELECT payment_category.id,payment_category.prestation,setting_service.code_service FROM setting_service LEFT JOIN setting_service_specialite ON setting_service.idservice=setting_service_specialite.id_service LEFT JOIN payment_category ON setting_service.idservice=payment_category.id_service where code_service='labo'  LIMIT 50",
        { type: Database.QueryTypes.SELECT }
      );
    }

    if (LabTestList === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.lab.testlist,
        data: LabTestList,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addLabTest = async (req, res) => {
  try {
    let getData = [],
      results;
    const reports = JSON.parse(req.body.reports);
    PatientModal = await Patient.findOne({
      where: { id: req.body.patient_id },
    });
    TestRequestsModal = await TestRequests.create({
      patient_id: req.body.patient_id,
      org_id: req.org_id,
      type: "lab",
      advice: req.body.advice,
      reports: JSON.parse(req.body.reports),
      status: 0,
      added_by: req.userId,
    });

    if (TestRequestsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      reports.map(async (report) => {
        await TestItems.create({
          patient_id: req.body.patient_id,
          org_id: req.org_id,
          request_id: TestRequestsModal.id,
          test_id: report.id,
          name: report.name,
          type: report.type,
          status: 1,
          added_by: req.userId,
        });
      });
      await PatientLogs.create({
        patient_id: TestRequestsModal.patient_id,
        org_id: req.org_id,
        description: "New Lab Request has been added ",
        type: "lab",
        action: "add",
        relation_id: TestRequestsModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({ status: 1, message: langPatientModule.lab.add, data: "" });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateLabTest = async (req, res) => {
  // try {
  //     let getData = [], results;
  //     TestRequestsModal = await TestRequests.update({content: req.body.content,updated_by: req.userId,}, {where: {id: req.params.id}});
  //         if(TestRequestsModal === null){
  //             res.json({ status: 0, message: langCommon.errormessage });
  //         }else{
  //             res.json({ status: 1, message: langPatientModule.lab.update, data: '' });
  //         }

  // } catch (error) {
  //     throw error;
  // }
  res.json({ status: 0, message: "Not Implemented", data: "" });
};
exports.deleteLabTest = async (req, res) => {
  try {
    let getData = [],
      results;
    TestRequestsModal = await TestRequests.destroy({
      where: { id: req.params.id },
    });
    if (TestRequestsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({ status: 1, message: langPatientModule.lab.deleted, data: "" });
    }
  } catch (error) {
    throw error;
  }
};

// Imaging Request
exports.getImagingRequest = async (req, res) => {
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
      req.query.limit
        ? req.query.limit == undefined || req.query.limit == 1
          ? 5
          : req.query.limit
        : 5
    );
    if (isNaN(datalimit)) {
      datalimit = 5;
    }
    const { count, rows } = await TestRequests.findAndCountAll({
      where: { patient_id: req.params.patient_id, type: "imaging" },
    });

    ImagingRequestsModal = await TestRequests.findAll({
      where: { patient_id: req.params.patient_id, type: "imaging" },
      limit: datalimit,
      offset: offsetdata,
    });
    if (ImagingRequestsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.imaging.list,
        data: ImagingRequestsModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getImagingRequestByID = async (req, res) => {
  try {
    let getData = [],
      results;
    TestRequestsModal = await TestRequests.findOne({
      where: { id: req.params.request_id, type: "imaging" },
    });
    if (TestRequestsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.imaging.individual,
        data: TestRequestsModal,
        url: BASEURL + "/uploads/invoicefile/",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getImagingRequestList = async (req, res) => {
  try {
    ImagingReq = await Database.query(
      "SELECT setting_service_specialite.idspe,setting_service_specialite.name_specialite,setting_service.code_service FROM setting_service LEFT JOIN setting_service_specialite ON setting_service.idservice=setting_service_specialite.id_service where code_service='IMAG'",
      { type: Database.QueryTypes.SELECT }
    );
    if (ImagingReq === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.imaging.imaaginglist,
        data: ImagingReq,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.addImagingRequest = async (req, res) => {
  try {
    PatientModal = await Patient.findOne({
      where: { id: req.body.patient_id },
    });
    const reports = JSON.parse(req.body.reports);
    TestRequestsModal = await TestRequests.create({
      patient_id: req.body.patient_id,
      org_id: req.org_id,
      type: "imaging",
      advice: req.body.advice,
      reports: JSON.parse(req.body.reports),
      status: 0,
      added_by: req.userId,
    });
    if (TestRequestsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      reports.map(async (report) => {
        await TestItems.create({
          patient_id: req.body.patient_id,
          org_id: req.org_id,
          request_id: TestRequestsModal.id,
          test_id: report.id,
          name: report.name,
          type: report.type,
          status: 1,
          added_by: req.userId,
        });
      });
      await PatientLogs.create({
        patient_id: TestRequestsModal.patient_id,
        org_id: req.org_id,
        description: "New Imaging Request has been added ",
        type: "imaging_request",
        action: "add",
        relation_id: TestRequestsModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({ status: 1, message: langPatientModule.imaging.add, data: "" });
    }
  } catch (error) {
    throw error;
  }
};
exports.updateImagingRequest = async (req, res) => {
  // try {
  //     TestRequestsModal = await TestRequests.update({content: req.body.content,updated_by: req.userId,}, {where: {id: req.params.id}});
  //         if(TestRequestsModal === null){
  //             res.json({ status: 0, message: langCommon.errormessage });
  //         }else{
  //             res.json({ status: 1, message: 'Imaging Request has been updated.', data: '' });
  //         }

  // } catch (error) {
  //     throw error;
  // }

  res.json({ status: 0, message: "Not Implemented", data: "" });
};
exports.deleteImagingRequest = async (req, res) => {
  try {
    TestRequestsModal = await TestRequests.destroy({
      where: { id: req.params.id },
    });
    if (TestRequestsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: "Imaging Request has been Deleted.",
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.medicinList = async (req, res) => {
  try {
    let getData = [],
      results;

    const whereClause = {
      status: "active",
    };

    // Add the dci filter only if `search` is not empty
    if (req.query.search) {
      whereClause.dci = { [Op.like]: `${req.query.search}%` };
    }

    const MasterMedicineModal = await Drug.findAll({
      attributes: [
        "id",
        "therapeuticClass",
        "dci",
        "commercialName",
        "dosage",
        "administrationRoute",
        "presentation",
        "publicPrice",
        "referencePrice",
        "currency",
        "laboratory",
        "status",
        "drugScope",
      ],
      where: whereClause,
      limit: 50,
    });
    if (MasterMedicineModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.helper.deseaselist,
        data: MasterMedicineModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
// Helper

exports.deseaseList = async (req, res) => {
  try {
    let getData = [],
      results;
    IllnessModal = await Illness.findAll({
      where: {
        affection: {
          [Op.like]: "" + req.query.search + "%",
        },
      },
      limit: 50,
    });
    if (IllnessModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.helper.deseaselist,
        data: IllnessModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.NosologieDeseaseList = async (req, res) => {
  try {
    console.log(req.query.search);
    let search = req.query.search
      ? req.query.search == undefined
        ? ""
        : req.query.search
      : "";
    if (isNaN(search)) {
      search = "";
    }
    console.log(search);
    NosologieIllnessModal = await NosologieIllness.findAll({
      where: {
        name: {
          [Op.like]: "" + search + "%",
        },
      },
      limit: 50,
    });
    if (NosologieIllnessModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.helper.nosologiedeseaselist,
        data: NosologieIllnessModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

// Function to get the start and end dates for the specified date type
function getDateRange(dateType) {
  let startDate, endDate;
  const now = moment();

  switch (dateType) {
    case "this_week":
      startDate = now.startOf("week").toDate();
      endDate = now.endOf("week").toDate();
      break;
    case "last_week":
      startDate = now.subtract(1, "weeks").startOf("week").toDate();
      endDate = now.endOf("week").toDate();
      break;
    case "this_month":
      startDate = now.startOf("month").toDate();
      endDate = now.endOf("month").toDate();
      break;
    case "last_month":
      startDate = now.subtract(1, "months").startOf("month").toDate();
      endDate = now.endOf("month").toDate();
      break;
    case "this_quarter":
      startDate = now.startOf("quarter").toDate();
      endDate = now.endOf("quarter").toDate();
      break;
    case "last_quarter":
      startDate = now.subtract(1, "quarters").startOf("quarter").toDate();
      endDate = now.subtract(1, "quarters").endOf("quarter").toDate();
      break;
    case "this_year":
      startDate = now.startOf("year").toDate();
      endDate = now.endOf("year").toDate();
      break;
    case "last_year":
      startDate = now.subtract(1, "years").startOf("year").toDate();
      endDate = now.subtract(1, "years").endOf("year").toDate();
      break;
    // Add more cases for other date types if needed
    default:
      startDate = moment().toDate();
      endDate = moment().toDate();
  }

  return { startDate, endDate };
}

exports.timeLine = async (req, res) => {
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
      req.query.limit
        ? req.query.limit == undefined || req.query.limit == 1
          ? 5
          : req.query.limit
        : 5
    );
    if (isNaN(datalimit)) {
      datalimit = 5;
    }

    // Initialize an empty object to store dynamic conditions
    let conditions = {};
    conditions.patient_id = req.params.patient_id;
    // Apply filters based on user selections from the request
    if (req.query.type) {
      conditions.type = req.query.type;
    }
    if (req.query.by) {
      conditions.by = req.query.by;
    }

    // Date conditions based on date_type or custom range
    if (req.query.date_type) {
      if (req.query.date_type == "date_range") {
        console.log(moment(req.query.from_date).format("YYYY-MM-DD 00:00:00"));
        conditions.createdAt = {
          [Op.between]: [
            moment(req.query.from_date).format("YYYY-MM-DD 00:00:00"),
            moment(req.query.to_date).format("YYYY-MM-DD 00:00:00"),
          ],
        };
      } else {
        const { startDate, endDate } = getDateRange(req.query.date_type);
        conditions.createdAt = {
          [Op.between]: [startDate, endDate],
        };
      }
    }
    console.log(req.query);
    console.log(conditions);

    const { count, rows } = await PatientLogs.findAndCountAll({
      where: conditions,
    });

    const PatientLogsModal = await PatientLogs.findAll({
      attributes: [
        "id",
        "description",
        "action",
        "type",
        "relation_id",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientLogs.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientLogs.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
        "patient_id",
        "org_id",
      ],
      where: conditions,
      order: [["id", "desc"]],
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
          model: Organisation,
          attributes: ["id", "nom", "email", "adresse"],
          as: "org_details",
        },
      ],
    });
    if (PatientLogsModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.helper.timeline,
        data: PatientLogsModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.logsType = async (req, res) => {
  try {
    const Types = [
      {
        type: "appointment",
        name: langPatientModule.medicalHistory.logsType.appointment,
      },
      {
        type: "payment",
        name: langPatientModule.medicalHistory.logsType.payment,
      },
      {
        type: "dependent",
        name: langPatientModule.medicalHistory.logsType.dependent,
      },
      {
        type: "assurance",
        name: langPatientModule.medicalHistory.logsType.assurance,
      },
      {
        type: "documents",
        name: langPatientModule.medicalHistory.logsType.documents,
      },
      {
        type: "vital_sign",
        name: langPatientModule.medicalHistory.logsType.vital_sign,
      },
      {
        type: "know_health_issue",
        name: langPatientModule.medicalHistory.logsType.know_health_issue,
      },
      {
        type: "clinical_notes",
        name: langPatientModule.medicalHistory.logsType.clinical_notes,
      },
      {
        type: "hospitalization",
        name: langPatientModule.medicalHistory.logsType.hospitalization,
      },
      {
        type: "prescription",
        name: langPatientModule.medicalHistory.logsType.prescription,
      },
      {
        type: "imaging_request",
        name: langPatientModule.medicalHistory.logsType.imaging_request,
      },
      { type: "lab", name: langPatientModule.medicalHistory.logsType.lab },
      {
        type: "death_record",
        name: langPatientModule.medicalHistory.logsType.death_record,
      },
    ];
    res.json({
      status: 1,
      message: langPatientModule.medicalHistory.logstypefetched,
      data: Types,
    });
  } catch (error) {
    throw error;
  }
};

exports.TimelineDoctors = async (req, res) => {
  try {
    let patient_id = req.params.patient_id;
    Deposits = await Database.query(
      "SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) AS name FROM patient_logs as pg LEFT JOIN users u ON pg.added_by = u.id where pg.patient_id = " +
        patient_id +
        " GROUP BY pg.added_by",
      { type: Database.QueryTypes.SELECT }
    );
    if (Deposits === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({ status: 1, message: "Timeline Doctors List", data: Deposits });
    }
  } catch (error) {
    throw error;
  }
};

//  Payments history
exports.getPaymentHistory = async (req, res) => {
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
    const { count, rows } = await Payment.findAndCountAll({
      where: { patient: req.params.patient_id },
    });
    PaymentModal = await Payment.findAll({
      attributes: [
        "id",
        "date",
        "code",
        "amount",
        "gross_total",
        "amount_received",
        "status_paid",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Payment.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Payment.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: { patient: req.params.patient_id, bulletinAnalyse: "" },
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
      ],
    });
    if (PaymentModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.payment.list,
        data: PaymentModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getPaymentHistoryInfo = async (req, res) => {
  try {
    let getData = {};
    PatientModal = await Patient.findOne({
      attributes: [
        "id",
        "unique_id",
        "name",
        "last_name",
        ["patient_id", "code"],
        ["sex", "gender"],
        "age",
        "email",
        "phone",
        "address",
        "region",
        ["bloodgroup", "blood_type"],
        "birthdate",
      ],
      where: { id: req.params.patient_id },
    });
    // console.log(PatientModal);
    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      if (PatientModal.img_url) {
        PatientModal.img_url =
          BASEURL + "/uploads/imgUsers/" + PatientModal.img_url;
      } else {
        PatientModal.img_url =
          BASEURL + "/uploads/user-profile-placeholder.png";
      }
      total_balance = await Payment.sum("gross_total", {
        where: { patient: req.params.patient_id },
      });
      total_paid = await Payment.sum("amount_received", {
        where: { patient: req.params.patient_id },
      });
      total_due = total_balance - total_paid;
      // console.log(PatientModal.dataValues);
      res.json({
        status: 1,
        message: langPatientModule.payment.historyinfo,
        data: PatientModal,
        total_balance: total_balance,
        total_paid: total_paid,
        total_due: total_due,
      });
    }
  } catch (error) {
    res.json({ status: 0, message: error, data: "" });
    // throw error;
  }
};

exports.getPaymentDepositLogs = async (req, res) => {
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
    const { count, rows } = await PatientDeposit.findAndCountAll({
      where: { payment_id: req.params.payment_id },
    });
    PatientDepositModal = await PatientDeposit.findAll({
      attributes: [
        "id",
        "patient",
        ["id_organisation", "org_id"],
        "payment_id",
        "deposited_amount",
        "deposit_type",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientDeposit.createdAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("PatientDeposit.updatedAt"),
            "%d-%m-%Y %H:%i:%s"
          ),
          "updatedAt",
        ],
      ],
      where: { payment_id: req.params.payment_id },
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
      ],
    });
    if (PatientDepositModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.payment.paymentdepositlogs,
        data: PatientDepositModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.addReferenceForm = async (req, res) => {
  try {
    let patientID = req.body.patient_id;
    let ReferenceForm_data = req.body.reference_form;

    let VitalSign_data = req.body.vital_sign;

    PatientModal = await Patient.findOne({ where: { id: patientID } });
    ReferenceFormModal = await ReferenceForm.create({
      patient_id: patientID,
      org_id: req.org_id,
      bulletin_de_transfer: ReferenceForm_data.bulletin_de_transfer,
      arrivalDateTime: ReferenceForm_data.arrivalDateTime,
      transferDateTime: ReferenceForm_data.transferDateTime,
      transferReason: ReferenceForm_data.transferReason,
      clinicalSummary: ReferenceForm_data.clinicalSummary,
      providedTreatment: ReferenceForm_data.providedTreatment,
      urgencyLevel: ReferenceForm_data.urgencyLevel,
      targetOrganisationType: ReferenceForm_data.targetOrganisationType,
      targetServiceType: ReferenceForm_data.targetServiceType,
      transportationMean: ReferenceForm_data.transportationMean,
      carePerson: ReferenceForm_data.carePerson,
      gcs_total: ReferenceForm_data.gcs_total,
      ouverture_des_yeux: ReferenceForm_data.ouverture_des_yeux,
      reponse_verbale: ReferenceForm_data.reponse_verbale,
      reponse_motrice: ReferenceForm_data.reponse_motrice,
      status: 1,
      added_by: req.userId,
    });

    if (VitalSign_data != null) {
      VitalSignModal = await VitalSign.create({
        patient: patientID,
        clinical_id: null,
        id_organisation: req.org_id,
        prescripteur: VitalSign_data.prescripteur,
        frequenceRespiratoire: VitalSign_data.frequenceRespiratoire,
        frequenceCardiaque: VitalSign_data.frequenceCardiaque,
        saturationArterielle: VitalSign_data.saturationArterielle,
        temperature: VitalSign_data.temperature,
        systolique: VitalSign_data.systolique,
        diastolique: VitalSign_data.diastolique,
        tensionArterielle: VitalSign_data.tensionArterielle,
        weight: VitalSign_data.weight,
        blood_sugar: VitalSign_data.blood_sugar,
        height: VitalSign_data.height,
        body_mass_index: VitalSign_data.body_mass_index,
        ion_user_id: req.userId, //loggedin id
        add_date: moment(VitalSign_data.add_date).format("YYYY-MM-DD"),
        patient_name: "",
        patient_address: "",
        patient_phone: "",
        date_string: moment().format("DD-MM-YYYY"),
        date: moment().unix(),
        added_by: req.userId,
        status: 1,
      });
      await PatientLogs.create({
        patient_id: VitalSignModal.patient,
        org_id: req.org_id,
        description: "New Vital Sign has been Added.",
        type: "vital_sign",
        action: "add",
        relation_id: VitalSignModal.id,
        status: 1,
        added_by: req.userId,
      });
    }

    if (ReferenceFormModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      console.log(req.body);

      await PatientLogs.create({
        patient_id: ReferenceFormModal.patient_id,
        org_id: req.org_id,
        description: "Reference form has been added ",
        type: "reference_form",
        action: "add",
        relation_id: ReferenceFormModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: "Reference Form Added successfully", //langPatientModule.ReferenceForm.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getReferenceFormByID = async (req, res) => {
  try {
    let getData = [],
      results;
    ReferenceFormModal = await ReferenceForm.findOne({
      attributes: [
        "id",
        "patient_id",
        "org_id",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ReferenceForm.arrivalDateTime"),
            "%d/%m/%Y %H:%i"
          ),
          "date_time",
        ],
        "transferDateTime",
        "transferReason",
        "clinicalSummary",
        "providedTreatment",
        "urgencyLevel",
        "targetOrganisationType",
        "targetServiceType",
        "transportationMean",
        "care_person_name",
        "care_person_qualification",
        "ouverture_des_yeux",
        "reponse_verbale",
        "reponse_motrice",
        "gcs_total",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ReferenceForm.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("ReferenceForm.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: { id: req.params.reference_form_id },
    });
    if (ReferenceFormModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.clinical_notes.individual,
        data: ReferenceFormModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.addMiseEnObservation = async (req, res) => {
  try {
    let patientID = req.body.patient_id;
    let MiseEnObservation_data = req.body.mise_en_observation;

    let VitalSign_data = req.body.vital_sign;
    const Evolutionarray = MiseEnObservation_data.evolutions;
    const EvolutionarrayString = Evolutionarray.join(", ");
    PatientModal = await Patient.findOne({ where: { id: patientID } });
    MiseEnObservationModal = await MiseEnObservation.create({
      patient_id: patientID,
      org_id: req.org_id,
      MiseenObservation: MiseEnObservation_data.MiseenObservation,
      arrivalDateTime: MiseEnObservation_data.arrivalDateTime,
      clinicalSummary: MiseEnObservation_data.clinicalSummary,
      requestedTests: MiseEnObservation_data.requestedTests,
      providedTreatment: MiseEnObservation_data.providedTreatment,
      observation: MiseEnObservation_data.observation,
      evolutions: EvolutionarrayString,
      status: 1,
      added_by: req.userId,
    });

    if (VitalSign_data != null) {
      VitalSignModal = await VitalSign.create({
        patient: patientID,
        clinical_id: null,
        id_organisation: req.org_id,
        prescripteur: VitalSign_data.prescripteur,
        frequenceRespiratoire: VitalSign_data.frequenceRespiratoire,
        frequenceCardiaque: VitalSign_data.frequenceCardiaque,
        saturationArterielle: VitalSign_data.saturationArterielle,
        temperature: VitalSign_data.temperature,
        systolique: VitalSign_data.systolique,
        diastolique: VitalSign_data.diastolique,
        tensionArterielle: VitalSign_data.tensionArterielle,
        weight: VitalSign_data.weight,
        blood_sugar: VitalSign_data.blood_sugar,
        height: VitalSign_data.height,
        body_mass_index: VitalSign_data.body_mass_index,
        ion_user_id: req.userId, //loggedin id
        add_date: moment(VitalSign_data.add_date).format("YYYY-MM-DD"),
        patient_name: "",
        patient_address: "",
        patient_phone: "",
        date_string: moment().format("DD-MM-YYYY"),
        date: moment().unix(),
        added_by: req.userId,
        status: 1,
      });
      await PatientLogs.create({
        patient_id: VitalSignModal.patient,
        org_id: req.org_id,
        description: "New Vital Sign has been Added.",
        type: "vital_sign",
        action: "add",
        relation_id: VitalSignModal.id,
        status: 1,
        added_by: req.userId,
      });
    }

    if (MiseEnObservationModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      console.log(req.body);

      await PatientLogs.create({
        patient_id: MiseEnObservationModal.patient_id,
        org_id: req.org_id,
        description: "Mise en Observation has been added ",
        type: "mise_en_observation",
        action: "add",
        relation_id: MiseEnObservationModal.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: "Mise en Observation Added successfully", //langPatientModule.MiseEnObservation.add,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getMiseEnObservationByID = async (req, res) => {
  try {
    let getData = [],
      results;
    ClinicalNotesModal = await MiseEnObservation.findOne({
      attributes: [
        "id",
        "patient_id",
        "org_id",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("MiseEnObservation.arrivalDateTime"),
            "%d/%m/%Y %H:%i"
          ),
          "date_time",
        ],
        "MiseenObservation",
        "arrivalDateTime",
        "clinicalSummary",
        "requestedTests",
        "providedTreatment",
        "observation",
        "evolutions",
        "status",
        "added_by",
        "updated_by",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("MiseEnObservation.createdAt"),
            "%d/%m/%Y %H:%i"
          ),
          "createdAt",
        ],
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("MiseEnObservation.updatedAt"),
            "%d/%m/%Y %H:%i"
          ),
          "updatedAt",
        ],
      ],
      where: { id: req.params.mise_en_id },
    });
    if (ClinicalNotesModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langPatientModule.clinical_notes.individual,
        data: ClinicalNotesModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getPatient = async (req, res) => {
  try {
    patientAll = await Patient.findAll({
      attributes: [
        "id",
        "name",
        "last_name",
        "phone",
        "patient_id",
        "unique_id",
      ],
      where: { id_organisation: req.params.orgId },
      order: [["id", "DESC"]],
    });
    if (patientAll === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Patient List",
        data: patientAll,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.createServiceRequestWithInstances = async (req, res) => {
  const {
    patientID,
    organisationID,
    partenaireID,
    partnerIdAssurance, // ID partenaire pour Assurance
    type, // Type de paiement ('PAF', 'Assurance', 'light')
    noteClinique,
    prescripteur,
    status,
    instances,
    amount,
    walletType,
    walletTypeCode,
    amountDue,
    paymentID,
    referenceTransaction,
    total_amount,
    discount_amount,
    insured_amount,
    net_amount,
    amount_paid,
    remaining_balance,
    deposit_type,
    status_paid,
    status_paid_pro,
    service,
    etat,
    category_name_pro,
    typeAssurance,
    category_name_assurance,
    etatlight,
    charge_mutuelle,
    organisation_destinataire,
    partnerTraitantID
  } = req.body;

  console.log("Les paiements reçus:", req.body);

  try {
    // **Formatage des dates**
    const currentDate = moment();
    const formattedDateString = currentDate.format("DD/MM/YYYY HH:mm"); // Ex: 15/02/2025 10:41
    const formattedTimestamp = currentDate.unix(); // Ex: 1739616100

    // **Étape 1 : Création du ServiceRequest**
    const newServiceRequest = await ServiceRequest.create({
      patientID,
      organisationID,
      noteClinique,
      prescripteur,
      status,
      walletType,
      walletTypeCode,
      referenceTransaction,
      total_amount,
      discount_amount,
      insured_amount,
      net_amount,
      amount_paid,
      remaining_balance,
      instances,
      type, // "PAF", "Assurance", "Light"
      partnerIdAssurance, // ID du partenaire en cas d'assurance
      partenaireID, // ID du partenaire pour Light
      deposit_type,
      status_paid,
      status_paid_pro,
      service,
      etat,
      typeAssurance,
      category_name_assurance,
      etatlight,
      charge_mutuelle,
      category_name_pro,
      organisation_destinataire,
      partnerTraitantID
    });

    if (!newServiceRequest) {
      return res.status(400).json({
        status: 0,
        message: "Échec de la création de la demande de service.",
      });
    }

    // **Étape 2 : Création des instances de service**
    const serviceID = newServiceRequest.requestID;
    const serviceInstancesData = instances.map((instance) => ({
      serviceID,
      organisationID: instance.organisationID,
      patientID: instance.patientID,
      status: instance.status,
      productID: instance.productID,
      priceProduct: instance.priceProduct,
      lastModifiedBy: req.userId,
      prix_assurance: instance.prix_assurance,
      charge_mutuelle: instance.charge_mutuelle,
    }));

    const newServiceInstances = await ServiceInstance.bulkCreate(
      serviceInstancesData
    );

    if (!newServiceInstances) {
      return res.status(400).json({
        status: 0,
        message: "Échec de la création des instances de service.",
      });
    }

    // 🔹 Étape 1 : Récupérer les informations du patient
    const patient = await Patient.findOne({
      where: { id: patientID },
      attributes: ["id", "name", "last_name", "phone", "address", "age"],
    });

    if (!patient) {
      return res
        .status(400)
        .json({ status: 0, message: "Patient non trouvé." });
    }

    // 🔹 Étape 2 : Générer `codeFacture` basé sur `etat` envoyé dans les paramètres
    const count_payment =
      (await Payment.count({ where: { id_organisation: organisationID } })) + 1;
    let codeFacture =
      etat == "1"
        ? `CO${organisationID}${count_payment}`
        : `F${organisationID}${count_payment}`;

    // 🔹 Étape 3 : Générer `category_name`
    const categoryName = instances
      .map(
        (instance) =>
          `${instance.productID}*${instance.priceProduct}*1*1*1*service`
      )
      .join(",");

    // 🔹 Étape 4 : Création de l'objet `payment`
    let paymentData = {
      code: codeFacture, // Ajout du codeFacture ici
      patient: patientID,
      id_organisation: organisationID,
      date: Math.floor(Date.now() / 1000), // Timestamp Unix
      amount: total_amount,
      category_name: categoryName,
      amount_received: amount_paid,
      status: "pending",
      status_paid: status_paid || "unpaid",
      status_paid_pro: status_paid_pro || "unpaid",
      deposit_type: deposit_type || "Cash",
      bulletinAnalyse: "----",
      organisation_light_origin: partenaireID,
      organisation_destinataire: partnerTraitantID,
      service: service || 1,
      user: req.userId,
      patient_name: `${patient.last_name} ${patient.name}`,
      patient_phone: patient.phone,
      patient_address: patient.address,
      date_string: formattedDateString,
      createdAt: Sequelize.literal("NOW()"),
      updatedAt: Sequelize.literal("NOW()"),
      date: formattedTimestamp,
      date_created: new Date(),
      renseignementClinique: noteClinique,
      typeAssurance,
      etatlight,
    };

    // 🔹 Étape 5 : Gestion des cas "Assurance" et "Light"
    if (etat == "1") {
      console.log("🔍 Type détecté recuperer :", typeAssurance);
      paymentData.category_name_assurance = categoryName;
      paymentData.etat_assurance = 1;
      paymentData.organisation_assurance = partenaireID;
    }

    if (type == "Sous-Traitant-Partner") {
      console.log("🔍 Type détecté recuperer :", typeAssurance);
      paymentData.category_name_pro = categoryName;
      paymentData.etat = 1;
      paymentData.organisation_destinataire = partnerTraitantID;
    }

    if (etatlight) {
      paymentData.category_name_pro = categoryName;
      paymentData.etatlight = 1;
      paymentData.organisation_light_origin = partenaireID;
    }

    // 🔹 Étape 6 : Création du paiement
    const newPayment = await Payment.create(paymentData);

    if (!newPayment) {
      return res
        .status(400)
        .json({ status: 0, message: "Échec de la création du paiement." });
    }

    if (amount_paid > 0 || amount_received > 0) {
      PatientDepositModal = await PatientDeposit.create({
        date: moment().unix(),
        patient: patientID,
        deposited_amount: amount_paid ? amount_paid : amount_received,
        payment_id: newPayment.id,
        amount_received_id: null,
        deposit_type: "Cash",
        user: req.userId,
        id_organisation: organisationID,
        status: 1,
        added_by: req.userId,
      });
    }

    // 🔹 Étape 7 : Création des transactions pour chaque prestation
    if (typeAssurance) {
      const transactionsData = instances.map((instance) => ({
        id_payment: newPayment.id,
        id_prestation_organisation: instance.productID,
        amount: instance.priceProduct,
        to_Pay: instance.prix_assurance,
        id_patient_payeur: patientID,
        id_patient_parent: patientID,
        id_organisation_origine: organisationID,
        id_organisation_assurance_ipm: partenaireID, // Partenaire assurance
        type,
        charge_mutuelle: instance.charge_mutuelle,
        Facturer: "0",
        status: "EN COURS", // Statut de la transaction
        Billing: "0",
        createdAt: Sequelize.literal("NOW()"),
        updatedAt: Sequelize.literal("NOW()"),
      }));

      const invoiceItemsData = instances.map((instance) => ({
        // PAS de invoice_id ici !
        description: instance.description || "",
        beneficiaire: patientID,
        reference: instance.reference || "",
        quantity: instance.quantity || 1,
        unit_price: instance.priceProduct,
        total: instance.priceProduct * (instance.quantity || 1),
        service_code: instance.productID || "",
        statut: "LIBRE", // ou valeur par défaut
        payer_patient: instance.priceProduct,
        doit_payer_partenaire: instance.prix_assurance || 0,
        chargeMutuelle: instance.charge_mutuelle || 0,
        organisation_origine: instance.organisationID,
        organisation_destinataire: partenaireID,
        type: "TiersPayant",
      }));
      await InvoiceItem.bulkCreate(invoiceItemsData);

      const newTransactions = await Transaction.bulkCreate(transactionsData);
    } else if (etatlight) {
      const transactionsData = instances.map((instance) => ({
        id_payment: newPayment.id,
        id_prestation_organisation: instance.productID,
        amount: instance.priceProduct,
        to_Pay: instance.priceProduct,
        doit_payer_partenaire: instance.priceProduct || 0,
        id_patient_payeur: patientID,
        id_patient_parent: patientID,
        id_organisation_origine: organisationID,
        id_organisation_light: partenaireID,
        Facturer: "0",
        status: "EN COURS", // Statut de la transaction
        Billing: "0",
        createdAt: Sequelize.literal("NOW()"),
        updatedAt: Sequelize.literal("NOW()"),
      }));

      const newTransactions = await Transaction.bulkCreate(transactionsData);
      // Création des InvoiceItem pour les prestations partenaires (type Partenaire)
      const invoiceItemsData = instances.map((instance) => ({
        // PAS de invoice_id ici !
        description: instance.description || "",
        beneficiaire: patientID,
        reference: instance.reference || "",
        quantity: instance.quantity || 1,
        unit_price: instance.priceProduct,
        total: instance.priceProduct * (instance.quantity || 1),
        service_code: instance.productID || "",
        statut: "LIBRE",
        organisation_origine: organisationID,
        organisation_destinataire: partenaireID,
        payer_patient: instance.priceProduct,
        doit_payer_partenaire: instance.priceProduct, // Pour le partenaire, la part assurance est 0
        chargeMutuelle: 0, // Pas de mutuelle ici
        type: "Sous-Traitance",
      }));
      await InvoiceItem.bulkCreate(invoiceItemsData);
    }

    // **Étape 5 : Récupération des infos de l'organisation**
    const OrganisationModal = await Organisation.findOne({
      where: { id: organisationID },
    });

    // **Étape 6 : Récupération des infos du patient**
    const patientDetails = await Patient.findOne({
      attributes: [
        "id",
        "unique_id",
        "name",
        "last_name",
        ["patient_id", "code"],
        ["sex", "gender"],
        "sex",
        "age",
        "email",
        "phone",
        "address",
        "country",
        "region",
        "district",
        ["registration_time", "register"],
        "grade",
        "estCivil",
        "passport",
        "matricule",
        ["bloodgroup", "blood_type"],
        "birthdate",
        ["birth_position", "birth_place"],
        "religion",
        "img_url",
        ["nom_contact", "emergency_contact_name"],
        ["phone_contact", "emergency_contact_no"],
      ],
      where: { id: patientID },
      include: [
        {
          model: Region,
          attributes: ["id", "name"],
          as: "region_details",
        },
        {
          model: District,
          attributes: ["id", "name"],
          as: "district_details",
        },
      ],
    });

    if (!patientDetails) {
      return res
        .status(400)
        .json({ status: 0, message: "Patient non trouvé." });
    }

    // **Étape 7 : Récupérer les noms des prestations**
    const prestationNames = await Promise.all(
      newServiceInstances.map(async (instance) => {
        const prestation = await PaymentCategory.findOne({
          where: { id: instance.productID },
        });
        return {
          ...instance.dataValues,
          prestationName: prestation ? prestation.prestation : "N/A",
        };
      })
    );

    // **Étape 8 : Réponse finale**
    res.json({
      status: 1,
      message: "Demande de service, instances et paiement créés avec succès.",
      data: {
        serviceRequest: newServiceRequest,
        patientDetails,
        serviceInstances: prestationNames,
        payment: newPayment,
        organisationDetails: OrganisationModal,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création du service, des instances et du paiement:",
      error
    );
    res.status(500).json({ status: 0, message: "Erreur interne du serveur." });
  }
};

exports.addTransaction = async (req, res) => {
  const {
    id_payment,
    instances,
    amount_received,
    totalSupport,
    id_patient_payeur,
    id_organisation_origine,
    id_organisation_assurance_ipm,
  } = req.body;

  try {
    // Préparer les données de transactions pour chaque instance
    const transactionData = instances.map((instance) => ({
      id_payment: id_payment,
      id_prestation_organisation: instance.productID,
      amount: instance.amount_received,
      to_Pay: instance.totalSupport,
      id_patient_payeur: id_patient_payeur,
      id_patient_parent: null, // Ajuster en fonction de votre logique
      id_organisation_origine: id_organisation_origine,
      id_organisation_destinataire:
        instance.id_organisation_destinataire || null,
      id_organisation_light: instance.id_organisation_light || null,
      id_organisation_assurance_ipm: id_organisation_assurance_ipm,
      type: instance.type || null,
      status: "En Cours", // Statut par défaut
    }));

    // Insertion des transactions dans la base de données
    const newTransactions = await Transaction.bulkCreate(transactionData);

    if (!newTransactions) {
      return res
        .status(400)
        .json({ status: 0, message: "Échec de la création des transactions." });
    }

    res.json({
      status: 1,
      message: "Transactions créées avec succès.",
      data: newTransactions,
    });
  } catch (error) {
    console.error("Erreur lors de la création des transactions :", error);
    res.status(500).json({ status: 0, message: "Erreur interne du serveur." });
  }
};

exports.updateCategoryNameStatus = async (req, res) => {
  const { paymentID, status, prestationID } = req.body;

  console.log("req.body", req.body);

  try {
    // Fetch the payment record with the provided paymentID
    const paymentRecord = await Payment.findOne({ where: { id: paymentID } });

    if (!paymentRecord) {
      return res.json({ status: 0, message: "Payment record not found." });
    }

    let { category_name } = paymentRecord;

    // Split the category_name into individual prestation segments
    const prestations = category_name.split(",");

    // Iterate over each prestation segment to find and modify the target one
    const updatedPrestations = prestations.map((segment) => {
      const parts = segment.split("*");

      // Check if the prestation ID in the segment matches the provided prestationID
      if (parts[0] == prestationID) {
        // Modify the status (last number before "service")
        parts[parts.length - 2] = status; // This updates the second last element
      }

      // Reconstruct the segment
      return parts.join("*");
    });

    // Join the updated prestations back into a string
    const updatedCategoryName = updatedPrestations.join(",");

    // Update the payment record with the modified category_name
    paymentRecord.category_name = updatedCategoryName;
    await paymentRecord.save();

    return res.json({
      status: 1,
      message: "Category name updated successfully.",
      data: paymentRecord,
    });
  } catch (error) {
    console.error("Error updating category name:", error);
    return res.json({
      status: 0,
      message: "Error updating category name.",
      error: error.message,
    });
  }
};
