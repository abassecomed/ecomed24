const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");

const LabTube = sequelize.define(
  "LabsTube",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    cap_color: {
      type: DataTypes.STRING,
      allowNull:true,
    },
    additive:{
     type:DataTypes.STRING,
     allowNull:true,   
    },
    volume_ml:{
        type:DataTypes.FLOAT,
        allowNull:true,
    },
    material:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    storage_temperature:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    expiration_period:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    barcode:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    qr_code:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    image:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    closure_type:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    sterile:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    vacuum_type:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    diameter_mm:{
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    length_mm:{
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    label_type:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    centrifuge_safe:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    preferred_tests:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    added_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  },
  {
    tableName: "labs_tube",
    timestamps: true,
     paranoid: true,  
  // deletedAt: 'deletedAt'
  }
);

module.exports =LabTube;
