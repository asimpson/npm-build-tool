import _ from "lodash";
import fs from "fs";
import Handlebars from "handlebars";

/**
 * renderPage
 *
 * @param {string} template Template HTML as rendered by Handlbars
 * @return {string} HTML of the page rendered
 */
function renderPage(template, layoutPath, data) {
  let file = fs.readFileSync(layoutPath, 'utf8');
  let page = Handlebars.compile(file);
  let context = _.assign({body: template}, data);
  return page(context);
}

export default renderPage;
