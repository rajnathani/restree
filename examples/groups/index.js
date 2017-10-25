var app = require('express')();
var restreed = require('./restreed')(app);
var request = require('supertest');

app.use(function(req, res, next){
  var metadata = restreed.metadata(req,res);
  if (metadata && metadata.runSecurityMiddleware) {
    res.locals.ranSecurityMiddleware = true;
  } else {
    res.locals.ranSecurityMiddleware = false;    
  }
  next();
});

restreed.bind();

app.listen(8080);