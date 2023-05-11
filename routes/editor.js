var express = require("express");
var router = express.Router();

const sqlite3 = require("sqlite3").verbose();
function getDb(name = "app.db") {
  return new Promise(function (resolve, reject) {
    let db;
    db = new sqlite3.Database(name, function (e) {
      if (e) return reject(e);
      return resolve(db);
    });
  });
}

getDb().then(function (db) {
  db.serialize(() => {
    db.run(
      "create table if not exists contents ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT,content TEXT)"
    );
    // db.all("select * from contents", (e, rows) => {
    //   console.log(rows);
    // });
  });
  db.close();
});

// db.serialize(() => {
//   db.run("CREATE TABLE lorem (info TEXT)");
//   const stmt = db.prepare("INSERT INTO lorem VALUES (?)");

//   for (let i = 0; i < 10; i++) {
//     stmt.run(`Ipsum ${i}`);
//   }

//   stmt.finalize();

//   db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//     console.log(`${row.id}: ${row.info}`);
//   });
// });

// db.close()
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("editor", {});
});
router.get("/:name", function (req, res, next) {
  const name = req.params.name;
  if (!name) return res.render("editor");
  getDb()
    .then(function (db) {
      db.get(
        "select * from contents where name = ? ",
        [name],
        function (err, row) {
          if (err) {
            res.status(400).json({ err });
          } else {
            if (!row) {
              res.render("editor");
            } else {
              res.render("editor", {
                content: row.content,
              });
            }
          }
        }
      );
    })
    .catch(function (err) {
      return res.status(400).json({ err });
    });
});
router.post("/", function (req, res, next) {
  const { name, content } = req.body;

  if (!name) {
    return res.status(400).render("error");
  }

  getDb()
    .then(function (db) {
      db.serialize(() => {
        db.get(
          "select * from contents where name = ?",
          [name],
          function (e, row) {
            console.log({ e, row });
            if (e) {
              res.status(400).render("error");
            } else if (!row) {
              db.run(
                "insert into contents (name, content) values (?, ?)",
                [name, content],
                function (e, row) {
                  if (!e) res.json({ id: this.lastID });
                  else res.status(400).json({});
                }
              );
            } else {
              db.run(
                "update contents set content = ? where name = ?",
                [content, name],
                function (e, row) {
                  if (!e) {
                    res.json({ id: this.lastID });
                  } else {
                    res.status(400).json({});
                  }
                }
              );
            }
            // db.close();
          }
        );
      });
    })
    .catch(function (err) {
      return res.status(400).json({ err });
    });
});

module.exports = router;
