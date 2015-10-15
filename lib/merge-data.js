import ymljs from "yamljs";
import _ from "lodash";
import path from "path";
import globby from "globby";

let jsonData = {};

/**
 * mergeData
 *
 * @return {object} the YAML data as a single JSON object with keys as filenames
 */
function mergeData() {
  let data = globby.sync('src/data/*.yml');

  _.forEach(data, (file, i) => {
    let fileName = path.basename(file, '.yml');
    let data = ymljs.load(file);
    jsonData[fileName] = data;
  });
  
  return jsonData;
}

export default mergeData;
