const { DataTypes } = require("sequelize");
const sequelize = require("../config").sequelize;

const InvoicePayment = sequelize.define(
  "InvoicePayment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    montant: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    date_paiement: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    mode_paiement: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true, // ou false si tu veux le rendre obligatoire
    },
  },
  {
    tableName: "invoice_payments",
    timestamps: false, // on les gère manuellement
    underscored: true, // si tu veux un mapping plus clean avec les noms SQL
  }
);

module.exports = InvoicePayment;
