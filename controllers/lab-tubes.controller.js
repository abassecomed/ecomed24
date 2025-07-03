const Sequelize = require("sequelize");
var User = require("../models/User");
var LabTube = require("../models/LabTubes");
LabTube.belongsTo(User, { as: "addedby_details", foreignKey: "added_by" });
LabTube.belongsTo(User, { as: "updatedby_details", foreignKey: "updated_by" });
const { sequelize } = require("../config");
const BASEURL = process.env.SITE_URL;


exports.getList = async (req, res) => {
  try {
    let offset = parseInt(req.query.offset ?? 0);
    let limit = parseInt(req.query.limit ?? 5);
    const search = req.query.search || "";
    const statusFilter = req.query.status;

    let where = {};
    if (search) {
      where[Sequelize.Op.or] = [
        { name: { [Sequelize.Op.like]: `%${search}%` } },
        { tube_type: { [Sequelize.Op.like]: `%${search}%` } },
        { material: { [Sequelize.Op.like]: `%${search}%` } },
        { barcode: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }
    // if (statusFilter !== undefined) where.status = statusFilter;

    if (statusFilter !== undefined) {
      where.status = statusFilter;
    } else {
      where.status = 1;
    }
    const { count, rows } = await LabTube.findAndCountAll({
      where,
      attributes: [
        "id",
        "name",
        "color_code",
        "additive",
        "volume",
        "tube_type",
        "material",
        "cap_type",
        "storage_temperature",
        "expiration_period",
        "barcode",
        "image",
        "notes",
        "status",
        "added_by",
        "updated_by",
      ],

      order: [["id", "DESC"]],
      limit,
      offset,
    });

    res.json({
      status: rows.length ? 1 : 0,
      message: rows.length
        ? "Lab tubes retrieved successfully."
        : "No Lab tubes available.",
      data: rows,
      total: count,
      //   pagination: {
      //     limit,
      //     offset,
      //     totalPages: Math.ceil(count / limit),
      //     currentPage: Math.floor(offset / limit) + 1
      //   }
    });
  } catch (error) {
    console.error("Error fetching lab tubes:", error);
    res
      .status(500)
      .json({ status: 0, message: "Server error", error: error.message });
  }
};

// exports.add = async (req, res) => {
//   try {
//     const {
//       name,
//       color_code,
//       additive,
//       volume,
//       tube_type,
//       material,
//       cap_type,
//       storage_temperature,
//       expiration_period,
//       barcode,
//       notes,
//       status = 1,
//     } = req.body;

//     if (!name || !tube_type || !material) {
//       return res.status(400).json({
//         status: 0,
//         message: "Name, tube type, and material are required fields.",
//       });
//     }

//     if (barcode) {
//       const existingTube = await LabTube.findOne({ where: { barcode } });
//       if (existingTube) {
//         return res.status(400).json({
//           status: 0,
//           message: "Lab tube with this barcode already exists.",
//         });
//       }
//     }

//     let image_url = null;
//     if (req.file) {
//       image_url = req.file.filename;
//     }

//     const newLabTube = await LabTube.create({
//       name,
//       color_code,
//       additive,
//       volume,
//       tube_type,
//       material,
//       cap_type,
//       storage_temperature,
//       expiration_period,
//       barcode,
//       image: image_url,
//       notes,
//       status,
//       added_by: req.userId,
//     });

//     if (newLabTube === null) {
//       res.json({
//         status: 0,
//         message: "Error during add lab tubes",
//         data: "",
//       });
//     } else {
//       res.json({
//         status: 1,
//         message: "Lab tubes added successfully",
//         data: [newLabTube],
//       });
//     }
//   } catch (error) {
//     console.error("Error adding lab tube:", error);
//     return res.status(500).json({
//       status: 0,
//       message: "Failed to add lab tube.",
//       error: error.message,
//     });
//   }
// };


exports.add = async (req, res) => {
  try {
    const {
      name,
      color_code,
      additive,
      volume,
      tube_type,
      material,
      cap_type,
      storage_temperature,
      expiration_period,
      barcode,
      notes,
      status = 1,
    } = req.body;

    if (!name || !tube_type || !material) {
      return res.status(400).json({
        status: 0,
        message: "Name, tube type, and material are required fields.",
      });
    }

    if (barcode) {
      const existingTube = await LabTube.findOne({ where: { barcode } });
      if (existingTube) {
        return res.status(400).json({
          status: 0,
          message: "Lab tube with this barcode already exists.",
        });
      }
    }

    let image_url = null;
    if (req.file) {
      image_url = `${BASEURL}/uploads/lab-tubes/${req.file.filename}`;
    }

    const newLabTube = await LabTube.create({
      name,
      color_code,
      additive,
      volume,
      tube_type,
      material,
      cap_type,
      storage_temperature,
      expiration_period,
      barcode,
      image: image_url,
      notes,
      status,
      added_by: req.userId,
    });

    res.json({
      status: 1,
      message: "Lab tubes added successfully",
      data: [newLabTube],
    });
  } catch (error) {
    console.error("Error adding lab tube:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to add lab tube.",
      error: error.message,
    });
  }
};
exports.getById = async (req, res) => {
  try {
    const tube = await LabTube.findByPk(req.params.id, {
      attributes: [
        "id",
        "name",
        "color_code",
        "additive",
        "volume",
        "tube_type",
        "material",
        "cap_type",
        "storage_temperature",
        "expiration_period",
        "barcode",
        "image",
        "notes",
        "status",
        "added_by",
        "updated_by",
      ],
    });
    if (!tube) return res.status(404).json({ status: 0, message: "Not found" });
    res.json({ status: 1, message: "Retrieved successfully", data: tube });
  } catch (error) {
    res.status(500).json({ status: 0, message: "Error", error: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const existing = await LabTube.findByPk(id);
    if (!existing)
      return res.status(404).json({ status: 0, message: "Not found" });

    // Handle barcode duplicate
    if (data.barcode && data.barcode !== existing.barcode) {
      const dupe = await LabTube.findOne({
        where: { barcode: data.barcode, id: { [Sequelize.Op.ne]: id } },
      });
      if (dupe) {
        return res.status(400).json({
          status: 0,
          message: "Barcode already in use.",
        });
      }
    }

    if (req.file) {
      data.image = req.file.filename;
    }

    data.updated_by = req.userId;

    await LabTube.update(data, { where: { id } });

    const updated = await LabTube.findByPk(id);
    res.json({ status: 1, message: "Updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Update failed",
      error: error.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const permanent = req.query.permanent === "true";
    const userId = req.userId;

    const tube = await LabTube.findByPk(id);

    if (!tube || tube.status === 0) {
      return res
        .status(404)
        .json({ status: 0, message: "Lab tube already deleted or not found." });
    }

    if (permanent) {
      await LabTube.destroy({ where: { id } });
    } else {
      await LabTube.update(
        { status: 0, updated_by: userId },
        { where: { id } }
      );
    }

    res.json({
      status: 1,
      message: `Lab tube ${permanent ? "permanently " : ""}deleted.`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 0, message: "Delete failed", error: error.message });
  }
};

exports.status = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const existing = await LabTube.findByPk(id);
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
