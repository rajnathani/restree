var should = require('should');
var restree = require('../../');

describe('cutRootPath', function () {
    it('should handle single level hierarchy', function () {
        restree.cutRootPath('/Users/raj/project/restree', '/Users/raj/project/restree/GET.js').should.eql('/GET.js')
    });
    it('should handle multiple level hierarchy', function () {
        restree.cutRootPath('/Users/raj/project/restree', '/Users/raj/project/restree/foo/bar/GET.js').should.eql('/foo/bar/GET.js')
    });
});

describe('makePathExpressJsPath', function () {
    it('should handle empty string', function () {
        restree.makePathExpressJsPath('').should.eql('/')
    });
    it('should handle single file', function () {
        restree.makePathExpressJsPath('_foo_').should.eql('/:foo')
    });
    it('should handle file', function () {
        restree.makePathExpressJsPath('bar/_foo_/').should.eql('/bar/:foo/')
    });
    it('should handle file with param in the middle', function () {
        restree.makePathExpressJsPath('bar/_foo_/baz').should.eql('/bar/:foo/baz')
    });
    it('should handle file with multiple params', function () {
        restree.makePathExpressJsPath('bar/_foo_/_baz_/').should.eql('/bar/:foo/:baz/')
    });
});

