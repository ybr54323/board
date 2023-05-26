
const { DataTypes, Model, Sequelize } = require("sequelize");
const sequelize = new Sequelize("mysql://root:123456@localhost:3306"); // Example for sqlite
module.exports = sequelize;
