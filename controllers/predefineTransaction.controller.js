const PredefineTransaction=require("../models/PredefineTransaction");
const AccountLine= require("../models/AccountLine");

exports.add= async (req, res)=>{
    try{
       const {
        tamplate_name,
        category,
        description,
        default_source,
        account_line
       }=req.body;
    let parsedLines;
    console.log(typeof account_line, "account_line")

    if (Array.isArray(account_line)) {
      parsedLines = account_line;
    } else if (typeof account_line === "string") {
      try {
        parsedLines = JSON.parse(account_line);
      } catch (err) {
        return res.status(400).json({
          status: 0,
          message: "account_line must be valid JSON",
        });
      }
    } else {
      return res.status(400).json({
        status: 0,
        message: "account_line must be an array or JSON string",
      });
    }

    if (!Array.isArray(parsedLines)) {
      return res.status(400).json({
        status: 0,
        message: "Parsed account_line must be an array",
      });
    }
    const predefine_transaction= await  PredefineTransaction.create(
        {
        tamplate_name,
        category,
        description,
        default_source,
         added_by: req.userId,
          lines: parsedLines.map((line) => ({
          ...line,
          added_by: req.userId,
        })),
        },
        {
            include:[{model:AccountLine, as:"lines"}],
        }
    );
    res.json({ status: 1, message: "Predefine Transaction added", data: predefine_transaction });    
    }catch (error) {
    console.error("Error adding predefine transaction:", error);
    res.status(500).json({
      status: 0,
      message: "Error adding predefine transaction",
      error: error.message,
    });
  }
};

exports.getList = async (req, res) => {
  try {
     let offsetdata = parseInt(req.query.offset ?? 0);
    offsetdata = isNaN(offsetdata) || offsetdata < 0 ? 0 : offsetdata;
    let datalimit = parseInt(req.query.limit ?? 5);
    datalimit = isNaN(datalimit) || datalimit <= 0 ? 5 : datalimit;
    const {count, rows} = await PredefineTransaction.findAndCountAll({
      include: [{ model: AccountLine, as: "lines" }],
      order: [["id", "DESC"]],
       distinct: true,
    });

    res.json({ status: 1 ,message: "List fetched successfully",data:rows,total:count});
  } catch (error) {
    console.error("Error fetching list:", error);
    res.status(500).json({ status: 0, message: "Server error", error: error.message });
  }
};

exports.getByID = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await PredefineTransaction.findOne({
      where: { id },
      include: [{ model: AccountLine, as: "lines" }],
    });

    if (!data) {
      return res.status(404).json({ status: 0, message: "Record not found" });
    }

    res.json({ status: 1, message: "Data fetched", data });
  } catch (error) {
    console.error("Error fetching by ID:", error);
    res.status(500).json({ status: 0, message: "Server error", error: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tamplate_name,
      category,
      description,
      default_source,
      account_line
    } = req.body;

    const predefineTransaction = await PredefineTransaction.findByPk(id);
    if (!predefineTransaction) {
      return res.status(404).json({ status: 0, message: "Transaction not found" });
    }

    await PredefineTransaction.update(
      {
        tamplate_name,
        category,
        description,
        default_source,
        updated_by: req.userId,
      },
      { where: { id } }
    );

    let parsedLines = Array.isArray(account_line)
      ? account_line
      : typeof account_line === "string"
      ? JSON.parse(account_line)
      : [];

    await AccountLine.destroy({ where: { predefine_transaction_id: id } });

    const newLines = parsedLines.map((line) => ({
      ...line,
      predefine_transaction_id: id,
      added_by: req.userId,
    }));

    await AccountLine.bulkCreate(newLines);

    res.json({ status: 1, message: "Updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ status: 0, message: "Update failed", error: error.message });
  }
};
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await PredefineTransaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ status: 0, message: "Record not found" });
    }

    await AccountLine.destroy({ where: { predefine_transaction_id: id } });
    await PredefineTransaction.destroy({ where: { id } });

    res.json({ status: 1, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ status: 0, message: "Delete failed", error: error.message });
  }
};



