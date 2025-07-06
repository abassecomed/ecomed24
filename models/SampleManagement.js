const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");
const Patient = require("./Patient");

const SampleManagement = sequelize.define(
  "SampleManagement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Patient,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    sample_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    test_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     status:{
       type:DataTypes.INTEGER,
       defaultValue:0, //0=sample collection , 1=Accessioning, 2=Analysis, 3=Verification, 4=Reporting,
       allowNull:true, 
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
    tableName: "sample_managements",
    timestamps: true,
    paranoid: true,
    // deletedAt: 'deletedAt'
  }
);
SampleManagement.belongsTo(Patient, {foreignKey:'patient_id', as:'patient'});
module.exports = SampleManagement;
