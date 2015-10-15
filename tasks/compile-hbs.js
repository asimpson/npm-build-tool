import _ from "lodash";
import requireDir from "require-dir";
import fm from "front-matter";
import path from "path";
import fs from "fs-extra";
import Handlebars from "handlebars";
import globby from "globby";
import renderTemplate from "../lib/render-template.js";
import renderPage from "../lib/render-page.js";
import mergeData from "../lib/merge-data.js";
import ymljs from "yamljs";

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

/**
 * build
 *
 * Write all patterns to .html files in dist/
 */
function build() {
  let hbsPatterns = globby.sync('src/patterns/**/*.hbs');
  let indexData = ymljs.load('src/data/pattern-listing.yml');
  let indexPage = renderTemplate('layouts/index.hbs', indexData);

  _.forEach(hbsPatterns, (file, i) => {
    let type = path.dirname(file).split('src/patterns/')[1];
    let fileName = path.basename(file, '.hbs');
    let template = renderTemplate(file, jsonData);
    let page = renderPage(template, 'layouts/default.hbs', jsonData);
    fs.outputFileSync(`dist/patterns/${type}/${fileName}.html`, page, 'utf8');
  });

  fs.outputFileSync(`dist/index.html`, indexPage, 'utf8');
}

build();

export default build;
