const { DataTypes } = require('sequelize');
const sequelize = require('../config').sequelize;

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoice_id: { type: DataTypes.INTEGER },
  description: { type: DataTypes.STRING },
  beneficiaire: { type: DataTypes.STRING },
  reference: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  unit_price: { type: DataTypes.DECIMAL(10, 2) },
  total: { type: DataTypes.DECIMAL(10, 2) },
  service_code: { type: DataTypes.STRING },
  statut: {
  type: DataTypes.ENUM('LIBRE', 'FACTURÉ'),
  defaultValue: 'LIBRE'
},
  payer_patient: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  doit_payer_partenaire: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  chargeMutuelle: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  type: {
    type: DataTypes.ENUM('TiersPayant', 'Sous-Traitance', 'Partenaire'),
    allowNull: true
  },
  organisation_origine: { type: DataTypes.INTEGER, allowNull: true },
  organisation_destinataire: { type: DataTypes.INTEGER, allowNull: true },

}, {
  tableName: 'invoice_items',
  timestamps: true
});

module.exports = InvoiceItem;
