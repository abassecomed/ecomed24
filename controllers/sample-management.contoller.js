const SampleManagement = require("../models/SampleManagement");
const SampleStatusLog = require("../models/SampleStatusLog");
const Patient = require("../models/Patient");
const User = require("../models/User");
var TestRequests = require("../models/TestRequests");
var PatientLogs = require("../models/PatientLogs");
var TestItems = require("../models/TestItems");
const BASEURL = process.env.SITE_URL;

SampleManagement.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
SampleManagement.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});

exports.getList = async (req, res) => {
  try {
    let offsetdata = parseInt(req.query.offset ?? 0);
    offsetdata = isNaN(offsetdata) || offsetdata < 0 ? 0 : offsetdata;
    let datalimit = parseInt(req.query.limit ?? 5);
    datalimit = isNaN(datalimit) || datalimit <= 0 ? 5 : datalimit;
    const { count, rows } = await SampleManagement.findAndCountAll({
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "last_name", "email", "address", "phone"],
        },
      ],
      attributes: [
        "id",
        "sample_type",
        "test_type",
        "priority",
        "notes",
        "status",
        "added_by",
        "updated_by",
      ],
    });

    if (rows.length === 0) {
      res.json({ status: 0, message: "No sample management list available." });
    } else {
      res.json({
        status: 1,
        message: "Sample management list retrieved successfully.",
        data: rows,
        total: count,
      });
    }
  } catch (error) {
    console.error("Error fetching sample management:", error);
    res.status(500).json({
      status: 0,
      message: "Failed to retrieve sample management.",
      error: error.message,
    });
  }
};

exports.getByID = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await SampleManagement.findOne({
      where: { id },
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "last_name", "email", "address", "phone"],
        },
      ],
    });

    if (!data) {
      return res.status(404).json({ status: 0, message: "Data not found." });
    }

    res.json({ status: 1, data });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error retrieving data.",
      error: error.message,
    });
  }
};

exports.add = async (req, res) => {
  try {
    const { patient_id, sample_type, test_type, priority, notes, status } =
      req.body;
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({
        status: 0,
        message: "Invalid patient ID. Patient not found.",
      });
    }
    const newData = await SampleManagement.create({
      patient_id,
      sample_type,
      test_type,
      priority,
      notes,
      status: 0,
      added_by: req.userId,
    });

    res.json({ status: 1, message: "Data added successfully.", data: newData });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Failed to add data.",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await SampleManagement.findByPk(id);
    if (!existing) {
      return res.status(404).json({ status: 0, message: "Data not found." });
    }
    const { sample_type, test_type, priority, notes, patient_id, status } =
      req.body;
    await existing.update({
      sample_type,
      test_type,
      priority,
      notes,
      status,
      patient_id,
      updated_by: req.userId,
    });
    res.json({ status: 1, message: "Data updated successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ status: 0, message: "Update failed.", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await SampleManagement.findByPk(id);

    if (!existing) {
      return res.status(404).json({ status: 0, message: "Data not found." });
    }
    await existing.destroy();
    res.json({ status: 1, message: "Data deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ status: 0, message: "Delete failed.", error: error.message });
  }
};

exports.status = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const validStatuses = [0, 1, 2, 3, 4];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 0,
        message: "Invalid status value. Must be between 0 and 4.",
      });
    }
    const existing = await SampleManagement.findByPk(id);
    if (!existing) {
      return res.status(404).json({ status: 0, message: "Data not found." });
    }
    const oldStatus = existing.status;
    existing.status = status;
    existing.updated_by = req.userId;
    await existing.save();

    await SampleStatusLog.create({
      sample_management_id: id,
      old_status: oldStatus,
      new_status: status,
      updated_by: req.userId,
    });

    res.json({ status: 1, message: "Status updated and logged successfully." });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Status update failed.",
      error: error.message,
    });
  }
};

exports.addLabTest = async (req, res) => {
  try {
    let getData = [],
      results;
    const reports = req.body.reports;

    const PatientModal = await Patient.findOne({
      where: { id: req.body.patient_id },
    });

    const TestRequestsModal = await TestRequests.create({
      patient_id: req.body.patient_id,
      org_id: req.org_id,
      type: "lab",
      advice: req.body.advice,
      reports: reports,
      status: 0,
      added_by: req.userId,
    });

    if (!TestRequestsModal) {
      return res.json({ status: 0, message: "error" });
    }

    for (const report of reports) {
      await TestItems.create({
        patient_id: req.body.patient_id,
        org_id: req.org_id,
        request_id: TestRequestsModal.id,
        test_id: report.id,
        name: report.name,
        type: report.type,
        price: report.price,
        status: 1,
        added_by: req.userId,
      });
    }

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

    res.json({
      status: 1,
      message: "Lab test added successfully",
      data: TestRequestsModal,
    });
  } catch (error) {
    console.error("Error in addLabTest:", error);
    res.status(500).json({ status: 0, message: "Server error", error });
  }
};

exports.getLabTestList = async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const labTests = await TestRequests.findAndCountAll({
      where: {
        org_id: req.org_id,
        type: "lab",
      },
      order: [["id", "DESC"]],
      offset: offset,
      limit: limit,
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "email"],
        },
        {
          model: TestItems,
          as: "test_items",
          attributes: ["id", "name", "type", "price", "status"],
        },
      ],
    });

    res.json({
      status: 1,
      message: "Lab Test List fetched successfully",
      data: labTests.rows,
      total: labTests.count,
    });
  } catch (error) {
    console.error("Error in getLabTestList:", error);
    res.status(500).json({ status: 0, message: "Server error", error });
  }
};

exports.getLabTestByID = async (req, res) => {
  try {
    const request_id = req.params.id;

    if (!request_id) {
      return res.status(400).json({ status: 0, message: "Invalid Request ID" });
    }

    const testRequest = await TestRequests.findOne({
      where: {
        id: request_id,
        type: "lab",
      },
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "email"],
        },
        {
          model: TestItems,
          as: "test_items",
          attributes: ["id", "name", "type", "price", "status"],
        },
      ],
    });

    if (!testRequest) {
      return res.json({ status: 0, message: "No Lab Test found with this ID" });
    }

    res.json({
      status: 1,
      message: "Lab Test fetched successfully",
      data: testRequest,
      url: BASEURL + "/uploads/invoicefile/",
    });
  } catch (error) {
    console.error("Error in getLabTestByID:", error);
    res.status(500).json({ status: 0, message: "Server error", error });
  }
};
