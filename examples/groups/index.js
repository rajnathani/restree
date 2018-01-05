const app = require('express')();
const restreed = require('./restreed')(app);
const request = require('supertest');

app.use(function(req, res, next){
  const metadata = restreed.metadata(req,res);
  if (metadata && metadata.runSecurityMiddleware) {
    res.locals.ranSecurityMiddleware = true;
  } else {
    res.locals.ranSecurityMiddleware = false;    
  }
  next();
});

restreed.bind();

app.listen(8080);