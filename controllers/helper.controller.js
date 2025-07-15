const Sequelize = require("sequelize");
const dotenv = require("dotenv");
const Database = require("../config").sequelize;
const Op = Sequelize.Op;
const moment = require("moment");
moment.locale("en");
const { Docmosis, dataPrepare } = require("../helpers/DocmosisHelper");
const { replaceShortcodes } = require("../helpers/ShortcodesHelper");
var Country = require("../models/Country");
var Region = require("../models/Region");
var District = require("../models/District");
var DoctorSignature = require("../models/DoctorSignature");
var Patient = require("../models/Patient");
var Organisation = require("../models/Organisation");
const multer = require("multer");
const fs = require("fs");
var Patient = require("../models/Patient");
var Doctor = require("../models/Doctor");
var SettingService = require("../models/SettingService");
var TestRequests = require("../models/TestRequests");
var Prescriptions = require("../models/Prescriptions");
var OrgPermissionItems = require("../models/OrgPermissionItems");
var VisitReason = require("../models/VisitReason");
var UrgencyLevel = require("../models/UrgencyLevel");
var TargetOrganisationType = require("../models/TargetOrganisationType");
var TargetServiceType = require("../models/TargetServiceType");
var TransportationMean = require("../models/TransportationMean");
var CarePerson = require("../models/CarePerson");
var crypto = require("crypto");
var Email = require("../models/Email");
var AutoEmailTemplate = require("../models/AutoEmailTemplate");
const User = require("../models/User");
const ChartAccount = require("../models/ChartAccount");

const BASEURL = process.env.SITE_URL;
const BASEPATH = process.env.BASE_PATH;

exports.getPatients = async (req, res) => {
  try {
    let search = req.query.search;

    let whereClause = {
      id_organisation: req.org_id,
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
      },
    });
    PatientModal = await Patient.findAll({
      attributes: [
        "id",
        [
          Sequelize.literal(`
        CASE
          WHEN name IS NOT NULL AND name != '' AND last_name IS NOT NULL AND last_name != '' AND unique_id IS NOT NULL AND unique_id != '' 
          THEN CONCAT(name, ' ', last_name, ' (', unique_id, ')')
          WHEN name IS NOT NULL AND name != '' AND last_name IS NOT NULL AND last_name != ''
          THEN CONCAT(name, ' ', last_name)
          ELSE NULL
        END
      `),
          "label",
        ],
      ],
      order: [["id", "DESC"]],
      where: whereClause,
      limit: 20,
    });
    if (PatientModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: "Patient Petched",
        data: PatientModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getChartAccount = async (req, res) => {
  try {
    let offsetdata = parseInt(req.query.offset ?? 0);
    offsetdata = isNaN(offsetdata) || offsetdata < 0 ? 0 : offsetdata;
    let datalimit = parseInt(req.query.limit ?? 5);
    datalimit = isNaN(datalimit) || datalimit <= 0 ? 5 : datalimit;
    const { count, rows } = await ChartAccount.findAndCountAll({
      include: [
        {
          model: ChartAccount,
          as: "parent",
          attributes: ["id", "code", "name", "type", "parent_account"],
        },
      ],
       order: [["id", "DESC"]],
      attributes: [
        "id",
        "code",
        "name",
        "type",
        "parent_account",
        "added_by",
        "updated_by",
      ],
    });
    
    if (rows.length === 0) {
      res.json({
        status: 0,
        message: "No chart account data available",
      });
    } else {
      res.json({
        status: 1,
        message: "Chart account list retrieved successfully",
        data: rows,
        total: count,
      });
    }
  } catch (error) {
    console.error("Error fetching lab tubes:", error);
    res
      .status(500)
      .json({ status: 0, message: "Server error", error: error.message });
  }
};

exports.getDoctorsList = async (req, res) => {
  try {
    let getData = [];
    DoctorModal = await Doctor.findAll({
      attributes: ["id", "name"],
    });
    if (DoctorModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({ status: 1, message: "Doctors List", data: DoctorModal });
    }
  } catch (error) {
    throw error;
  }
};
exports.getServicesList = async (req, res) => {
  try {
    let getData = [];
    SettingServiceModal = await SettingService.findAll({
      attributes: [["idservice", "id"], "name_service", "code_service"],
      where: { status_service: 1 },
    });
    if (SettingServiceModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Service List",
        data: SettingServiceModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.getDoctorsListByServiceID = async (req, res) => {
  try {
    let search = req.query.search;
    let service_id = parseInt(req.params.service_id);
    let whereClause = {
      id_organisation: req.org_id,
      service:service_id
    };

    if (search && search.trim() !== "") {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn(
              "concat",
              Sequelize.col("first_name"),
              " ",
              Sequelize.col("last_name")
            ),
            {
              [Op.like]: `%${search}%`,
            }
          )
        ],
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where: {
        id_organisation: req.org_id,
        service:service_id
      },
    });
    DoctorModal = await User.findAll({
      attributes: [
        "id",
        [
          Sequelize.fn(
            "CONCAT",
            Sequelize.col(`first_name`),
            " ",
            Sequelize.col(`last_name`)
          ),
          "name",
        ],
      ],
      order: [["id", "DESC"]],
      where: whereClause,
      limit: 20,
    });
    if (DoctorModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: "Doctors Fetched",
        data: DoctorModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};


exports.getCountryList = async (req, res) => {
  try {
    CountryModal = await Country.findAll({
      attributes: [
        "id",
        "name",
        "country_code",
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
    if (CountryModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({ status: 1, message: "Country List", data: CountryModal });
    }
  } catch (error) {
    throw error;
  }
};

exports.getRegionList = async (req, res) => {
  try {
    RegionModal = await Region.findAll({
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
      // where: { country_id: req.params.country_id },
    });
    if (RegionModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({ status: 1, message: "Region List", data: RegionModal });
    }
  } catch (error) {
    throw error;
  }
};

exports.getDistrictList = async (req, res) => {
  try {
    DistrictModal = await District.findAll({
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
      where: { id_region: req.params.region_id },
    });
    if (DistrictModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({ status: 1, message: "District List", data: DistrictModal });
    }
  } catch (error) {
    throw error;
  }
};

exports.getOrganizationPermission = async (req, res) => {
  try {
    let getData = [];
    // OrgPermissionModal = await OrgPermission.findAll({ attributes: ['id', 'sp_id'],where: { status_service: 1 } });

    OrgPermissionModal = await Database.query(
      "SELECT op.id,sp.name,sp.description,sp.module_id FROM org_permission_items as op  LEFT JOIN system_permissions as sp ON op.sp_id= sp.id where op.status=1 and op.org_id = " +
        req.org_id +
        ";",
      { type: Database.QueryTypes.SELECT }
    );
    if (OrgPermissionModal === null) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Organization Permission fetched",
        data: OrgPermissionModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
const SHA1 = (msg) => {
  function rotate_left(n, s) {
    return (n << s) | (n >>> (32 - s));
  }

  function lsb_hex(val) {
    let str = "";
    for (let i = 0; i <= 6; i += 2) {
      const vh = (val >>> (i * 4 + 4)) & 0x0f;
      const vl = (val >>> (i * 4)) & 0x0f;
      str += vh.toString(16) + vl.toString(16);
    }
    return str;
  }

  function cvt_hex(val) {
    let str = "";
    for (let i = 7; i >= 0; i--) {
      const v = (val >>> (i * 4)) & 0x0f;
      str += v.toString(16);
    }
    return str;
  }

  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  let word_array = [];
  msg = Utf8Encode(msg);
  let msg_len = msg.length;

  for (let i = 0; i < msg_len - 3; i += 4) {
    const j =
      (msg.charCodeAt(i) << 24) |
      (msg.charCodeAt(i + 1) << 16) |
      (msg.charCodeAt(i + 2) << 8) |
      msg.charCodeAt(i + 3);
    word_array.push(j);
  }

  switch (msg_len % 4) {
    case 0:
      word_array.push(0x080000000);
      break;
    case 1:
      word_array.push((msg.charCodeAt(msg_len - 1) << 24) | 0x0800000);
      break;
    case 2:
      word_array.push(
        (msg.charCodeAt(msg_len - 2) << 24) |
          (msg.charCodeAt(msg_len - 1) << 16) |
          0x08000
      );

      break;
    case 3:
      word_array.push(
        (msg.charCodeAt(msg_len - 3) << 24) |
          (msg.charCodeAt(msg_len - 2) << 16) |
          (msg.charCodeAt(msg_len - 1) << 8) |
          0x80
      );

      break;
    default:
  }

  while (word_array.length % 16 !== 14) word_array.push(0);
  word_array.push(msg_len >>> 29);
  word_array.push((msg_len << 3) & 0x0ffffffff);

  let H0 = 0x67452301;
  let H1 = 0xefcdab89;
  let H2 = 0x98badcfe;
  let H3 = 0x10325476;
  let H4 = 0xc3d2e1f0;
  let A, B, C, D, E;
  let temp;

  for (let blockstart = 0; blockstart < word_array.length; blockstart += 16) {
    let W = [];
    for (let i = 0; i < 16; i++) W.push(word_array[blockstart + i]);
    for (let i = 16; i <= 79; i++)
      W.push(rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1));

    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;

    // Les quatre tours de l'algorithme SHA1
    // Premier tour
    for (let i = 0; i <= 19; i++) {
      temp =
        (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5a827999) &
        0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    // Deuxième tour
    for (let i = 20; i <= 39; i++) {
      temp =
        (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ed9eba1) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    // Troisième tour
    for (let i = 40; i <= 59; i++) {
      temp =
        (rotate_left(A, 5) +
          ((B & C) | (B & D) | (C & D)) +
          E +
          W[i] +
          0x8f1bbcdc) &
        0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    // Quatrième tour
    for (let i = 60; i <= 79; i++) {
      temp =
        (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xca62c1d6) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }

  return (
    cvt_hex(H0) +
    cvt_hex(H1) +
    cvt_hex(H2) +
    cvt_hex(H3) +
    cvt_hex(H4).toLowerCase()
  );
};
exports.getDoctorSignature = async (req, res) => {
  try {
    DoctorSignatureModal = await DoctorSignature.findOne({
      attributes: [
        "doc_id",
        [
          Sequelize.fn("CONCAT", BASEURL + "/", Sequelize.col(`sign_name`)),
          "sign_name",
        ],
        "pin",
      ],
      where: { doc_id: req.userId },
    });
    console.log(DoctorSignatureModal.pin);
    // let hash = crypto
    //   .createHash("sha1")
    //   .update(req.body.password)
    //   .digest("hex");
    let hash1 = SHA1(req.body.password);
    hash = SHA1(hash1);
    console.log(hash);
    console.log(DoctorSignatureModal.pin);
    if (DoctorSignatureModal === null) {
      res.json({ status: 0, message: "No Signature Found" });
    } else {
      if (DoctorSignatureModal.pin === hash) {
        res.json({
          status: 1,
          message: "Signature Verified Successfully",
          data: DoctorSignatureModal,
        });
      } else {
        res.json({
          status: 0,
          message: "Please Enter valid signature PIN",
          data: "",
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const data = await dataPrepare(
      req.body.type,
      req.org_id,
      req.body.signature,
      req.body.id,
      req.userId
    );
    console.log(data);
    Docmosis(req.body.type, req.body.id, data)
      .then(async (response) => {
        if (response.status) {
          fileName = response.filename;
          switch (req.body.type) {
            case "lab_test_request":
              console.log(req.body.type, req.body.id);
              TestRequestsModal = await TestRequests.update(
                { file: fileName, updated_by: req.userId },
                { where: { id: req.body.id } }
              );

              break;
            case "imaging_request":
              TestRequestsModal = await TestRequests.update(
                { file: fileName, updated_by: req.userId },
                { where: { id: req.body.id } }
              );

              break;
            case "prescription":
              PrescriptionsModal = await Prescriptions.update(
                { file: fileName, updated_by: req.userId },
                { where: { id: req.body.id } }
              );

              break;
            default:
              // show error response (details)
              res.json({
                status: 0,
                message: "Type not defined!!",
              });
          }
          res.json({
            status: 1,
            message: response.message,
            pdfpath: response.pdfPath,
          });
        } else {
          res.json({
            status: 0,
            message: "Server Error, Please Try Againg Later!!",
          });
        }

        console.log("Response:", response, req.body.type);
      })
      .catch((error) => {
        console.error("Error:", error);
        res.json({
          status: 0,
          message: "Server Error, Please Try Againg Later!!",
        });
      });
  } catch (error) {
    console.error("Error:", error);
    res.json({ status: 0, message: "Server Error, Please Try Againg Later!!" });
    // throw error;
  }
};

exports.sendDocument = async (req, res) => {
  try {
    const pathToStore = {
      lab_test_request: BASEPATH + "uploads/invoicefile/",
      imaging_request: BASEPATH + "uploads/invoicefile/",
      prescription: BASEPATH + "uploads/invoicefile/",
    };
    // console.log(data);
    if (req.body.type === "lab_test_request") {
      TemplateModal = await AutoEmailTemplate.findOne({
        where: { type: "patient_lab_test_request" },
      });
      RequestsModal = await TestRequests.findOne({
        where: { id: req.body.id, type: "lab" },
      });
      patientModel = await Patient.findOne({
        where: { id: RequestsModal.patient_id },
      });
      OrganisationModal = await Organisation.findOne({
        where: { id: req.org_id },
      });
      const SubjectShortCodes = {
        patient_full_name: patientModel.name + " " + patientModel.last_name,
        patient_id: patientModel.unique_id,
      };
      const BodyShortCodes = {
        patient_full_name: patientModel.name + " " + patientModel.last_name,
        nom_organisation: OrganisationModal.nom,
      };
      let Subject = replaceShortcodes(TemplateModal.name, SubjectShortCodes);
      let Message = replaceShortcodes(TemplateModal.message, BodyShortCodes);

      EmailModal = await Email.create({
        is_sent: null,
        subject: Subject,
        date: moment().format("YYYY-MM-DD HH:mm:ss"),
        message: Message,
        reciepient: req.body.email,
        attachment_path: pathToStore[req.body.type] + RequestsModal.file,
        user: req.userId,
      });
    } else if (req.body.type === "imaging_request") {
      TemplateModal = await AutoEmailTemplate.findOne({
        where: { type: "patient_imaging_request" },
      });
      RequestsModal = await TestRequests.findOne({
        where: { id: req.body.id, type: "imaging" },
      });

      patientModel = await Patient.findOne({
        where: { id: RequestsModal.patient_id },
      });
      OrganisationModal = await Organisation.findOne({
        where: { id: req.org_id },
      });
      const SubjectShortCodes = {
        patient_full_name: patientModel.name + " " + patientModel.last_name,
        patient_id: patientModel.unique_id,
      };
      const BodyShortCodes = {
        patient_full_name: patientModel.name + " " + patientModel.last_name,
        nom_organisation: OrganisationModal.nom,
      };
      let Subject = replaceShortcodes(TemplateModal.name, SubjectShortCodes);
      let Message = replaceShortcodes(TemplateModal.message, BodyShortCodes);

      EmailModal = await Email.create({
        is_sent: null,
        subject: Subject,
        date: moment().format("YYYY-MM-DD HH:mm:ss"),
        message: Message,
        reciepient: req.body.email,
        attachment_path: pathToStore[req.body.type] + RequestsModal.file,
        user: req.userId,
      });
    } else if (req.body.type === "prescription") {
      TemplateModal = await AutoEmailTemplate.findOne({
        where: { type: "patient_prescription" },
      });
      RequestsModal = await Prescriptions.findOne({
        where: { id: req.body.id },
      });

      patientModel = await Patient.findOne({
        where: { id: RequestsModal.patient_id },
      });
      OrganisationModal = await Organisation.findOne({
        where: { id: req.org_id },
      });
      const SubjectShortCodes = {
        patient_full_name: patientModel.name + " " + patientModel.last_name,
        patient_id: patientModel.unique_id,
      };
      const BodyShortCodes = {
        patient_full_name: patientModel.name + " " + patientModel.last_name,
        nom_organisation: OrganisationModal.nom,
      };
      let Subject = replaceShortcodes(TemplateModal.name, SubjectShortCodes);
      let Message = replaceShortcodes(TemplateModal.message, BodyShortCodes);
      EmailModal = await Email.create({
        is_sent: null,
        subject: Subject,
        date: moment().format("YYYY-MM-DD HH:mm:ss"),
        message: Message,
        reciepient: req.body.email,
        attachment_path: pathToStore[req.body.type] + RequestsModal.file,
        user: req.userId,
      });
    } else {
      res.json({
        status: 0,
        message: "Type not defined!!",
      });
    }

    if (RequestsModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({ status: 1, message: "Document Successfully sent.", data: "" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.json({ status: 0, message: "Server Error, Please Try Againg Later!!" });
    // throw error;
  }
};

exports.getvisitReason = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const limit = 10;

    const visitReasondata = await VisitReason.findAll({
      attributes: ["id", "name", "description"],
      where: {
        tag: {
          [Sequelize.Op.like]: `%${search}%`, // Search for the term within tags
        },
      },
      order: [['name', 'ASC']],
      limit: parseInt(limit, 10),
    });

    if (visitReasondata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Visit Reason List",
        data: visitReasondata,
      });
    }
  } catch (error) {
    console.error("Error fetching visit Reason:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.addVisitReason = async (req, res) => {
  try {
    let getData = [],
      results;

    const VisitReasonModal = await VisitReason.create({
      name: req.body.name,
      description: req.body.description,
      tag: req.body.tags,
    });
    if (VisitReasonModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: "Visit Reason added",
        data: "",
      });
    }
  } catch (error) {
    // throw error;
    console.error("Error fetching visit Reason:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.geturgencyLevel = async (req, res) => {
  try {
    const urgencyLeveldata = await UrgencyLevel.findAll({
      attributes: ["id", "name", "description"],
    });

    if (urgencyLeveldata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "urgencyLevel List",
        data: urgencyLeveldata,
      });
    }
  } catch (error) {
    console.error("Error fetching urgencyLevel:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.gettargetOrganisationType = async (req, res) => {
  try {
    const targetOrganisationTypedata = await TargetOrganisationType.findAll({
      attributes: ["id", "name", "description"],
    });

    if (targetOrganisationTypedata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "targetOrganisationType List",
        data: targetOrganisationTypedata,
      });
    }
  } catch (error) {
    console.error("Error fetching targetOrganisationType:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.gettargetServiceType = async (req, res) => {
  try {
    const targetServiceTypedata = await TargetServiceType.findAll({
      attributes: ["id", "name", "description"],
    });

    if (targetServiceTypedata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "targetServiceType List",
        data: targetServiceTypedata,
      });
    }
  } catch (error) {
    console.error("Error fetching targetServiceType:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.gettransportationMean = async (req, res) => {
  try {
    const transportationMeandata = await TransportationMean.findAll({
      attributes: ["id", "name", "description"],
    });

    if (transportationMeandata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "transportationMean List",
        data: transportationMeandata,
      });
    }
  } catch (error) {
    console.error("Error fetching transportationMean:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.getcarePerson = async (req, res) => {
  try {
    const carePersondata = await CarePerson.findAll({
      attributes: ["id", "name", "description"],
    });

    if (carePersondata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({ status: 1, message: "carePerson List", data: carePersondata });
    }
  } catch (error) {
    console.error("Error fetching carePerson:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.getOuverturedesyeux = async (req, res) => {
  try {
    const Ouverturedesyeuxdata = [
      {
        id: 1,
        name: "Pas d'ouverture",
      },
      {
        id: 2,
        name: "Ouverture en réponse à une douleur",
      },
      {
        id: 3,
        name: "Ouverture à la demande verbale",
      },
      {
        id: 4,
        name: "Ouverture spontanée",
      },
    ];

    if (Ouverturedesyeuxdata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Ouverture des yeux  List",
        data: Ouverturedesyeuxdata,
      });
    }
  } catch (error) {
    console.error("Error fetching Ouverture des yeux :", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.getReponseverbale = async (req, res) => {
  try {
    const Reponseverbaledata = [
      {
        id: 1,
        name: "Aucune réponse verbale",
      },
      {
        id: 2,
        name: "Sons incompréhensibles (grognements ou bruits, mais pas de mots)",
      },
      {
        id: 3,
        name: "Mots inappropriés (la personne dit des mots, mais ils ne forment pas de phrases compréhensibles)",
      },
      {
        id: 4,
        name: "Confus (la personne est capable de parler, mais est désorientée ou confuse)",
      },
      {
        id: 5,
        name: "Orienté (la personne répond de manière cohérente et est orientée)",
      },
    ];

    if (Reponseverbaledata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Réponse verbale List",
        data: Reponseverbaledata,
      });
    }
  } catch (error) {
    console.error("Error fetching Réponse verbale:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.getReponsemotrice = async (req, res) => {
  try {
    const Reponsemotricedata = [
      {
        id: 1,
        name: "Aucune réponse mortice",
      },
      {
        id: 2,
        name: " Extension anormale (réaction d'extension en réponse à la douleur)",
      },
      {
        id: 3,
        name: "Flexion anormale (réaction de flexion en réponse à la douleur)",
      },
      {
        id: 4,
        name: "Retrait en réponse à la douleur (la personne retire le membre touché par la douleur) ",
      },
      {
        id: 5,
        name: "Localise la douleur (la personne essaie de localiser la source de la douleur)",
      },
      {
        id: 6,
        name: "Obéit aux orders",
      },
    ];

    if (Reponsemotricedata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Réponse motrice List",
        data: Reponsemotricedata,
      });
    }
  } catch (error) {
    console.error("Error fetching Réponse motrice:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};

exports.getEvolutions = async (req, res) => {
  try {
    const Reponsemotricedata = [
      {
        id: 1,
        name: "Exeat",
      },
      {
        id: 2,
        name: "Hospitalisation",
      },
      {
        id: 3,
        name: "Référence",
      },
      {
        id: 4,
        name: "Décès",
      },
      {
        id: 5,
        name: "Refus de Soins",
      },
    ];

    if (Reponsemotricedata.length === 0) {
      res.json({ status: 0, message: "No Data Found" });
    } else {
      res.json({
        status: 1,
        message: "Evolutions successfully fetched",
        data: Reponsemotricedata,
      });
    }
  } catch (error) {
    console.error("Error fetching Réponse motrice:", error);
    res.status(500).json({ status: 0, message: "An error occurred" });
  }
};
