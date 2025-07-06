const Patient = require("../models/Patient");
const User = require("../models/User");
var Order = require("../models/Orders");
var TestRequests = require("../models/TestRequests");
var PatientLogs = require("../models/PatientLogs");
var TestItems = require("../models/TestItems");
const BASEURL = process.env.SITE_URL;

Order.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
Order.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});

exports.getList = async (req, res) => {
  try {
    let offsetdata = parseInt(req.query.offset ?? 0);
    offsetdata = isNaN(offsetdata) || offsetdata < 0 ? 0 : offsetdata;
    let datalimit = parseInt(req.query.limit ?? 5);
    datalimit = isNaN(datalimit) || datalimit <= 0 ? 5 : datalimit;
    const { count, rows } = await Order.findAndCountAll({
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "last_name", "email", "address", "phone"],
        },
      ],
      attributes: [
        "id",
        "test_type",
        "priority_level",
        "status",
        "added_by",
        "updated_by",
      ],
    });

    if (rows.length === 0) {
      res.json({ status: 0, message: "Orders list No available." });
    } else {
      res.json({
        status: 1,
        message: "Orders list retrieved successfully.",
        data: rows,
        total: count,
      });
    }
  } catch (error) {
    console.error("Error fetching Orders list:", error);
    res.status(500).json({
      status: 0,
      message: "Failed to retrieve Orders list.",
      error: error.message,
    });
  }
};
exports.getByID = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({
      where: { id },
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "last_name", "email", "address", "phone"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ status: 0, message: "Order not found." });
    }

    res.json({
      status: 1,
      message: "Order retrieved successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res
      .status(500)
      .json({
        status: 0,
        message: "Failed to retrieve order.",
        error: error.message,
      });
  }
};

exports.add = async (req, res) => {
  try {
    const { patient_id, test_type, priority_level } = req.body;

    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(404).json({
        status: 0,
        message: "Invalid patient ID. Patient not found.",
      });
    }
    const order = await Order.create({
      patient_id,
      test_type,
      priority_level,
      status: 0,
      added_by: req.userId,
    });

    res.json({ status: 1, message: "Order added successfully.", data: order });
  } catch (error) {
    console.error("Error adding order:", error);
    res
      .status(500)
      .json({
        status: 0,
        message: "Failed to add order.",
        error: error.message,
      });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { patient_id, test_type, priority_level, status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ status: 0, message: "Order not found." });
    }

    await order.update({
      patient_id,
      test_type,
      priority_level,
      status,
      updated_by: req.userId,
    });

    res.json({
      status: 1,
      message: "Order updated successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res
      .status(500)
      .json({
        status: 0,
        message: "Failed to update order.",
        error: error.message,
      });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ status: 0, message: "Order not found." });
    }

    await order.destroy(); // this will do soft delete due to paranoid:true
    res.json({ status: 1, message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    res
      .status(500)
      .json({
        status: 0,
        message: "Failed to delete order.",
        error: error.message,
      });
  }
};

exports.status = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ status: 0, message: "Order not found." });
    }

    await order.update({ status, updated_by: req.userId });
    res.json({ status: 1, message: "Order status updated successfully." });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({
        status: 0,
        message: "Failed to update order status.",
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
