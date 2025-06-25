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
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color_code: {
      type: DataTypes.STRING,
      allowNull:true,
    },
    additive:{
     type:DataTypes.STRING,
     allowNull:true,   
    },
    volume:{
        type:DataTypes.FLOAT,
        allowNull:true,
    },
    tube_type:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    material:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    cap_type:{
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
    image:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    notes: {
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
    // paranoid: true,   // adds deletedAt (soft delete)
   deletedAt: 'deletedAt'
  }
);

module.exports =LabTube;
