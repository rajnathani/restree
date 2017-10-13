var app = require('express')();
var restree = require('../../');

restree(app);

app.listen(8080);
