restree
=====

file based routing built over express

# Installation

(1) download:

    npm install --save restree
    
(2) enable:
    
    var express = require('express');
    var app = express();
    
    require('restree')(app);

    app.listen(8080);
    
    
# File based routing ?

With restree, each file is treated as a route.


## Conventional routing:

**app.js**
    
    var express = require('express');
    var app = express();
    
    app.get('/schools/', function(req, res) {
      return res.render("schools.jade");
    });
    
    app.post('/school/:id', function(req, res) {
      return res.send(200);
    });

    app.listen(8080);
    
   
  
## restree routing:
  
**app.js**

    var express = require('express');
    var app = express()
    
    require('restree')(app);

    app.listen(8080);


**restree/school/GET.js**

    exports.handler = function(req, res) {
      return res.render("schools.jade");
    }
    

**restree/school/\_id\_/POST.js**

    exports.handler = function(req, res) {
      return res.send(200);
    }


# Parse Rules

Given a directory:

    | app.js
    | -- restree
    |    | -- GET.js
    |    | -- school
    |    |    | -- school
    |    |    |    | -- _id_
    |    |    |    |    | -- GET.js
    |    |    |    |    | -- PATCH.js
    |    |    |    |    | -- helper.js


    
(1) GET.js -> '/'  
    therefore in the above directory, the GET.js route will resolve to `GET /`
    
(2) params -> _<param>_  
    therefore in the above directory, school/_id_/POST.js will resolve to `POST /school/:id`  
    (regular expressions in params are not permitted)
    
(3) helpers -> non js / non directory / \_\_\<name>    
    



# License

The MIT License (MIT)

Copyright (c) 2017 Raj Nathani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
