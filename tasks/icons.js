import icons from "grunticon-lib";
import globby from "globby";

let files = globby.sync('src/icons/*');
let options = {
  colors: {
    "blue": "blue"
  }
};

let icon = new icons(files, 'dist/icons', options);

icon.process();
