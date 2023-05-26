function stringToArrayBuffer(str) {
  var bytes = new Array();
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    // if (c >= 0x010000 && c <= 0x10ffff) {
    if (c >= 65536 && c <= 1114111) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
      // } else if (c >= 0x000800 && c <= 0x00ffff) {
    } else if (c >= 2048 && c <= 65535) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
      // } else if (c >= 0x000080 && c <= 0x0007ff) {
    } else if (c >= 128 && c <= 2047) {
      /**
       * 8bit 11bit
       * [10000000, 11111111111]
       * 
       * 
       * c=11111111(255)
       * 
       * 
       * 右移6位
       * 00111111
       * 
       * 与运算31(11111)
       * 00111111
       * &
       * 00011111
       * =
       * 00011111
       * 
       * 或运算192(11000000)
       * 00011111
       * |
       * 11000000
       * =
       * 11011111(223)
       * 
       *
       * 与运算63(111111)
       * 11111111
       * &
       * 00111111
       * =
       * 00111111
       * 
       * 或运算128(10000000)
       * 00111111
       * |
       * 10000000
       * =
       * 10111111(191)
       * 
       * 
       * 
       * 
       * c 右移6位，然后与运算31(11111)，然后或运算192(11000000)
       * c 与运算63(111111)，然后或运算128(10000000)
       */
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  var array = new Int8Array(bytes.length);
  for (var i = 0; i <= bytes.length; i++) {
    array[i] = bytes[i];
  }
  return array.buffer;
}
