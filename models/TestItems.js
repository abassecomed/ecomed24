const { DataTypes } = require("sequelize");
const sequelize = require("../config").sequelize;
const TestRequests=require("./TestRequests");

const TestItems = sequelize.define(
  "TestItems",
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
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price:{
      type:DataTypes.FLOAT,
      allowNull:true,
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
    tableName: "test_items",
    timestamps: true, // Disable Sequelize's default timestamps
  }
);

module.exports = TestItems;
//TestItems.belongsTo(TestRequests, { foreignKey: "request_id" });
