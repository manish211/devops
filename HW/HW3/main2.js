var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

var outputString;

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.

app.use(function(req, res, next) 
{
	// console.log(req.method, req.url);
	// console.log("=====");
	// console.log(req.method);  //prints GET
	// console.log("======");
	// console.log(req.url);	  // prints /recent
	// process.exit();

	// ... INSERT HERE.

	console.dir(req.headers);

	client.rpoplpush("host:port","host:port",function(err,resp){

		if(err){
			throw err;
		}
		else
		{
			console.log("INSIDE");	
			console.log("response from rpoplplush:"+resp);
			console.dir(req.headers);
			console.log(req.headers.host);
			req.headers.host = resp;
			console.log("AFTER MODIFICATION:"+req.headers.host);

			client.lpush('recentQueue',req.url,function(err,reply){

			console.log(reply)

			next();

	})

		}

	})

	console.log("OUTSIDE MODIFICATION:="+req.headers.host);
	
	

	// next(); // Passing the request to the next handler in the stack.
});

app.get('/recent',function(req,res){

	
		// Display all the recently visited sites
		// Put code here pending

		client.lrange('recentQueue',0,4,function(resp,reply){

			console.log("reply: "+reply);

			res.send(reply);
		})
	
})

app.get('/get',function(req,res){

	console.log("You visited get");

	console.log(req.query);

	

	console.log("key length:"+Object.keys(req.query).length)

	if(Object.keys(req.query).length === 0 ){
		console.log("req.query.keys not found !!");

		client.get("keyExpire",function(err,value){

			res.send(value);
		})	
	}
	else
	{
		for(var key in req.query){
			console.log("+++++");
			if(req.query.hasOwnProperty(key)){

				client.get(key,function(err,value){

					outputString = "key="+key+" value="+value ;
					console.log(outputString);
					console.log("-----");
					// return outputString
					res.send(outputString);
				})
			}
		}

		console.log("***** END ***** ");

		console.log(outputString)

		// res.send(outputString);
	}
})

app.get('/set',function(req,res){

	console.log("You visited set");

	// res.send('You visited set');

	console.log(req.query)

	// var key = req.query[0]

	console.log("key="+key);

	client.set("keyExpire","This message will self-destruct in 10 seconds");

	client.expire("keyExpire",10);

	console.log("req.query: "+req.query);

	console.log(req.query.keys)

	console.log("key length:"+Object.keys(req.query).length)   // the length is 0 if the object does not have any keys or if the object is empty

	if(req.query.keys === undefined){
		// console.log("req.query exist !!");

		client.get("keyExpire",function(err,value){

			res.send(value);
		})	
	}
	else
	{
		for(var key in req.query){
			console.log("+++++");
			if(req.query.hasOwnProperty(key)){

				client.set(key,req.query[key]);

				var outputString = "key="+key+" value="+req.query[key] ;
				console.log(outputString);
				console.log("-----");


			}
		}

		res.send(outputString);
	}

	
	
// console.log("HELLO =======");
	// res.send(outputString);


	// client.set("key", "value");
	// client.get("key", function(err,value){ console.log(value)});

})


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files
   console.log("-----")
   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		client.lpush("image",img);	
	  		// console.log(img);
	  		console.log("HERO")
		});
	}

   res.status(204).end()
}]);

app.get('/', function(req, res) {
	{
		// console.log(req);
		res.send('hello world')
	}
})

app.get('/meow', function(req, res) {
	{
		// console.log(req);

		res.writeHead(200, {'content-type':'text/html'});
		// res.write("<b>hello hello</b>");

		// console.log("ok ok")

		client.lrange("image",0,1,function(err,items){

			if(err){
				throw err;
			}

			items.forEach(function(image){
				console.log("ok");
				res.write("<h1>\n<img src='data:morning.jpg;base64,"+image+"'/>");
				// res.write("<b> hello hello </b>");

			})
			res.end();
		})


		// items.forEach(function (imagedata) 
		// {
		// 	console.log("ok")
  //  			res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
  //  			res.write("<b>hello hello</b>");
		// });
   	// res.end();
	}
})

// app.get('/meow', function(req, res) {
// 	{
// 		client.lrange("image",0,1,function(err,items){
// 			var imagedata=items[0]
// 			res.send("<h1>\n<img src='data:morning.jpg;base64,"+imagedata+"'/>");
// 		})
// 	}
// })

// HTTP SERVER
var server = app.listen(3002, function () {

  var host = server.address().address
  console.log("HOST IS="+host);
  var port = server.address().port

  client.del("host:port");
  client.lpush("host:port","localhost:3002");
  client.lpush("host:port","localhost:3002");

  // client.

  console.log('Example app listening at http://%s:%s', host, port)
})

