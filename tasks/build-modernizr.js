import modernizr from "modernizr";
import fs from "fs-extra";

let config = JSON.parse(fs.readFileSync('modernizr.config.json', 'utf8'));

modernizr.build(config, function (result) {
  fs.outputFileSync('dist/js/modernizr.js', result);
});
