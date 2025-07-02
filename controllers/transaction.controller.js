const JournalEntries = require("../models/JournalEntries");
const TransactionLine = require("../models/TransactionLine");
const User = require("../models/User");

JournalEntries.belongsTo(User, {
  as: "addedby_details",
  foreignKey: "added_by",
});
JournalEntries.belongsTo(User, {
  as: "updatedby_details",
  foreignKey: "updated_by",
});

exports.add = async (req, res) => {
  try {
    const {
      transaction_type,
      transaction_date,
      reference,
      description,
      source,
      transaction_lines,
    } = req.body;

    let parsedLines;
    console.log(typeof transaction_lines, "transaction_lines")

    if (Array.isArray(transaction_lines)) {
      parsedLines = transaction_lines;
    } else if (typeof transaction_lines === "string") {
      try {
        parsedLines = JSON.parse(transaction_lines);
      } catch (err) {
        return res.status(400).json({
          status: 0,
          message: "transaction_lines must be valid JSON",
        });
      }
    } else {
      return res.status(400).json({
        status: 0,
        message: "transaction_lines must be an array or JSON string",
      });
    }

    if (!Array.isArray(parsedLines)) {
      return res.status(400).json({
        status: 0,
        message: "Parsed transaction_lines must be an array",
      });
    }

    const transaction = await JournalEntries.create(
      {
        transaction_type,
        transaction_date,
        reference,
        description,
        source,
        added_by: req.userId,
        lines: parsedLines.map((line) => ({
          ...line,
          added_by: req.userId,
        })),
      },
      {
        include: [{ model: TransactionLine, as: "lines" }],
      }
    );

    res.json({ status: 1, message: "Transaction added", data: transaction });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({
      status: 0,
      message: "Error adding transaction",
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
    const {count, rows} = await JournalEntries.findAndCountAll({
      include: [{ model: TransactionLine, as: "lines"}],
      order: [["id", "DESC"]],
      distinct: true,
    });
    res.json({ status: 1, data: rows,total:count });
  } catch (error) {
    res
      .status(500)
      .json({ status: 0, message: "Error fetching transactions", error });
  }
};


exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const transaction = await JournalEntries.findByPk(id, {
      include: [{ model: TransactionLine, as: "lines" }],
    });
    if (!transaction)
      return res.status(404).json({ status: 0, message: "Not found" });

    res.json({ status: 1, data: transaction });
  } catch (error) {
    res
      .status(500)
      .json({ status: 0, message: "Error fetching transaction", error });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      transaction_type,
      transaction_date,
      reference,
      description,
      source,
      transaction_lines,
    } = req.body;

    const transaction = await JournalEntries.findByPk(id);
    if (!transaction)
      return res.status(404).json({ status: 0, message: "Not found" });

    await transaction.update({
      transaction_type,
      transaction_date,
      reference,
      description,
      source,
      updated_by: req.userId, 
    });

    if (transaction_lines && Array.isArray(transaction_lines)) {
      await TransactionLine.destroy({ where: { transaction_id: id } });

      for (const line of transaction_lines) {
        await TransactionLine.create({
          ...line,
          transaction_id: id,
          added_by: req.userId,
        });
      }
    }

    res.json({ status: 1, message: "Transaction updated" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      status: 0,
      message: "Error updating transaction",
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const transaction = await JournalEntries.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ status: 0, message: "Transaction not found" });
    }

    await TransactionLine.destroy({
      where: { transaction_id: id }
    });
    await transaction.destroy();

    res.json({ status: 1, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      status: 0,
      message: "Error deleting transaction",
      error: error.message
    });
  }
};
