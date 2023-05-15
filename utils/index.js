const svgCaptcha = require("svg-captcha");

module.exports = {
  genCharsRandom(len) {
    let i = 0;
    const genCharCodeList = (start, end) => {
      const list = [];
      while (start <= end) {
        list.push(start);
        start++;
      }
      return list;
    };
    const chars = genCharCodeList("0".charCodeAt(0), "9".charCodeAt(0)).concat(
    //   genCharCodeList("A".charCodeAt(0), "Z".charCodeAt(0)),
      genCharCodeList("a".charCodeAt(0), "z".charCodeAt(0))
    );
    const length = chars.length;
    let result = "";
    while (i < len) {
      result +=String.fromCharCode( chars[Math.floor(Math.random() * length)])
      i++;
    }
    return result;
  },

  genSvgCaptcha() {},
};
