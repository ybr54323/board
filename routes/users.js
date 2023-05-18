var express = require("express");
var router = express.Router();
const isEmail = require("validator/lib/isEmail");
const User = require("../models/User");
const sendMail = require("../mail");
const svgCaptcha = require("svg-captcha");
const { genCharsRandom } = require("../utils/index");

const operations = ["register", "login"];
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/send_email", function (req, res, next) {
  const { email, operationType } = req.body;
  if (!isEmail(email + "")) {
    return res.status(400).json({ msg: "wrong email" });
  }
  if (operations.indexOf(operationType) === -1) {
    return res.status(400).json({ msg: "wrong operation type" });
  }

  const info = req.session[operationType];
  // need gap 30s
  if (info && !isNaN(info.expire) && Date.now() - +info.expire < 30 * 1e3) {
    return res.status(400).json({ msg: "wait until 30s after" });
  }

  const captcha = genCharsRandom(4);

  sendMail(email, captcha)
    .then(() => {
      req.session[operationType] = {
        expire: Date.now(),
        captcha,
      };
      setTimeout(() => {
        delete req.session[operationType];
      }, 30 * 1e3);
      res.json({ msg: "验证码发送成功" });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
});

module.exports = router;
