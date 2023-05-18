var express = require("express");
var router = express.Router();
// const {genCharsRandomy} = require("../utils/index")
const svgCaptcha = require("svg-captcha");


router.get("/captcha", function (req, res, next) {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.type("svg");
  res.status(200).send(captcha.data);
});
module.exports = router;
