const TestCatalog = require("../models/TestCatalog");
var Patient = require("../models/Patient");
var TestRequests = require("../models/TestRequests");
var PatientLogs = require("../models/PatientLogs");
var TestItems = require("../models/TestItems");

const BASEURL = process.env.SITE_URL;


exports.getList =async (req, res)=>{
    try{
           let offsetdata = parseInt(req.query.offset ?? 0);
    offsetdata = isNaN(offsetdata) || offsetdata < 0 ? 0 : offsetdata;
    let datalimit = parseInt(req.query.limit ?? 5);
    datalimit = isNaN(datalimit) || datalimit <= 0 ? 5 : datalimit;
    const {count, rows}=await TestCatalog.findAndCountAll({
        attributes:[
            "id",
            "code",
            "analysis_name",
            "specialty",
            "sample_type",
            "parameters",
            "price",
            "status",
            "added_by",
            "updated_by"
        ]
    });
    if(rows.length===0){
        res.json({status:0, message:"Test catalog list no availabe."});
    }else{
        res.json({
            status:1,
            message:"Test catalog list retrived successfully.",
            data:rows,
            total:count,
        })
    }
    }catch(error){
         console.error("Error fetching Test catalog list:", error);
    res.status(500).json({
      status: 0,
      message: "Failed to retrieve Test catalog list.",
      error: error.message,
        });
    }
}
exports.getByID = async (req, res) => {
  try {
    const test = await TestCatalog.findByPk(req.params.id);

    if (!test) {
      return res.status(404).json({ status: 0, message: "Test not found" });
    }

    res.json({ status: 1, message: "Test retrieved", data: test });
  } catch (error) {
    res.status(500).json({ status: 0, message: "Error fetching test", error: error.message });
  }
};

exports.add = async (req, res) => {
  try {
    const {
      code,
      analysis_name,
      specialty,
      sample_type,
      parameters,
      price
    } = req.body;

    const newTest = await TestCatalog.create({
      code,
      analysis_name,
      specialty,
      sample_type,
      parameters,
      price,
      status: 0,
      added_by: req.userId,
    });

    res.json({ status: 1, message: "Test catalog added successfully", data: newTest });
  } catch (error) {
    res.status(500).json({ status: 0, message: "Failed to add test", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const test = await TestCatalog.findByPk(id);

    if (!test) {
      return res.json({ status: 0, message: "Test catalog not found" });
    }

    await test.update({
      ...req.body,
      updated_by: req.userId,
    });

    res.json({ status: 1, message: "Test catalog updated successfully", data: test });
  } catch (error) {
    res.status(500).json({ status: 0, message: "Update failed", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const test = await TestCatalog.findByPk(id);
    if (!test) {
      return res.json({ status: 0, message: "Test catalog not found" });
    }

    await test.destroy();

    res.json({ status: 1, message: "Test catalog deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: 0, message: "Delete failed", error: error.message });
  }
};


exports.status = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const test = await TestCatalog.findByPk(id);
    if (!test) {
      return res.status(400).json({ status: 0, message: "Test catalog not found" });
    }

    await test.update({ status });

    res.json({ status: 1, message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ status: 0, message: "Status update failed", error: error.message });
  }
};


exports.addLabTest = async (req, res) => {
  try {
    let getData = [], results;
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
      return res.json({ status: 0, message:"error" });
    }

    for (const report of reports) {
      await TestItems.create({
        patient_id: req.body.patient_id,
        org_id: req.org_id,
        request_id: TestRequestsModal.id,
        test_id: report.id,
        name: report.name,
        type: report.type,
        price:report.price,
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

    res.json({ status: 1, message: "Lab test added successfully", data: TestRequestsModal });
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
        type: "lab"
      },
      order: [["id", "DESC"]],
      offset: offset,
      limit: limit,
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["id", "name", "email"]
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
      total: labTests.count
    });

  } catch (error) {
    console.error("Error in getLabTestList:", error);
    res.status(500).json({ status: 0, message: "Server error", error });
  }
};




exports.getLabTestByID = async (req, res) => {
  try {
    const request_id = req.params.id;
    console.log("params:", request_id);

    if (!request_id) {
      return res.status(400).json({ status: 0, message: "Invalid Request ID" });
    }

    const testRequest = await TestRequests.findOne({
      where: {
        id: request_id,
        type: "lab"
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
          attributes: ["id", "name", "type",  "price", "status"],
        }
      ]
    });

    if (!testRequest) {
      return res.json({ status: 0, message: "No Lab Test found with this ID" });
    }

    res.json({
      status: 1,
      message: "Lab Test fetched successfully",
      data: testRequest,
      url: BASEURL + "/uploads/invoicefile/"
    });
  } catch (error) {
    console.error("Error in getLabTestByID:", error);
    res.status(500).json({ status: 0, message: "Server error", error });
  }
};


