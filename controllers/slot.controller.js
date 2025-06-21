const i18n = require("i18n");
const langSlotModule = i18n.__("Slots");
const langCommon = i18n.__("common");
const Sequelize = require("sequelize");
const Database = require("../config").sequelize;
const Op = Sequelize.Op;
const moment = require("moment");
moment.locale("en");

var Slot = require("../models/Slot");
var ServiceSchedule = require("../models/ServiceSchedule");
var SettingService = require("../models/SettingService");

//////Modal Relationship
// Appointment.belongsTo(Organisation, { as: "org_details", foreignKey: "org_id" });
ServiceSchedule.belongsTo(SettingService, { as: "service_details", foreignKey: "service_id" });
// schedules
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
      datalimit = 5;    }
    
    // Build search conditions
    let whereClause = { org_id: req.org_id };
    let searchConditions = [];
    
    // Add search functionality
    if (req.query.search && req.query.search.trim() !== '') {
      const searchTerm = req.query.search.trim();
      searchConditions.push({
        [Op.or]: [
          { start_time: { [Op.like]: `%${searchTerm}%` } },
          { end_time: { [Op.like]: `%${searchTerm}%` } },
          { '$service_details.name_service$': { [Op.like]: `%${searchTerm}%` } }
        ]
      });
    }

    // Add service filter
    if (req.query.service_id && req.query.service_id !== '') {
      searchConditions.push({ service_id: req.query.service_id });
    }

    // Add weekday filter
    if (req.query.weekday && req.query.weekday !== '') {
      searchConditions.push({ weekday: req.query.weekday });
    }
    
    // Combine all conditions
    if (searchConditions.length > 0) {
      whereClause[Op.and] = searchConditions;
    }const { count, rows } = await ServiceSchedule.findAndCountAll({
      attributes: [
        "id",
        "service_id",
        "start_time",
        "end_time",
        "weekday",
        "interval",
        "status",
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
      offset: offsetdata,
      include: [
        {
          model: SettingService,
          attributes: [["idservice","id"], "name_service"],
          as: "service_details",
        },
      ],
    });
    
    const SlotModal = rows;
    if (SlotModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langSlotModule.list,
        data: SlotModal,
        total: count,
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.getByID = async (req, res) => {
  try {
    let getData = [];
    SlotModal = await ServiceSchedule.findOne({
      attributes: [
        "id",
        "service_id",
        "start_time",
        "end_time",
        "weekday",
        "interval",
        "status",
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
      where: { id: req.params.id },
      include: [
        {
          model: SettingService,
          attributes: [["idservice","id"], "name_service"],
          as: "service_details",
        },
      ],
    });
    if (SlotModal === null) {
      res.json({ status: 0, message: langCommon.nodatafound });
    } else {
      res.json({
        status: 1,
        message: langSlotModule.individual,
        data: SlotModal,
      });
    }
  } catch (error) {
    throw error;
  }
};
const generateTimeSlots = async (startTime, endTime, interval) => {
  const slots = [];
  let currentTime = moment(startTime, 'HH:mm'); // Parse start time
  const endTimeMoment = moment(endTime, 'HH:mm'); // Parse end time

  while (currentTime.isBefore(endTimeMoment)) {
    const slotEndTime = moment(currentTime).add(interval, 'minutes'); // Add interval to get end time

    if (slotEndTime.isAfter(endTimeMoment)) {
      break;
    }

    slots.push({
      start_time: currentTime.format('HH:mm'),
      end_time: slotEndTime.format('HH:mm'),
    });

    currentTime = slotEndTime; // Move to the next slot
  }

  return slots;
};
exports.add = async (req, res) => {
  try {
    let doctor_id = req.body.doctor_id ? req.body.doctor_id : req.userId;

    ServiceScheduleModalExists = await ServiceSchedule.findOne({
      where: { org_id:req.org_id,service_id: req.body.service_id ,weekday: req.body.weekday},
    });
    
    if (ServiceScheduleModalExists === null) {
      
      ServiceScheduleModal = await ServiceSchedule.create({
                                    org_id: req.org_id,
                                    doctor_id: doctor_id,
                                    service_id: req.body.service_id,
                                    start_time: req.body.start_time,
                                    end_time: req.body.end_time,
                                    weekday: req.body.weekday,
                                    interval: req.body.interval,
                                    status: 1,
                                  });
        // console.log(ServiceScheduleModal);
      if (ServiceScheduleModal) {
        const timeSlots = await generateTimeSlots(req.body.start_time, req.body.end_time, req.body.interval);
        // console.log(timeSlots);
      const slotsToCreate = timeSlots.map((slot) => ({
                org_id:req.org_id,
                doctor_id,
                service_id:req.body.service_id,
                serviceschedule_id:ServiceScheduleModal.id,
                start_time: slot.start_time,
                end_time: slot.end_time,
                weekday:req.body.weekday,
                interval:req.body.interval,
                status: 1,
              }));
        SlotModal = await Slot.bulkCreate(slotsToCreate);
        // console.log(SlotModal);
        res.json({ status: 1, message: langSlotModule.add, data: "" });
      } else {
        res.json({ status: 0, message: langCommon.errormessage });
        
      }
    } else {
      res.json({ status: 0, message: "This Service already scheduled." });
    }
  } catch (error) {
    throw error;
  }
};
exports.update = async (req, res) => {
  try {
    SlotModal = await Slot.destroy({
      where: { serviceschedule_id: req.params.id },
    });
    

    if (SlotModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      ServiceScheduleModal = await ServiceSchedule.update(
        {
          start_time: req.body.start_time,
          end_time: req.body.end_time,
          interval: req.body.interval,
        },
        {
          where: { id: req.params.id },
        }
      );

      const timeSlots = await generateTimeSlots(req.body.start_time, req.body.end_time, req.body.interval);
        // console.log(timeSlots);
      const slotsToCreate = timeSlots.map((slot) => ({
                org_id:req.org_id,
                service_id:req.body.service_id,
                serviceschedule_id:ServiceScheduleModal.id,
                start_time: slot.start_time,
                end_time: slot.end_time,
                weekday:req.body.weekday,
                interval:req.body.interval,
                status: 1,
              }));
        SlotModal = await Slot.bulkCreate(slotsToCreate);

      res.json({ status: 1, message: langSlotModule.update, data: "" });
    }
  } catch (error) {
    throw error;
  }
};
exports.delete = async (req, res) => {
  try {
    SlotModal = await Slot.destroy({
      where: { serviceschedule_id: req.params.id },
    });

    if (SlotModal === null) {
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      ServiceScheduleModal = await ServiceSchedule.destroy({ where: { id: req.params.id } });
      res.json({
        status: 1,
        message: langSlotModule.deleted,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
exports.status = async (req, res) => {
  try {
    SlotModal = await Slot.update(
      { status: req.body.status },
      { where: { serviceschedule_id: req.params.id } }
    );
    if (SlotModal === null) {
      ServiceScheduleModal = await ServiceSchedule.update(
        { status: req.body.status },
        { where: { id: req.params.id } }
      );
      res.json({ status: 0, message: langCommon.errormessage });
    } else {
      
      res.json({
        status: 1,
        message: langSlotModule.status,
        data: "",
      });
    }
  } catch (error) {
    throw error;
  }
};
