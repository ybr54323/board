const { DataTypes, Model, Sequelize } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:"); // Example for sqlite
class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1,
    },
    name: DataTypes.TEXT,
    favoriteColor: {
      type: DataTypes.TEXT,
      defaultValue: "green",
    },
    age: DataTypes.INTEGER,
    cash: DataTypes.INTEGER,
  },
  { sequelize, modelName: "user" }
);

User.sync({ alter: true, logging: false });
module.exports = User;
