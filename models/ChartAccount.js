const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");

const ChartAccount = sequelize.define(
  "ChartAccount",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    parent_account: {
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
    tableName: "chart_accounts",
    timestamps: true,
    paranoid: true,
  }
);

ChartAccount.hasMany(ChartAccount, {
  foreignKey: "parent_account",
  as: "children",
});

ChartAccount.belongsTo(ChartAccount, {
  foreignKey: "parent_account",
  as: "parent",
});
module.exports = ChartAccount;
