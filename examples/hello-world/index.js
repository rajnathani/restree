const app = require('express')();
const restree = require('../../');
const restreed = require('./restreed')(app);

restreed.bind();

app.listen(8080);
