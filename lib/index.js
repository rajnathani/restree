var fs = require('fs');
var path = require('path');
var util = require('util');
var colors = require('colors');

var regPathJs = /\/(GET|POST|PUT|DELETE|PATCH|UPDATE).js$/;

function main(app) {
    var rootPath = path.dirname(require.main.filename) + '/restree';
    try {
        return walk(app, rootPath, rootPath);
    } catch (err) {
        console.error("Error in compiling routes: " + err);
        return null;
    }
};


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
 * Given an absolute path `v`.
 * replace all the files and directories
 * of formation '_<name>_' to ':<
 */
function makePathExpressJsPath(v) {
    return v.replace(/_([^\/]*)_/g, ':$1');
}

/**
 * Given a path `path` remove the trailing slash if it exists
 * Ignore the trailing slash if the path is of a single character (i.e "/")
 * eg: "/foo/" -> "/foo"
 * eg: "/" -> "/"
 * eg: "" -> "/"
 */
function normalizeTrailingSlash(path) {
    return (path === "/" || path === "") ? "/" : path.replace(/\/+$/, '');
}

/**
 * Precondition: `rootPath` will not contain a trailing slash
 * @param {*} app 
 * @param {*} rootPath 
 * @param {*} fname 
 * @param {*} depth 
 */
function walk(app, rootPath, fname, depth) {
    depth = depth !== undefined ? depth : -1;
    if (!fs.existsSync(fname)) {
        return { root: null, children: null };
    }
    var root;
    if (!fs.lstatSync(fname).isDirectory()) {
        var regMatch = fname.match(regPathJs);
        if (regMatch === null) {
            root = null;
        } else {
            var path = normalizeTrailingSlash(cutRootPath(rootPath, fname.slice(0, regMatch.index)));
            var expressJsPath = makePathExpressJsPath(path);
            var verb = regMatch[1];
            console.log(generateVerticalAndHorizontalLineIndent(depth) + " " + colorifyHttpVerb(verb) + " " + expressJsPath);
            app[verb.toLowerCase()](
                expressJsPath,
                require(fname).handler
            );
            root = [verb, expressJsPath];
        }
    } else {
        var children = [];
        var files = fs.readdirSync(fname);
        files.forEach(function (fileName) {
            children.push(walk(app, rootPath, fname + "/" + fileName, depth + 1));
        });
        return children;
    }
}


if (process.env.NODE_ENV === 'unittest') {
    exports.normalizeTrailingSlash = normalizeTrailingSlash;
    exports.makePathExpressJsPath = makePathExpressJsPath;
    exports.cutRootPath = cutRootPath;
    exports.walk = walk;
} else {
    module.exports = main;
}
