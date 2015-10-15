import express from "express";
import patterns from "./patterns";
import path from "path";
import requireDir from "require-dir";
import Handlebars from "handlebars";
import _ from "lodash";
import renderTemplate from "../../lib/render-template.js";
import ymljs from "yamljs";

let router = express.Router();
let customHelpers = requireDir(path.resolve('lib/helpers'));

/**
 * customHelpers
 *
 * Register all custom helpers in /helpers
 */
_.each(customHelpers, function(helper, key) {
  return customHelpers[key].register(Handlebars);
});

router.use('/patterns', patterns);

router.get('/', function(req, res) {
  let data = ymljs.load('src/data/pattern-listing.yml');
  res.send(renderTemplate('layouts/index.hbs', data));
});

export default router;
