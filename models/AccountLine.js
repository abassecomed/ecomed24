const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");
const PredefineTransaction = require("./PredefineTransaction");

const AccountLine = sequelize.define(
  "AccountLine",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    predefine_transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PredefineTransaction,
        key: "id",
      },
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    default_memo: {
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
    tableName: "account_lines",
    timestamps: true,
    paranoid: false,
  }
);


PredefineTransaction.hasMany(AccountLine, {
  foreignKey: "predefine_transaction_id",
  as: "lines",
});

AccountLine.belongsTo(PredefineTransaction, {
  foreignKey: "predefine_transaction_id",
  as: "transaction",
});

module.exports = AccountLine;
