var express = require("express");
var router = express.Router();
const isEmail = require("validator/lib/isEmail");
const equals = require("validator/lib/equals");
const User = require("../models/User");
const sendMail = require("../mail");
const svgCaptcha = require("svg-captcha");
const { genCharsRandom } = require("../utils/index");

const operations = ["register", "login"];
/* GET users listing. */

router.get("/", function (req, res, next) {
  User.findOne({ where: { email: req.query.email } }).then((res) => {
    console.log(res);
  });
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
  if (info && !isNaN(info.gap) && Date.now() - +info.gap < 30 * 1e3) {
    return res.status(400).json({ msg: "wait until 30s after" });
  }

  const captcha = genCharsRandom(4);

  sendMail(email, captcha)
    .then(() => {
      req.session[operationType] = {
        gap: Date.now(),
        captcha,
        email,
      };
      setTimeout(() => {
        delete req.session[operationType];
      }, 5 * 60 * 1000);
      res.json({ msg: "success" });
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
});
router.post("/email_register", function (req, res, next) {
  const { email, captcha } = req.body;
  const operationType = "register";
  const info = req.session[operationType];
  if (!info) {
    return res.status(400).json({
      msg: "请先发送验证邮件",
    });
  }
  const { email: cachedEmail, captcha: cachedCaptcha } = info;
  if (!equals(email, cachedEmail)) {
    return res.status(400).json({ msg: "请使用收验证邮件的邮箱账户" });
  }
  if (!equals(captcha, cachedCaptcha)) {
    return res.status(400).json({ msg: "验证码不正确" });
  }

  User.findOne({ where: { email } })
    .then((user) => {
      if (user) {
        return res.status(400).json({ msg: "邮箱账户已被注册" });
      }
      User.create({ email })
        .then((res) => {
          console.log(res);
          delete req.session[operationType];
          req.session.userInfo = res;
          return res.status(200).json({ msg: "success" });
        })
        .catch((err) => {
          return res.status(400).json({ err });
        });
    })
    .catch((err) => {
      return res.status(400).json({ err });
    });
});
router.post("/set_pwd", function (req, res) {
  if (!req.session.userInfo) {
    return res.status(400).json({ msg: "请先登录" });
  }
  const { password } = req.body;
  if (!password) return res.status(400).json({ msg: "请发送密码" });
  User.update(
    { password },
    {
      where: {
        id: req.session.userInfo.id,
      },
    }
  )
    .then(() => {
      res.status(200).json({ msg: "修改密码成功" });
    })
    .catch((err) => res.status(400).json({ err }));
});

module.exports = router;
