const { DataTypes, Model, Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite3",
  storage: "../app.db",
}); // Example for sqlite
class Article extends Model {}
Article.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      defaultValue: "",
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      field: "author_id",
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "article",
    // Using `unique: true` in an attribute above is exactly the same as creating the index in the model's options:
    indexes: [{ unique: true, fields: ["id"] }],
  }
);
Article.sync({ alter: true, logging: false });

module.exports = Article;
