var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var _template = require('./lib/template.js')
var path = require('path');


var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var description;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', function(err, filelist){
          var title = queryData.id;
          var datalist = _template.List(filelist);
          var template = _template.HTML('welcome!', datalist, `<h2>HOMEPAGE</h2>hello world!`, `<h3><a href="/create">create</a>`);
          response.writeHead(200);
          response.end(template);
      })        
      }
      else{
        fs.readdir('./data', function(err, filelist){
          var filteredID = path.parse(queryData.id).base;
          fs.readFile(`./data/${filteredID}`, 'utf-8', function(err, description){
            var title = queryData.id;
            var datalist = _template.List(filelist);
            var template = _template.HTML(title, datalist, `<h2>${title}</h2>${description}`, `<h3><a href="/create">create</a>
            <a href="/update/?id=${title}">  update</a>
            </h3>
            <form action="delete_process" method="post" >
              <input type="hidden" name="id" value="${title}">
              <input type="submit" value="delete">
            </form>`);
              response.writeHead(200);
            response.end(template);
          });
        });
        
      }
    }
    else if(pathname === '/create'){
      fs.readdir('./data', function(err, filelist){
        var title = 'WEB - Create';
        var datalist = _template.List(filelist);
        var template = _template.HTML(title, datalist, 
        `<form action="/process_create" method="post">
        <p><input type="text" name="title" width="50" placeholder="title"></p>
        <p> <textarea name="description" width="50" placeholder="description"></textarea>
        </p>
        <p>
            <input type="submit">
        </p>
        </form>`, ``);
        response.writeHead(200);
        response.end(template);
    })
    }
    else if(pathname === '/process_create'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
        if(body.length > 1e6)
          request.connection.destroy();  
      });
      request.on('end', function(){
        var post = qs.parse(body);
        title = post.title;
        description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {location: `/?id=${title}`});
          response.end();
        });
      });
    }
    
    else if(pathname === '/update/'){
      fs.readdir('./data', function(err, filelist){
        var filteredID = path.parse(queryData.id).base;  
        fs.readFile(`./data/${filteredID}`, 'utf-8', function(err, description){
          var title = queryData.id;
          var datalist = _template.List(filelist);
          var template = _template.HTML(title, datalist, 
            `<form action='/process_update' method="post">
            <input type="hidden" name="id" value=${title}>
            <p><input type="text" name="title" width="50" placeholder="title" value=${title}></p>
            <p> <textarea name="description" width="50" placeholder="description">${description}</textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>`, 
            `<h3><a href="/create">create</a><a href="/update/?id=${title}">  update</a></h3>`);
          response.writeHead(200);
          response.end(template); 
        });
      });
    }
    else if(pathname === '/process_update'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
        if(body.length > 1e6)
          request.connection.destroy(); 
      });
      request.on('end', function(){
        var post = qs.parse(body);
        id = post.id;
        title = post.title;
        description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(err){
           fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {location: `/?id=${title}`});
              response.end();
           });
        });
      });
    }
    else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
        if(body.length > 1e6)
          request.connection.destroy(); 
      });
      request.on('end', function(){
        var post = qs.parse(body);
        id = post.id;
        fs.unlink(`data/${id}`, function(err){
          response.writeHead(302, {location: `/`});
          response.end();
        });
      });
    }
    else{
      response.writeHead(404);
      response.end('Not Found');
    }
});

app.listen(3000);