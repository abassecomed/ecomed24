const i18n = require("i18n");
const langRoleModule = i18n.__("Roles");
const langCommon = i18n.__("common");
const Sequelize = require("sequelize");
const Database = require("../config").sequelize;
const Op = Sequelize.Op;
const moment = require("moment");
moment.locale("en");
const path = require("path");
const nodemailer = require("nodemailer");
const langAppointment = i18n.__("Appointment");
var User = require("../models/User");
var HolidaysService = require("../models/HolidaysService");
var TimeSlotService = require("../models/TimeSlotService");
var Appointment = require("../models/Appointment");
var Organisation = require("../models/Organisation");
var PatientLogs = require("../models/PatientLogs");

// TELECONSULTATION
const TeleconferenceLink = require("../models/TeleconferenceLink");
const Patient = require("../models/Patient");
const Email = require("../models/Email");
const AutoEmailTemplate = require("../models/AutoEmailTemplate");
const axios = require("axios");

//////Modal Relationship
const { appointmentAPI } = require("../helpers/AppointmentHelper");
// Appointment.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
// Appointment.belongsTo(User, { as: "updatedby_details", foreignKey: "updated_by" });
// Appointment.belongsTo(Organisation, { as: "org_details", foreignKey: "org_id" });

// Appointments
exports.getList = async (req, res) => {
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
      where: { id_organisation: req.org_id },
    });
    let updatedCurrentDate;
    const type = req.query.type ? req.query.type : "month";
    const direction = req.query.direction ? req.query.direction : null;
    let startDate, endDate;
    const currentDate = req.query.currentDate
      ? req.query.currentDate
      : moment().format("YYYY-MM-DD");
    // Parse the current date
    const baseDate = moment(currentDate, "YYYY-MM-DD");

    // Determine range and new current date based on type and direction
    switch (type) {
      case "month":
        if (direction === "next") {
          updatedCurrentDate = baseDate.clone().add(1, "month");
          startDate = updatedCurrentDate
            .clone()
            .startOf("month")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("month")
            .format("YYYY-MM-DD");
        } else if (direction === "previous") {
          updatedCurrentDate = baseDate.clone().subtract(1, "month");
          startDate = updatedCurrentDate
            .clone()
            .startOf("month")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("month")
            .format("YYYY-MM-DD");
        } else {
          updatedCurrentDate = baseDate.clone();
          startDate = updatedCurrentDate
            .clone()
            .startOf("month")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("month")
            .format("YYYY-MM-DD");
        }
        break;

      case "week":
        if (direction === "next") {
          updatedCurrentDate = baseDate.clone().add(1, "week");
          startDate = updatedCurrentDate
            .clone()
            .startOf("week")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("week")
            .format("YYYY-MM-DD");
        } else if (direction === "previous") {
          updatedCurrentDate = baseDate.clone().subtract(1, "week");
          startDate = updatedCurrentDate
            .clone()
            .startOf("week")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("week")
            .format("YYYY-MM-DD");
        } else {
          updatedCurrentDate = baseDate.clone();
          startDate = updatedCurrentDate
            .clone()
            .startOf("week")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("week")
            .format("YYYY-MM-DD");
        }
        break;

      case "day":
        if (direction === "next") {
          updatedCurrentDate = baseDate.clone().add(1, "day");
          startDate = updatedCurrentDate
            .clone()
            .startOf("day")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("day")
            .format("YYYY-MM-DD");
        } else if (direction === "previous") {
          updatedCurrentDate = baseDate.clone().subtract(1, "day");
          startDate = updatedCurrentDate
            .clone()
            .startOf("day")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("day")
            .format("YYYY-MM-DD");
        } else {
          updatedCurrentDate = baseDate.clone();
          startDate = updatedCurrentDate
            .clone()
            .startOf("day")
            .format("YYYY-MM-DD");
          endDate = updatedCurrentDate
            .clone()
            .endOf("day")
            .format("YYYY-MM-DD");
        }
        break;

      case "agenda":
        // Agenda covers only today's appointments
        updatedCurrentDate = baseDate.clone(); // Agenda does not shift the date
        startDate = updatedCurrentDate
          .clone()
          .startOf("day")
          .format("YYYY-MM-DD");
        endDate = updatedCurrentDate.clone().endOf("day").format("YYYY-MM-DD");
        break;

      default:
        // Fallback case to prevent errors
        updatedCurrentDate = baseDate.clone();
        startDate = updatedCurrentDate
          .clone()
          .startOf("day")
          .format("YYYY-MM-DD");
        endDate = updatedCurrentDate.clone().endOf("day").format("YYYY-MM-DD");
        break;
    }
    console.log(updatedCurrentDate);
    // Add the date range to the where clause
    const whereClause = {
      id_organisation: req.org_id,
      appointment_date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    };
    console.log(whereClause);
    const datafromapi = await appointmentAPI(`/list`, "get", (data = {}));
    console.log(datafromapi);
    AppointmentModal = await Appointment.findAll({
      attributes: [
        "id",
        "id_organisation",
        "patientname",
        "date",
        "time_slot",
        "s_time",
        "e_time",
        "service",
        "servicename",
        "remarks",
        "status",
        "appointment_date",
        "tele_consultation",
        "room_id",
        "live_meeting_link",

        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Appointment.appointment_date"),
            "%d/%m/%Y"
          ),
          "appointment_date_formatted",
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
      where: whereClause,
      order: [["id", "DESC"]],
      limit: datalimit,
      offset: offsetdata,    });
    
    const formattedData = AppointmentModal.map((appointment) => ({
      id: appointment.id,
      title: appointment.servicename,
      appointment_date_formatted: appointment.appointment_date_formatted,
      start: moment(
        appointment.appointment_date + " " + appointment.s_time
      ).format("YYYY-MM-DD HH:mm"),
      end: moment(
        appointment.appointment_date + " " + appointment.e_time
      ).format("YYYY-MM-DD HH:mm"),
      doctor_id: appointment.doctor,
      patient_id: appointment.patient,
      id_organisation: appointment.id_organisation,
      patient_name: appointment.patientname,
      doctor_name: appointment.id,
      service_name: appointment.servicename,
      status: appointment.status,
      tele_consultation: appointment.tele_consultation, // ✅ Ajouter ceci
      room_id: appointment.room_id, // ✅ Ajouter ceci
      live_meeting_link: appointment.live_meeting_link, // ✅ Ajouter ceci
    }));
    console.log("👉 Formatted Appointment:", formattedData[0]);

    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langAppointment.list,
        data: formattedData,
        title: startDate + " - " + endDate,
        currentDate: updatedCurrentDate.format("YYYY-MM-DD"),
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};

// 🎯 Nouvelle fonction pour filtrage avancé SCRUM-106
exports.getListFiltered = async (req, res) => {
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
      req.query.limit ? (req.query.limit == undefined ? 5 : req.query.limit) : 50
    );
    if (isNaN(datalimit)) {
      datalimit = 50;
    }    // Récupération des paramètres de filtrage
    const {
      doctor_id,
      department_id,
      time_slot,
      type = "month",
      currentDate = moment().format("YYYY-MM-DD"),
      direction = null
    } = req.query;

    // Gestion des dates comme dans getList
    const baseDate = moment(currentDate, "YYYY-MM-DD");
    let startDate, endDate, updatedCurrentDate;

    switch (type) {
      case "month":
        updatedCurrentDate = direction === "next" 
          ? baseDate.clone().add(1, "month")
          : direction === "previous" 
          ? baseDate.clone().subtract(1, "month")
          : baseDate.clone();
        startDate = updatedCurrentDate.clone().startOf("month").format("YYYY-MM-DD");
        endDate = updatedCurrentDate.clone().endOf("month").format("YYYY-MM-DD");
        break;
      case "week":
        updatedCurrentDate = direction === "next" 
          ? baseDate.clone().add(1, "week")
          : direction === "previous" 
          ? baseDate.clone().subtract(1, "week")
          : baseDate.clone();
        startDate = updatedCurrentDate.clone().startOf("week").format("YYYY-MM-DD");
        endDate = updatedCurrentDate.clone().endOf("week").format("YYYY-MM-DD");
        break;
      case "day":
        updatedCurrentDate = direction === "next" 
          ? baseDate.clone().add(1, "day")
          : direction === "previous" 
          ? baseDate.clone().subtract(1, "day")
          : baseDate.clone();
        startDate = updatedCurrentDate.clone().startOf("day").format("YYYY-MM-DD");
        endDate = updatedCurrentDate.clone().endOf("day").format("YYYY-MM-DD");
        break;
      default:
        updatedCurrentDate = baseDate.clone();
        startDate = updatedCurrentDate.clone().startOf("day").format("YYYY-MM-DD");
        endDate = updatedCurrentDate.clone().endOf("day").format("YYYY-MM-DD");
    }

    // Construction de la clause WHERE avec filtres
    const whereClause = {
      id_organisation: req.org_id,
      appointment_date: {
        [Sequelize.Op.between]: [startDate, endDate],
      },
    };    // 🎯 Ajout des filtres avancés
    if (doctor_id) {
      whereClause.doctor = doctor_id; // Utiliser le champ 'doctor' au lieu de 'added_by'
    }
    
    if (department_id) {
      whereClause.service = department_id; // Champ pour le département/service
    }    // Pour les créneaux horaires
    if (time_slot === "early_morning") {
      whereClause.s_time = { [Sequelize.Op.between]: ["06:00", "08:00"] };
    } else if (time_slot === "morning") {
      whereClause.s_time = { [Sequelize.Op.between]: ["08:00", "12:00"] };
    } else if (time_slot === "afternoon") {
      whereClause.s_time = { [Sequelize.Op.between]: ["12:00", "16:00"] };
    } else if (time_slot === "late_afternoon") {
      whereClause.s_time = { [Sequelize.Op.between]: ["16:00", "18:00"] };
    } else if (time_slot === "evening") {
      whereClause.s_time = { [Sequelize.Op.between]: ["18:00", "20:00"] };
    } else if (time_slot === "night") {
      whereClause.s_time = { [Sequelize.Op.between]: ["20:00", "22:00"] };    }

    const AppointmentModal = await Appointment.findAll({
      attributes: [
        "id",
        "id_organisation",
        "patientname",
        "doctor", // 🎯 Ajouter le champ doctor
        "date",
        "time_slot",
        "s_time",
        "e_time",
        "service",
        "servicename",
        "remarks",
        "status",
        "appointment_date",
        "tele_consultation",
        "room_id",
        "live_meeting_link",
        [
          Sequelize.fn(
            "DATE_FORMAT",
            Sequelize.col("Appointment.appointment_date"),
            "%d/%m/%Y"
          ),
          "appointment_date_formatted",
        ],
        "added_by",
        "updated_by",
      ],
      where: whereClause,      order: [["id", "DESC"]],
      limit: datalimit,
      offset: offsetdata,
    });
    
    console.log('🎯 Premier rendez-vous pour debug:', AppointmentModal[0]?.dataValues);

    const formattedData = AppointmentModal.map((appointment) => ({
      id: appointment.id,
      title: appointment.servicename || "Service",
      patient_name: `${appointment.patientname} (${appointment.appointment_date_formatted})`,
      start: `${appointment.appointment_date}T${appointment.s_time}:00`,
      end: `${appointment.appointment_date}T${appointment.e_time}:00`,
      doctor_id: appointment.doctor, // 🎯 Le vrai ID du médecin
      doctor_name: appointment.doctor, // 🎯 Utiliser le même champ
      service_id: appointment.service,
      service_name: appointment.servicename,
      status: appointment.status,
      tele_consultation: appointment.tele_consultation,
      room_id: appointment.room_id,
      live_meeting_link: appointment.live_meeting_link,
    }));    res.json({
      status: 1,
      message: `Rendez-vous filtrés récupérés`,
      data: formattedData,
      title: startDate + " - " + endDate,
      currentDate: updatedCurrentDate.format("YYYY-MM-DD"),
      total: formattedData.length,
      filters_applied: { doctor_id, department_id, time_slot }
    });
  } catch (error) {
    console.error('Erreur filtrage:', error);
    res.json({ status: 0, message: "Erreur lors du filtrage", error: error.message });
  }
};

exports.getByID = async (req, res) => {
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
        message: langAppointment.individual,
        data: AppointmentModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

const createRoom = async (roomName) => {
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        name: roomName,
        properties: {
          enable_chat: true,
          enable_knocking: false,
          exp: Math.floor(Date.now() / 1000) + 3600, // Expire in 1h
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Erreur création room Daily:",
      error.response?.data || error.message
    );
    throw new Error("Impossible de créer la room Daily");
  }
};

exports.add = async (req, res) => {
  try {
    const PatientModal = await Patient.findOne({
      where: { id: req.body.uniqueID },
    });

   // const room_id = `teleconsultation_ecomed24-${
   //   PatientModal.phone
   // }-${Math.floor(Math.random() * 444444 + 1000000)}`;

    // ✅ On crée la room via l'API Daily.co
   // await createRoom(room_id);

   // const live_meeting_link = `${process.env.URL_DAILY}=${room_id}`;
    const room_id = `appointment-test1`;
    const live_meeting_link = `${process.env.URL_DAILY}`
    const AppointmentModal = await Appointment.create({
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

    if (!AppointmentModal) {
      return res.json({ status: 0, message: langCommon.errormessage });
    }

    // (optionnel) Enregistrement API externe
    await appointmentAPI(`/add`, "post", {
      appointment_date: moment(req.body.date).format("YYYY-MM-DD"),
      start_time: req.body.s_time,
      end_time: req.body.e_time,
      service_provider_id: 1,
      service_provider_name: "Dr Sagar Sharma",
      service_provider_email: "sagar@sukritinfotech.com",
      service_provider_phone: "9999999999",
      service_id: req.body.service,
      service_name: req.body.servicename,
      client_id: req.body.uniqueID,
      client_name: PatientModal.name,
      client_email: "sagar@sukritinfotech.com",
      client_phone: PatientModal.phone,
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

    // Suppose que `appointment` vient d’être créé avec tele_consultation = 1
    if (AppointmentModal.tele_consultation === 1 && AppointmentModal.status === 1 && AppointmentModal.patient) {
      try {
        const patient = await Patient.findByPk(AppointmentModal.patient);

        if (patient?.email) {
          const template = await AutoEmailTemplate.findOne({
            where: { type: "teleconsultation_invite" },
          });

          if (!template) {
            console.warn("📭 Template 'teleconsultation_invite' non trouvé !");
          } else {
            const roomUrl =
            AppointmentModal.live_meeting_link ||
              `https://ecomed24-team.daily.co/${AppointmentModal.room_id}`;

            const BodyShortCodes = {
              patient_full_name: `${patient.name || ""} ${
                patient.last_name || ""
              }`.trim(),
              consultation_url: roomUrl,
              nom_organisation: "ecoMed24", 
            };

            const replaceShortcodes = (text, variables) => {
              for (const [key, value] of Object.entries(variables)) {
                text = text.replace(new RegExp(`{${key}}`, "g"), value);
              }
              return text;
            };

            const messageFinal = replaceShortcodes(
              template.message,
              BodyShortCodes
            );

            await Email.create({
              is_sent: null,
              subject: template.name,
              date: moment().format("YYYY-MM-DD HH:mm:ss"),
              message: messageFinal.trim(),
              reciepient: patient.email,
              attachment_path: "",
              user: req.userId,
            });

            console.log(
              "✅ Email de téléconsultation généré pour",
              patient.email
            );
          }
        } else {
          console.warn("❌ Patient email introuvable.");
        }
      } catch (error) {
        console.error("❌ Erreur envoi mail téléconsultation:", error);
      }
    }

    res.json({
      status: 1,
      message: langAppointment.add,
      data: "",
    });
  } catch (error) {
    console.error("⛔ Erreur dans exports.add :", error);
    res
      .status(500)
      .json({ status: 0, message: "Erreur serveur : " + error.message });
  }
};

exports.update = async (req, res) => {
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
        message: langAppointment.update,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.reschedule = async (req, res) => {
  try {
    let getData = [],
      getProfile = [],
      file,
      results;
    // console.log();
    // PatientModal = await Patient.findOne({where : {id:req.body.uniqueID}});

    AppointmentModal = await Appointment.update(
      {
        date: moment(req.body.date).unix(),
        time_slot: req.body.time_slot,
        s_time: req.body.s_time,
        e_time: req.body.e_time,
        s_time_key: req.body.s_time_key,
        status: req.body.status,
        appointment_date: moment(req.body.date).format("YYYY-MM-DD"),
        updated_by: req.userId,
      },
      {
        where: { id: req.params.appointment_id },
      }
    );

    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      AppointmentData = await Appointment.findOne({
        attributes: ["id", "patient"],
        where: { id: req.params.appointment_id },
      });
      console.log(AppointmentData);
      await PatientLogs.create({
        patient_id: AppointmentData.patient,
        org_id: req.org_id,
        description: "Appointment has been Rescheduled.",
        type: "appointment",
        action: "reschedule",
        relation_id: AppointmentData.id,
        status: 1,
        added_by: req.userId,
      });
      res.json({
        status: 1,
        message: langAppointment.rescheduled,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.delete = async (req, res) => {
  try {
    AppointmentModal = await Appointment.destroy({
      where: { id: req.params.appointment_id },
    });
    if (AppointmentModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      res.json({
        status: 1,
        message: langAppointment.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.status = async (req, res) => {
  try {
    AppointmentData = await Appointment.findOne({
      attributes: ["id", "patient"],
      where: { id: req.params.appointment_id },
    });
    console.log(AppointmentData);
    AppointmentModal = await Appointment.update(
      { status: req.body.status },
      { where: { id: req.params.appointment_id } }
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
        message: langAppointment.status,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.timeSlotAppontment = async (req, res) => {
  try {
    let getData = [];

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
      OR (
          :appointment_date = CURDATE()
          AND CAST(s.start_time AS TIME) > CURTIME()
      )
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

    if (TimeSlotServiceModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langAppointment.timeslots,
        data: TimeSlotServiceModal,
      });
    }
  } catch (error) {
    throw error;
  }
};

exports.createTeleconferenceLink = async (req, res) => {
  try {
    const { patientId, evenementId } = req.body;

    if (!patientId || !evenementId) {
      return res.status(400).json({
        status: 0,
        message: "Patient ID et Événement ID sont requis.",
      });
    }

    const dailyApiKey = process.env.DAILY_API_KEY;

    // 1. Créer la salle Daily
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        name: `teleconf-${Date.now()}`,
        properties: {
          exp: Math.floor(Date.now() / 1000) + 7200,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
          eject_at_room_exp: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${dailyApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const roomUrl = response.data.url;

    // 2. Stocker le lien en BDD
    const link = await TeleconferenceLink.create({
      patient_id: patientId,
      evenement_id: evenementId,
      room_url: roomUrl,
      expiration: new Date(Date.now() + 2 * 60 * 60 * 1000),
      created_by: "system",
    });

    // 3. Récupérer le patient
    const patient = await Patient.findOne({ where: { id: patientId } });

    if (patient && patient.email) {
      // 4. Charger le template email
      const template = await AutoEmailTemplate.findOne({
        where: { type: "teleconsultation_invite" },
      });

      if (!template) {
        console.error("Template 'teleconsultation_invite' non trouvé !");
      } else {
        // 5. Remplacer les shortcodes
        const BodyShortCodes = {
          patient_full_name: `${patient.name || ""} ${
            patient.last_name || ""
          }`.trim(),
          consultation_url: roomUrl,
          nom_organisation: "ecoMed24", // à remplacer dynamiquement si tu veux
        };

        const replaceShortcodes = (text, variables) => {
          for (const [key, value] of Object.entries(variables)) {
            text = text.replace(new RegExp(`{${key}}`, "g"), value);
          }
          return text;
        };

        const messageFinal = replaceShortcodes(
          template.message,
          BodyShortCodes
        );

        // 6. Enregistrer l'email dans la table
        await Email.create({
          is_sent: null,
          subject: template.name,
          date: moment().format("YYYY-MM-DD HH:mm:ss"),
          message: messageFinal.trim(),
          reciepient: patient.email,
          attachment_path: "",
          user: null, // ici pas lié à un utilisateur User mais à un Patient
        });
      }
    }

    res.json({
      status: 1,
      message:
        "Lien de téléconférence créé et email généré avec succès (si adresse email disponible).",
      data: {
        linkId: link.id,
        roomUrl: link.room_url,
      },
    });
  } catch (error) {
    console.error(
      "Erreur création lien:",
      error.response?.data || error.message
    );
    res.status(500).json({
      status: 0,
      message: "Erreur serveur lors de la création du lien.",
    });
  }
};
