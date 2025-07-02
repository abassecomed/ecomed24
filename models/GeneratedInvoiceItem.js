const { DataTypes } = require('sequelize');
const sequelize = require('../config').sequelize;

const GeneratedInvoiceItem = sequelize.define('GeneratedInvoiceItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  generated_invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  invoice_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'generated_invoice_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = GeneratedInvoiceItem;
