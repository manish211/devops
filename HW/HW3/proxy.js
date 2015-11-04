var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

var http = require('http'),
    httpProxy = require('http-proxy');

// Create a proxy server with custom application logic
var target_urls = [ "http://localhost:3001", "http://localhost:3002" ];

client.del("target_urls",function(){

	for(var i=0; i < target_urls.length - 1; i++){
		client.lpush("target_urls",target_urls[i])
	}

    client.lpush("target_urls",target_urls[i],function(){

    	var server = http.createServer(function(req,res){

			client.rpoplpush("target_urls","target_urls",function(err,target_url){

				console.log("target_url is ->"+target_url);

				var proxy_server = httpProxy.createProxyServer({target : target_url });

				proxy_server.web(req,res);

			});// End of rpoplpush callback

		});  // End of server function

		console.log("Started listening")

		server.listen(5722);

    })

}); // End of client.del callback




