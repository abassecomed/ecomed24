const TestCatalog = require("../models/TestCatalog");

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
      return res.json({ status: 0, message: "Test not found" });
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
