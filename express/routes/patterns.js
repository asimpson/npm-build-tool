import express from "express";
import _ from "lodash";
import Handlebars from "handlebars";
import requireDir from "require-dir";
import path from "path";
import renderTemplate from "../../lib/render-template.js";
import renderPage from "../../lib/render-page.js";
import mergeData from "../../lib/merge-data.js";

let router = express.Router();
let customHelpers = requireDir(path.resolve('lib/helpers'));

let jsonData = mergeData();

/**
 * customHelpers
 *
 * Register all custom helpers in /helpers
 */
_.each(customHelpers, function(helper, key) {
  return customHelpers[key].register(Handlebars);
});

router.use(function(req, res, next) {
  let pattern = req.path.replace('.html', '');
  let filePath = path.resolve('src/patterns/' + pattern + '.hbs');
  let template = renderTemplate(filePath, jsonData);
  let page = renderPage(template, 'layouts/default.hbs', jsonData);
  res.send(page);
  next();
});

export default router;
