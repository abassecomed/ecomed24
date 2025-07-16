const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");
const JournalEntries = require("./JournalEntries");
const ChartAccount = require("./ChartAccount");

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
   chart_account_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: ChartAccount,
    key: "id",
  },
},
    memo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount:{
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    status:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0, // 0=pending, 1=Approved, 2=Rejected
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

JournalEntries.hasMany(TransactionLine, {
  foreignKey: "transaction_id",
  as: "lines",
});

TransactionLine.belongsTo(JournalEntries, {
  foreignKey: "transaction_id",
  as: "transaction",
});
TransactionLine.belongsTo(ChartAccount, {
  foreignKey: "chart_account_id",
  as: "chart_account",
});

module.exports = TransactionLine;
