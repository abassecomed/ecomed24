const SampleManagement = require("../models/SampleManagement");
const Patient = require("../models/Patient");
const User = require("../models/User");

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
    const { patient_id, sample_type, test_type, priority, notes ,status} = req.body;
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
      status:0,
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
    const { sample_type, test_type, priority, notes, patient_id,status } = req.body;
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
    const existing = await SampleManagement.findByPk(id);
    if (!existing) {
      return res.status(404).json({ status: 0, message: "Data not found." });
    }
    existing.status = status;
    existing.updated_by = req.userId;
    await existing.save();
    res.json({ status: 1, message: "Status updated successfully." });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Status update failed.",
      error: error.message,
    });
  }
};
