const { DataTypes } = require("sequelize");
const { sequelize } = require("../config");

const PredefineTransaction =sequelize.define(
    "PredefineTransaction",{
       id: {
             type: DataTypes.INTEGER,
             primaryKey: true,
             autoIncrement: true,
           },
           tamplate_name:{
            type:DataTypes.STRING,
            allowNull:true,
           },
           category:{
            type:DataTypes.STRING,
            allowNull:true,
           },
           description:{
            type:DataTypes.STRING,
            allowNull:true,
           },
           default_source:{
            type:DataTypes.STRING,
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
        tableName:"predefine_transactions",
        timestamps:true,
        paranoid:false,
    }
);
module.exports=PredefineTransaction;