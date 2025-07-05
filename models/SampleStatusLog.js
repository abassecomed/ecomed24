const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");
const SampleManagement = require("./SampleManagement");

const SampleStatusLog = sequelize.define("SampleStatusLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sample_management_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SampleManagement,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  old_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  new_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "sample_status_logs",
  timestamps: true,
});

SampleStatusLog.belongsTo(SampleManagement, {
  foreignKey: "sample_management_id",
  as: "sample",
});

module.exports = SampleStatusLog;
