const ChartAccount = require("../models/ChartAccount");

exports.getList = async (req, res) => {
  try {
    let offsetdata = parseInt(req.query.offset ?? 0);
    offsetdata = isNaN(offsetdata) || offsetdata < 0 ? 0 : offsetdata;
    let datalimit = parseInt(req.query.limit ?? 5);
    datalimit = isNaN(datalimit) || datalimit <= 0 ? 5 : datalimit;
    const { count, rows } = await ChartAccount.findAndCountAll({
      include: [
        {
          model: ChartAccount,
          as: "parent",
          attributes: ["id", "code", "name", "type", "parent_account"],
        },
      ],
      order: [["id", "DESC"]],
      attributes: [
        "id",
        "code",
        "name",
        "type",
        "parent_account",
        "added_by",
        "updated_by",
      ],
    });
    if (rows.length === 0) {
      res.json({
        status: 0,
        message: "No chart account data available",
      });
    } else {
      res.json({
        status: 1,
        message: "Chart account list retrieved successfully",
        data: rows,
        total: count,
      });
    }
  } catch (error) {
    console.error("Error fetching lab tubes:", error);
    res
      .status(500)
      .json({ status: 0, message: "Server error", error: error.message });
  }
};

exports.add = async (req, res) => {
  try {
    const { code, name, type, parent_account } = req.body;

    if (parent_account) {
      const parent = await ChartAccount.findByPk(parent_account);
      if (!parent) {
        return res.json({
          status: 0,
          message: "Parent account not found",
        });
      }
    }

    const newAccount = await ChartAccount.create({
      code,
      name,
      type,
      parent_account,
      added_by: req.userId,
    });

    res.json({
      status: 1,
      message: "Chart account added successfully",
      data: newAccount,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Server error during add",
      error: error.message,
    });
  }
};

exports.getByID = async (req, res) => {
  try {
    const id = req.params.id;
    const account = await ChartAccount.findOne({
      where: { id },
      include: [
        {
          model: ChartAccount,
          as: "parent",
          attributes: ["id", "code", "name", "type", "parent_account"],
        },
      ],
    });

    if (!account) {
      return res.json({ status: 0, message: "Chart account not found" });
    }

    res.json({
      status: 1,
      message: "Chart account retrieved successfully",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Server error during getByID",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, type, parent_account } = req.body;

    const account = await ChartAccount.findByPk(id);

    if (!account) {
      return res.json({ status: 0, message: "Chart account not found" });
    }

    // Check if parent_account exists (if provided)
    if (parent_account) {
      const parent = await ChartAccount.findByPk(parent_account);
      if (!parent) {
        return res.json({
          status: 0,
          message: "Parent account not found",
        });
      }
    }

    await account.update({
      code,
      name,
      type,
      parent_account,
      updated_by: req.userId,
    });

    res.json({
      status: 1,
      message: "Chart account updated successfully",
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Server error during update",
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await ChartAccount.findByPk(id);

    if (!account) {
      return res.json({ status: 0, message: "Chart account not found" });
    }

    await account.destroy();

    res.json({
      status: 1,
      message: "Chart account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Server error during delete",
      error: error.message,
    });
  }
};
