'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const colors = require('colors');
const trim = require('lodash.trim');


// One assumption which we make while using regular expressions
// to match file names is that there isn\'t quotes being used to include
// arbitrary file names. Create a GitHub issue to address this.

function main(sysAbsoluteFilePath, sysRelativeFilePath, toCreateFileName) {
    console.log(sysAbsoluteFilePath, sysRelativeFilePath);
    try {
        let restreeArray = walk(sysAbsoluteFilePath, sysAbsoluteFilePath,[], 0, []);
        let formattedCode = codeFormat(restreeArray, sysRelativeFilePath);
        fs.writeFile(path.dirname(sysRelativeFilePath) + '/' + toCreateFileName + '.js',
            formattedCode,
            function(err){
            if (err) {
                console.error(err);                
                console.error(`RESTREE ERROR: Cannot create file '${toCreateFileName}.js' in folder '${sysAbsoluteFilePath}'`);
            }
        });
    } catch (err) {
        console.error(err);        
        console.error('RESTREE ERROR: Cannot compile routes');
    }
};

function codeFormat(restreeArray, sysRelativeFilePath) {

    let importFormattedCode = '';
    let middlewareFormattedCode = '';    
    let webFrameworkRouteBindFormattedCode = '';
    
    let importRelativePath = path.basename(sysRelativeFilePath);

    for (let i=0, len=restreeArray.length; i<len; i++) {
        const o = restreeArray[i];
        importFormattedCode += `const ${o.codeVariableIdentifier} = \
require('./${importRelativePath}${(o.relativeFilePath ? '/' + o.relativeFilePath : '')}/${o.httpVerb}');\r\n`
        middlewareFormattedCode += `  app.all('${o.httpWebFrameworkPath}', (req, res, next) => {
    res.locals.restreeRestleafMetadata = ${o.codeVariableIdentifier}.metadata;
    next();
  });\r\n`;
        webFrameworkRouteBindFormattedCode += `  app.${o.httpVerb.toLowerCase()}('${o.httpWebFrameworkPath}', asyncMiddleware(${o.codeVariableIdentifier}.handler));\r\n`;
    }

    // TODO: use es6 code formatting and babel to transpile instead of this non-sense
    return '\'use strict\'\r\n\r\n' +
        importFormattedCode +
        '\r\n' +
        '// source for asyncMiddleware: https://github.com/Abazhenov/express-async-handler/blob/master/index.js\r\n' +
        'const asyncMiddleware = fn => (req, res, next) => fn(req, res, next).catch(next);\r\n\r\n' +
        'function init(app) {\r\n' +
        middlewareFormattedCode +
        '}\r\n\r\n' +
        'function bind(app) {\r\n' +
        webFrameworkRouteBindFormattedCode +
        '}\r\n\r\n' +
        'module.exports = function (app) {\r\n' +
        '  init(app);\r\n' +
        '  return {\r\n' +
        '    bind: () => bind(app),\r\n' +
        '    metadata: (req, res) => res.locals.restreeRestleafMetadata\r\n' +
        '    \r\n' +
        '  };\r\n' +
        '}\r\n';
}


function generateVerticalAndHorizontalLineIndent(n) {
    let s = '|';
    for (let i = 0; i < n; i++) {
        s += '    |';
    }
    return n === 0 ? s : s + ' --';
}

function colorifyHttpVerb(verb) {
    switch (verb) {
        case 'GET':
            return 'GET'.black.bgWhite;
        case 'POST':
            return 'POST'.bgCyan;
        case 'PUT':
            return 'PUT'.bgBlue;
        case 'UPDATE':
            return 'UPDATE'.bgYellow;
        case 'PATCH':
            return 'PATCH'.bgMagenta;
        case 'DELETE':
            return 'DELETE'.bgRed;
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
 * -> '/foo/bar/GET.js'
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
    return '/' + v.replace(/_([^\/]+)_/g, ':$1');
}

/**
 * Precondition: `rootPath` will not contain a trailing slash
 * @param {*} rootPath 
 * @param {*} fname 
 * @param {*} depth 
 */
function walk(rootPath, fname, restreeArray, depth, codeVariableIdentifersUsed) {
    function generateCodeVariableIdentifier(codeVariableIdentifersUsed, httpVerb, relativeFilePath) {
        // TODO: handle in-between underscores so that '/books/more_info' becomes
        // 'restleafBooksMoreInfo<Verb>' instead of 'restleafBooksMoreinfo<Verb>'
        let codeVariableIdentifier = 'restleaf' + relativeFilePath
            .replace(/[^\/A-Za-z0-9]/g, '') //remove non alphanumeric characters except underscores (also leaving out
            // slashes for now)
            .replace(/^[a-z]/, function(x){ return x[0].toUpperCase(); }) // uppercase first character
            // to maintain camelcasing
            .replace(/(\/[^\/])/g, function(x){ return x[1].toUpperCase(); }) // remove slashes, and upper
            // case first letter following each slash to maintain camelcasing
            + (httpVerb[0] + httpVerb.slice(1).toLowerCase()); // add camelcased the http verb
        if (codeVariableIdentifersUsed.indexOf(codeVariableIdentifier) === -1) {
            return codeVariableIdentifier;
        } else {
            let initialCodeVariableIdentifier = codeVariableIdentifier;
            let count = 1;
            do {
                codeVariableIdentifier = initialCodeVariableIdentifier + count;
            } while (codeVariableIdentifersUsed.indexOf(codeVariableIdentifier) !== -1);
            return codeVariableIdentifier;
        }
    }

    if (!fs.existsSync(fname)) {
        return restreeArray;
    }
    if (!fs.lstatSync(fname).isDirectory()) {
        const regMatch = fname.match(/\/(GET|POST|PUT|PATCH|UPDATE|DELETE).js$/);
        if (regMatch !== null) {
            const relativeFilePath = trim(cutRootPath(rootPath, fname.slice(0, regMatch.index)), '/');
            const httpWebFrameworkPath = makePathExpressJsPath(relativeFilePath);
            const httpVerb = regMatch[1];
            console.info(generateVerticalAndHorizontalLineIndent(depth) + ' ' + colorifyHttpVerb(httpVerb) + ' ' + httpWebFrameworkPath);

            const codeVariableIdentifier = generateCodeVariableIdentifier(codeVariableIdentifersUsed, httpVerb, relativeFilePath);
            codeVariableIdentifersUsed.push(codeVariableIdentifier);
            restreeArray.push({
                codeVariableIdentifier: codeVariableIdentifier,
                depth: depth,
                httpWebFrameworkPath: httpWebFrameworkPath,
                httpVerb: httpVerb,
                relativeFilePath: relativeFilePath
            });
        }
    } else {
        // We will sort the files names so that parameter
        // paths (eg: _id_) will be come at the end.
        // This is important as we use the built restree array
        // in the order specified to bind the routes, and
        // we don\'t want to have param routes binded first
        // as they will match (in most web frameworks) above
        // a non path parameter identifer
        let files = fs.readdirSync(fname).sort(function(a,b){
            let r = /^_([^\/]+)_$/;
            if (r.test(a)) {
                return true;
            }
            if (r.test(b)) {
                return false;
            }
            return true;
        });
        files.forEach(function (fileName) {
            restreeArray = walk(rootPath, fname + '/' + fileName, restreeArray, depth + 1, codeVariableIdentifersUsed);
        });
    }
    return restreeArray;    
}


if (process.env.NODE_ENV === 'unittest') {
    exports.makePathExpressJsPath = makePathExpressJsPath;
    exports.cutRootPath = cutRootPath;
    exports.walk = walk;
} else {
    module.exports = main;
}
