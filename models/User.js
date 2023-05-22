const { DataTypes, Model, Sequelize } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite3",
  storage: "../app.db",
}); // Example for sqlite
class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1,
    },
    name: DataTypes.TEXT,
    password: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
  },
  { sequelize, modelName: "user" }
);

User.sync({ alter: true, logging: false });
module.exports = User;
