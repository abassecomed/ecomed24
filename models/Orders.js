const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");
const Patient = require("./Patient");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Patient,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    test_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priority_level: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER, //0='pending',1='complete', 2='rejected'
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
    tableName: "orders",
    timestamps: true,
    paranoid: true,
    // deletedAt: 'deletedAt'
  }
);
Order.belongsTo(Patient, { foreignKey: "patient_id", as: "patient" });
module.exports = Order;
