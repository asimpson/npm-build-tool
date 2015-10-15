/**
 * Handlebars Helper builder for Pattern Lab
 *
 * For documentation on the Front Matter module being required go here:
 * https://github.com/jxson/front-matter/blob/master/index.js
 *
 * The only lodash function that we are using is _.assign to merge object values
 * https://lodash.com/docs#assign
 */
'use strict';
var fs = require('fs'),
    path = require('path'),
    globby = require('globby'),
    fm = require('front-matter'),
    _ = require('lodash'),
    templateCache = {},

    /**
     * All the helper functions used to create the Handlebar helpers
     */
    helpers = function() {
      /**
      * Returns the non-hidden directories in a given path.
      * rootDirectory: String path to search through
      *
      * returns Array of Strings representing the directories names.
      */
      var getDirectoriesSync = function(rootDirectory) {
        return fs.readdirSync(rootDirectory).filter(function (file) {
          return !isHidden(file) && fs.statSync(rootDirectory + file).isDirectory();
        });
      },

      /**
      * Takes a string and removes numbers and file extensions, makes hyphens turn
      * into spaces, and title cases it.
      *
      * str: String to be manipulated
      * returns String of new value
      *
      * i.e.: prettify("01-header-template.hbs") === "Header Template"
      */
      prettify = function(str) {
        return str.replace('.hbs', '')
          .replace(/\d+-/, '')
          .replace(/-/g, ' ')
          .replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
          .split('_')[0];
      },

      /**
      * Returns a formatted object based on the file path given.
      *
      * filePath: String path to file or directory
      * returns: Object
      */
      fileHelper = function(filePath) {
        var pattern = {
          'name': path.basename(filePath),
          'prettyName': prettify(path.basename(filePath))
        };
        if(!isDirectory(filePath)) {
          pattern.path = filePath.replace('src', '').replace('.hbs', '.html');
          if(pattern.name.indexOf('_') >= 0) {
            var modifiers = pattern.name.replace(/\.[^/.]+$/, '').split('_');
            pattern.modifiers = modifiers.splice(1, modifiers.length - 1);
          }
        }

        return pattern;
      },

      /**
      * Recursive function that returns a JSON representation of the pattern and its
      * children based on its directory structure.
      *
      * rootDirectory: String file path to turn into a JSON object
      *
      * base case: the rootDirectory  points to a file and returns its Object
      */
      getPatterns = function(rootDirectory) {
        var pattern = fileHelper(rootDirectory);

        if(!isHidden(rootDirectory) && isDirectory(rootDirectory)) {
          var children = getDirectoryChildren(rootDirectory);
          pattern.children = [];
          if(children.length === 0) return pattern;

          children.forEach(function(child) {
            pattern.children.push(getPatterns(child));
          });
        }

        return pattern;
      },

      /**
      * Registers a new Handlebars helper based on the pattern passed in.
      *
      * Handlebars: reference to Handlebars to register the helper
      * pattern: Json representation of the pattern being registered
      */
      registerPattern = function(Handlebars, pattern) {
        Handlebars.registerHelper(pattern, function() {
          var self = this,
              name = arguments[0],
              options = arguments[2] ? arguments[2] : arguments[1],
              context = arguments[2] ? arguments[1] : {},
              templateName = getPartial(Handlebars, pattern + '-' + arguments[0]),
              frontMatter = fm(templateName),
              template = frontMatter.body,
              data = getPatternData(frontMatter.attributes, self, context, options.hash);

          if(typeof options.fn !== 'undefined') {
            data.outlet = options.fn(data);
          }

          var fn = Handlebars.compile(template);

          return new Handlebars.SafeString(fn(data));
        });
      },

      /**
       * getPartial
       *
       * @param {object} Handlebars Handlebars reference
       * @param {string} partial Partial name
       * @return {The template to be used for compilation} Returns the Handlebar partial from either the cache or newly created
       */
      getPartial = function(Handlebars, partial) {
        var tmpl = templateCache[partial],
            lastModified = new Date(fs.statSync(tmpl.path).mtime).getTime();

        if(lastModified !== tmpl.lastModified) {
          Handlebars.registerPartial(partial, fs.readFileSync(tmpl.path, 'utf8'));
          templateCache[partial]['lastModified'] = lastModified;
        }

        return Handlebars.partials[partial];
      },

      /**
       * Function returning an object that merges the objects given together
       * with an order of the last overriding all before it.
       */
      getPatternData = function(frontMatter, pattern, context, options){
        return _.extend({}, frontMatter, pattern, context, options);
      },

      /**
      * Registers all partials with Handlebars.
      *
      * Handlebars: refernce to Handlebars
      * rootPath: String path in which all templates are held
      */
      registerTemplatesSync = function(Handlebars, rootPath) {
        globby.sync(rootPath + '/**/*.hbs').forEach(function(filePath) {
          var name = filePath.replace(rootPath, '').split('/')[0] + '-';
              name += path.basename(filePath, path.extname(filePath)).replace(/\d+-/, '').replace(/^_/, '');
          Handlebars.registerPartial(name, fs.readFileSync(filePath, 'utf8'));
          templateCache[name] = {
            path: filePath,
            lastModified: new Date(fs.statSync(filePath).mtime).getTime()
          };
        });
      },

      /**
       * Returns array of children based on specified glob.
       *
       * rootDirectory: String path as a starting point to check for children
       */
      getDirectoryChildren = function(rootDirectory) {
        return globby.sync([
            rootDirectory + '/**/',
            rootDirectory + '/*.hbs',
            '!' + rootDirectory + '/_*.hbs',
            '!' + rootDirectory + '/_**/',
            '!' + rootDirectory
          ]);
      },

      /**
       * Returns true or false based on if the filepath given points to
       * a directory.
       *
       * filePath: String path to a file
       */
      isDirectory = function(filePath) {
        return fs.statSync(filePath).isDirectory()
      },

      /*
       * Determines if file has a '_' as the first char which indicates hidden.
       *
       * fileName: String path to a file
       */
      isHidden = function(fileName) {
        var hidden = false;
        fileName.split('/').forEach(function(item) {
          if(item[0] === '_') {
            hidden = true;
          }
        });
        return hidden;
      };

      /**
       * Public methods
       */
      return {
        getDirectoriesSync: getDirectoriesSync,
        getDirectoryChildren: getDirectoryChildren,
        getPatterns: getPatterns,
        getPatternData: getPatternData,
        isDirectory: isDirectory,
        isHidden: isHidden,
        registerPattern: registerPattern,
        registerTemplatesSync: registerTemplatesSync
      };
    },

    /**
     * Register function that is used by Handlebars to register the helper
     */
    register = function(Handlebars, options, params) {
      var rootDir = 'src/patterns/';
      var patterns = [];

      helpers().registerTemplatesSync(Handlebars, rootDir);
      helpers().getDirectoriesSync(rootDir).forEach(function(patternPath) {
        var patternJson = helpers().getPatterns(rootDir + patternPath);
        patterns.push(patternJson);
        helpers().registerPattern(Handlebars, patternPath);
      });

      /**
      * Returns a string of the JSON object holding the patterns and partials
      */
      Handlebars.registerHelper('patternJSON', function() {
        return JSON.stringify(patterns);
      });
    };

module.exports = {
  register: register,
  helpers: helpers
};
