import _ from "lodash";
import fm from "front-matter";
import fs from "fs";
import Handlebars from "handlebars";

/**
 * renderTemplate
 *
 * @param {string} templatePath Path to the template being rendered
 * @return {string} Compiled Handlebars HTML
 */
function renderTemplate(templatePath, data) {
  let file = fs.readFileSync(templatePath, 'utf8');
  let frontMatter = fm(file);
  let context = frontMatter.attributes;
  context = _.extend(data, context);
  let template = Handlebars.compile(frontMatter.body);
  return template(context);
}

export default renderTemplate;
