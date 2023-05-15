const { Sequelize } = require("sequelize");

// Option 1: Passing a connection URI
const sequelize = new Sequelize("sqlite::memory:"); // Example for sqlite
async function test() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
test();
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname') // Example for postgres

// // Option 2: Passing parameters separately (sqlite)
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: 'path/to/database.sqlite'
// });

// // Option 3: Passing parameters separately (other dialects)
// const sequelize = new Sequelize('database', 'username', 'password', {
//   host: 'localhost',
//   dialect: /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
// });
const { DataTypes, Model } = require("sequelize");

// Invalid
class User extends Model {
  //   id; // this field will shadow sequelize's getter & setter. It should be removed.
  //   otherPublicField; // this field does not shadow anything. It is fine.
}

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

(async () => {
  await User.sync({ alter: true, logging: false });
  await Article.sync({ alter: true, logging: false });
  const jane = await User.create({ name: "Jane", age: 100, cash: 5000 });
  const ben = await User.create({ name: "Ben", age: 100, cash: 100 });
  // Jane exists in the database now!
  //   await jane.increment({
  //     age: 2,
  //     cash: 100,
  //   });
  //   await jane.reload();
  //   console.log(jane.id);
  User.findAll({
    order: [
        sequelize.fn('max', sequelize.col("cash"))
    ],
    // attributes: {
    //   include: [[sequelize.fn("COUNT", sequelize.col("cash")), "n_hats"]],
    // },
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
})();
