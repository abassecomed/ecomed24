const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");
const JournalEntries = require("./JournalEntries");

const TransactionLine = sequelize.define(
  "TransactionLine",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: JournalEntries,
        key: "id",
      },
    },
    account_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    debit_amount: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    credit_amount: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
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
    tableName: "transaction_lines",
    timestamps: true,
    paranoid: false,
  }
);

// Associations
JournalEntries.hasMany(TransactionLine, {
  foreignKey: "transaction_id",
  as: "lines",
});

TransactionLine.belongsTo(JournalEntries, {
  foreignKey: "transaction_id",
  as: "transaction",
});

module.exports = TransactionLine;
