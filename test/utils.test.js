const { genCharsRandom } = require("../utils/index");

const asserts = require("assert").strict;

let result;
asserts.equal((result = genCharsRandom(4)).length, 4);
console.log({chars: result})