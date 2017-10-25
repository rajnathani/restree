var app = require('express')();
var restree = require('../../');
var restreed = require('./restreed')(app);

restreed.bind();

app.listen(8080);
