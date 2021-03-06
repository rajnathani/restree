restree
=====

file based routing built over express

# Installation

(1) download:

    npm install --g restree

or locally:

    npm install --save restree

    
(2) enable:
    
    const express = require('express');
    const restreed = require('./restreed')(app);

    restreed.bind();

    app.listen(8080);

    
# File based routing ?

With restree, each file is treated as a route.

#### How to run?

If you've installed globally (`npm install -g restree`):

  restree

Else if you've installed locally (`npm install --save restree`)

  ./node_modules/restree/bin/restree

## Conventional routing:

**app.js**
    
    const express = require('express');
    const app = express();
    
    app.get('/schools/', async function(req, res) {
      return res.render("schools.jade");
    });
    
    app.post('/schools/:id', async function(req, res) {
      return res.send(200);
    });

    app.listen(8080);
    
   
  
## restree routing:
  
**app.js**

    const express = require('express');
    const app = express();
    const restreed = require('./restreed')(app);

    restreed.bind();

    app.listen(8080);


**restree/schools/GET.js**

    exports.handler = async function(req, res) {
      return res.render("schools.jade");
    }
    

**restree/schools/\_id\_/POST.js**

    exports.handler = async function(req, res) {
      return res.send(200);
    }


# Parse Rules

Given a directory:

    | app.js
    | -- restree
    |    | -- GET.js
    |    | -- schools
    |    |    | -- _id_
    |    |    |    | -- GET.js
    |    |    |    | -- PATCH.js
    |    |    |    | -- helper.js


    
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
