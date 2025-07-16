const JournalEntries = require("../models/JournalEntries");
const TransactionLine = require("../models/TransactionLine");
const ChartAccount = require("../models/ChartAccount");
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

    for (const [index, line] of parsedLines.entries()) {
      const chartId = Number(line.chart_account_id);
      if (!Number.isInteger(chartId)) {
        return res.status(400).json({
          status: 0,
          message: `Invalid chart_account_id at index ${index}`,
        });
      }

      const chart = await ChartAccount.findByPk(chartId);
      if (!chart) {
        return res.status(400).json({
          status: 0,
          message: `chart_account_id ${chartId} not found at index ${index}`,
        });
      }
    }

    const transaction = await JournalEntries.create(
      {
        transaction_type,
        transaction_date,
        reference,
        description,
        source,
        status: 0,
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

    const fullTransaction = await JournalEntries.findByPk(transaction.id, {
      include: [
        {
          model: TransactionLine,
          as: "lines",
          include: [
            { model: ChartAccount, as: "chart_account" },
            {
              model: JournalEntries,
              as: "transaction",
              attributes: [
                "id",
                "transaction_type",
                "transaction_date",
                "reference",
                "source",
              ],
            },
          ],
        },
      ],
    });

    res.json({
      status: 1,
      message: "Transaction added",
      data: fullTransaction,
    });
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

    const { count, rows } = await TransactionLine.findAndCountAll({
      include: [
        {
          model: ChartAccount,
          as: "chart_account",
        },
        {
          model: JournalEntries,
          as: "transaction",
          attributes: [
            "id",
            "transaction_type",
            "transaction_date",
            "reference",
            "source",
          ],
        },
      ],

      limit: datalimit,
      offset: offsetdata,
      order: [["id", "DESC"]],
      distinct: true,
    });

    res.json({ status: 1, data: rows, total: count });
  } catch (error) {
    console.error("List fetch error:", error);
    res.status(500).json({
      status: 0,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const transaction = await JournalEntries.findByPk(id, {
      include: [
        {
          model: TransactionLine,
          as: "lines",
          include: [
            {
              model: ChartAccount,
              as: "chart_account",
            },
          ],
        },
      ],
    });

    if (!transaction)
      return res.status(404).json({ status: 0, message: "Not found" });

    res.json({ status: 1, data: transaction });
  } catch (error) {
    console.error("Get by ID error:", error);
    res.status(500).json({
      status: 0,
      message: "Error fetching transaction",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { chart_account_id, description, reference, amount, transaction } =
      req.body;

    const transactionLine = await TransactionLine.findByPk(id);
    if (!transactionLine) {
      return res
        .status(404)
        .json({ status: 0, message: "Transaction line not found" });
    }

    if (chart_account_id) {
      const chart = await ChartAccount.findByPk(chart_account_id);
      if (!chart) {
        return res
          .status(400)
          .json({ status: 0, message: "Chart account not found" });
      }
    }

    await transactionLine.update({
      chart_account_id,
      description,
      reference,
      amount,
      updated_by: req.userId,
    });

    if (transaction) {
      await JournalEntries.update(
        { ...transaction, updated_by: req.userId },
        { where: { id: transactionLine.transaction_id } }
      );
    }

    const updatedData = await TransactionLine.findByPk(id, {
      include: [
        { model: ChartAccount, as: "chart_account" },
        {
          model: JournalEntries,
          as: "transaction",
          attributes: [
            "id",
            "transaction_type",
            "transaction_date",
            "reference",
            "source",
          ],
        },
      ],
    });

    res.json({
      status: 1,
      message: "Transaction updated successfully",
      data: updatedData,
    });
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
      return res
        .status(404)
        .json({ status: 0, message: "Transaction not found" });
    }

    await TransactionLine.destroy({
      where: { transaction_id: id },
    });
    await transaction.destroy();

    res.json({ status: 1, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      status: 0,
      message: "Error deleting transaction",
      error: error.message,
    });
  }
};

exports.status = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const transaction = await TransactionLine.findByPk(id);
    if (!transaction) {
      return res
        .status(404)
        .json({ status: 0, message: "Transaction not found" });
    }

    await transaction.update({
      status,
      updated_by: req.userId,
    });

    res.json({ status: 1, message: "Transaction status updated successfully" });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      status: 0,
      message: "Error updating transaction status",
      error: error.message,
    });
  }
};
