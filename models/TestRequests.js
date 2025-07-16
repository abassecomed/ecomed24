const { DataTypes } = require("sequelize");
const sequelize = require("../config").sequelize;
const TestItems=require("./TestItems");
const Patient=require("./Patient")
const TestRequests = sequelize.define(
  "TestRequests",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    advice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reports: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clinical_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "test_requests",
    timestamps: true, // Disable Sequelize's default timestamps
  }
);

TestRequests.hasMany(TestItems, { foreignKey: "request_id", as:'test_items' });
TestRequests.belongsTo(Patient, { foreignKey: "patient_id", as:'patient' });

module.exports = TestRequests;
