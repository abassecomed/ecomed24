const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");


const TestCatalog = sequelize.define(
"TestCatalog",
 {
     id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    analysis_name:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    specialty:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    sample_type:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    parameters:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    price:{
        type:DataTypes.FLOAT,
        allowNull:true,
    },
    status:{
        type:DataTypes.INTEGER,
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
    tableName:"test_catalogs",
    timestaps:true,
    paranoid:true,
    // deletedAt: 'deletedAt'
 }
);

module.exports=TestCatalog;