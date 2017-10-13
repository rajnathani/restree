var app = require('express')();
var restree = require('../../');
var request = require('supertest');

restree(app);

request(app)
  .get('/')
  .end(function(err, res){
    if (err || res.text !== 'Welcome to groups') throw Error();
  });

request(app)
  .put('/groups')
  .end(function(err, res){
    if (err || res.text !== 'Created a group') throw Error();
  });

  request(app)
  .get('/groups/5cabc387')
  .end(function(err, res){
    if (err || res.text !== 'Fetched group 5cabc387') throw Error();
  });

  request(app)
  .delete('/groups/5cabc387')
  .end(function(err, res){
    if (err || res.text !== 'Deleted group 5cabc387') throw Error();
  });

  request(app)
  .post('/groups/5cabc387/members')
  .end(function(err, res){
    if (err || res.text !== 'Added a new member to group 5cabc387') throw Error();
  });

  request(app)
  .post('/groups/5cabc387/members/2uhjg949/suspend')
  .end(function(err, res){
    if (err || res.text !== 'Suspended member 2uhjg949 from group 5cabc387') throw Error();
  });

  request(app)
  .post('/groups/5cabc387/members/2uhjg949/unsuspend')
  .end(function(err, res){
    if (err || res.text !== 'Unsuspended member 2uhjg949 from group 5cabc387') throw Error();
  });
  