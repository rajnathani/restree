var fs = require('fs');
var path = require('path');
var util = require('util');
var colors = require('colors');
var path = require('path');
var trim = require('lodash.trim');

function main(sysAbsoluteFilePath, sysRelativeFilePath, toCreateFileName) {
    console.log(sysAbsoluteFilePath, sysRelativeFilePath);
    try {
        var restreeObj = walk(sysAbsoluteFilePath, sysAbsoluteFilePath, {});
        var formattedCode = codeFormat(restreeObj, sysRelativeFilePath);
        fs.writeFile(path.dirname(sysRelativeFilePath) + "/" + toCreateFileName + ".js",
            formattedCode,
            function(err){
            if (err) {
                console.error(err);                
                console.error("RESTREE ERROR: Cannot create file '" +
                    toCreateFileName + ".js' in folder '" + sysRelativeFilePath + "'");
            }
        });
    } catch (err) {
        console.error(err);        
        console.error("RESTREE ERROR: Cannot compile routes");
    }
};

function codeFormat(restreeObj, sysRelativeFilePath) {

    var importFormattedCode = "";
    var middlewareFormattedCode = "";    
    var webFrameworkRouteBindFormattedCode = "";

    
    var importRelativePath = path.basename(sysRelativeFilePath);

    for (var codeVariableIdentifier in restreeObj) {
        restleafObj = restreeObj[codeVariableIdentifier];
        importFormattedCode += "var " + codeVariableIdentifier + " = require('./" +
            importRelativePath + (restleafObj.relativeFilePath ? "/" + restleafObj.relativeFilePath : "") + "/" +  restleafObj.httpVerb + "');\r\n";
        middlewareFormattedCode += "  app.all('" + restleafObj.httpWebFrameworkPath +
            "', function (req, res, next) { " +
            "res.locals.restreeRestleafMetadata = " + codeVariableIdentifier + ".metadata; next(); });\r\n";
        webFrameworkRouteBindFormattedCode += "  app." + restleafObj.httpVerb.toLowerCase() + "('" +
            restleafObj.httpWebFrameworkPath + "', " + codeVariableIdentifier + ".handler);\r\n";
    }

    // TODO: use es6 code formatting and babel to transpile instead of this non-sense
    return "'use strict'\r\n\r\n" +
        importFormattedCode +
        "\r\n" +
        "function init(app) {\r\n" +
        middlewareFormattedCode +
        "}\r\n\r\n" +
        "function bind(app) {\r\n" +
        webFrameworkRouteBindFormattedCode +
        "}\r\n\r\n" +
        "module.exports = function (app) {\r\n" +
        "  init(app);\r\n" +
        "  return {\r\n" +
        "    bind: function () { bind(app); },\r\n" +
        "    metadata: function (req, res) {\r\n" +
        "      return res.locals.restreeRestleafMetadata;\r\n" +
        "    }\r\n" +
        "  };\r\n" +
        "}\r\n";
}


function generateVerticalAndHorizontalLineIndent(n) {
    var s = "|";
    for (var i = 0; i < n; i++) {
        s += "    |";
    }
    return n === 0 ? s : s + " --";
}

function colorifyHttpVerb(verb) {
    switch (verb) {
        case "GET":
            return "GET".black.bgWhite;
        case "POST":
            return "POST".bgCyan;
        case "PUT":
            return "PUT".bgBlue;
        case "UPDATE":
            return "UPDATE".bgYellow;
        case "PATCH":
            return "PATCH".bgMagenta;
        case "DELETE":
            return "DELETE".bgRed;
        default:
            return verb;
    }
}

/**
 * Inputs the absolute path a of file `absolutePath`.
 * along with it its root path up to a certain file hierarchy
 * depth `rootPath`, cut out the root path from the absolute path
 * of the file.
 * Pre-condition: `rootPath` will not contain a trailing slash
 * eg:
 * `rootPath`: /Users/raj/project/restree
 * `absolutePath`: /Users/raj/project/restree/foo/bar/GET.js
 * -> "/foo/bar/GET.js"
 * /foo/bar
 */
function cutRootPath(rootPath, absolutePath) {
    return absolutePath.slice(rootPath.length);
};

/**
 * Given an relative path `v` with no leading slash.
 * replace all the files and directories
 * of formation '_<name>_' to ':<
 */
function makePathExpressJsPath(v) {
    return "/" + v.replace(/_([^\/]*)_/g, ':$1');
}

/**
 * Precondition: `rootPath` will not contain a trailing slash
 * @param {*} rootPath 
 * @param {*} fname 
 * @param {*} depth 
 */
function walk(rootPath, fname, restreeObj, depth) {
    function generateCodeVariableIdentifier(restreeObj, httpVerb, relativeFilePath) {
        // TODO: handle in-between underscores so that "/books/more_info" becomes
        // "restleafBooksMoreInfo<Verb>" instead of "restleafBooksMoreinfo<Verb>"
        var codeVariableIdentifier = "restleaf" + relativeFilePath
            .replace(/[^\/A-Za-z0-9]/g, "") //remove non alphanumeric characters except underscores (also leaving out
            // slashes for now)
            .replace(/^[a-z]/, function(x){ return x[0].toUpperCase(); }) // uppercase first character
            // to maintain camelcasing
            .replace(/(\/[^\/])/g, function(x){ return x[1].toUpperCase(); }) // remove slashes, and upper
            // case first letter following each slash to maintain camelcasing
            + (httpVerb[0] + httpVerb.slice(1).toLowerCase()); // add camelcased the http verb
        if (restreeObj[codeVariableIdentifier] === undefined) {
            return codeVariableIdentifier
        } else {
            var initialCodeVariableIdentifier = codeVariableIdentifier;
            var count = 1;
            do {
                codeVariableIdentifier = initialCodeVariableIdentifier + count;
            } while (restreeObj[codeVariableIdentifier]);
            return codeVariableIdentifier;
        }
    }

    depth = depth !== undefined ? depth : -1;
    if (!fs.existsSync(fname)) {
        return restreeObj;
    }
    if (!fs.lstatSync(fname).isDirectory()) {
        var regMatch = fname.match(/\/(GET|POST|PUT|PATCH|UPDATE|DELETE).js$/);
        if (regMatch !== null) {
            var relativeFilePath = trim(cutRootPath(rootPath, fname.slice(0, regMatch.index)), "/");
            var httpWebFrameworkPath = makePathExpressJsPath(relativeFilePath);
            var httpVerb = regMatch[1];
            console.info(generateVerticalAndHorizontalLineIndent(depth) + " " + colorifyHttpVerb(httpVerb) + " " + httpWebFrameworkPath);

            var codeVariableIdentifier = generateCodeVariableIdentifier(restreeObj, httpVerb, relativeFilePath);
            restreeObj[codeVariableIdentifier] = {
                depth: depth,
                httpWebFrameworkPath: httpWebFrameworkPath,
                httpVerb: httpVerb,
                relativeFilePath: relativeFilePath
            };
        }
    } else {
        var files = fs.readdirSync(fname);
        files.forEach(function (fileName) {
            restreeObj = walk(rootPath, fname + "/" + fileName, restreeObj, depth + 1);
        });
    }
    return restreeObj;    
}


if (process.env.NODE_ENV === 'unittest') {
    exports.makePathExpressJsPath = makePathExpressJsPath;
    exports.cutRootPath = cutRootPath;
    exports.walk = walk;
} else {
    module.exports = main;
}
