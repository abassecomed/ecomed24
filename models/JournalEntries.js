const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");

const JournalEntries = sequelize.define(
  "JournalEntries",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transaction_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
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
    tableName: "journal_entries",
    timestamps: true,
    paranoid: false,
  }
);

module.exports = JournalEntries;
