const { DataTypes } = require("sequelize");
const sequelize = require("../config").sequelize;

const Invoice = sequelize.define(
  "Invoice",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: { type: DataTypes.STRING, allowNull: false, unique: true },
    date_facture: { type: DataTypes.DATE, allowNull: false },
    envoyee_a: { type: DataTypes.STRING },
    par: { type: DataTypes.STRING },
    montant: { type: DataTypes.DECIMAL(10, 2) },
    id_organisation_origine: {
      type: DataTypes.STRING, // ou INTEGER si c’est une FK
    },
    id_organisation_destinataire: {
      type: DataTypes.STRING,
    },

    statut: {
      type: DataTypes.ENUM("PAYÉ", "EN ATTENTE DU PAIEMENT", "RETARD"),
      defaultValue: "EN ATTENTE DU PAIEMENT",
    },
    notes: { type: DataTypes.TEXT },
    pdf_path: { type: DataTypes.STRING },
    email_envoye: { type: DataTypes.STRING }, // Stocke les emails séparés par des
  },
  {
    tableName: "invoices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Invoice;
