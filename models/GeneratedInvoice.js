const { DataTypes } = require("sequelize");
const sequelize = require("../config").sequelize;

const GeneratedInvoice = sequelize.define(
  "GeneratedInvoice",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false  
    },

    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },

    pdf_path: {
      type: DataTypes.STRING,
      allowNull: true
    },

    qr_code_path: {
      type: DataTypes.STRING,
      allowNull: true
    },

    sent_to: {
      type: DataTypes.STRING,
      allowNull: true
    },

    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    statut: {
      type: DataTypes.ENUM("PAYÉ", "EN ATTENTE DU PAIEMENT", "RETARD"),
      defaultValue: "EN ATTENTE DU PAIEMENT"
    },

    envoyee_a: {
      type: DataTypes.STRING,
      allowNull: true
    },

    envoyee_par: {
      type: DataTypes.STRING,
      allowNull: true
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "generated_invoices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = GeneratedInvoice;
