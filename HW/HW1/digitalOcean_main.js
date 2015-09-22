// REFERENCE : DIGITAL OCEAN API Documentation and workshop files

var needle = require("needle");
var os   = require("os");
var fs = require("fs");

var config = {};

config.token = process.env.DIGITAL_OCEAN_TOKEN;
config.ssh_key = process.env.DIGITAL_OCEAN_KEY_ID;

var headers =
{
	'Content-Type':'application/json',
	Authorization: 'Bearer ' + config.token
};

// Documentation for needle:
// https://github.com/tomas/needle

var client =
{
	listRegions: function( onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/regions", {headers:headers}, onResponse)
	},

  listImages: function ( onResponse )
  {
    needle.get("https://api.digitalocean.com/v2/images", {headers: headers}, onResponse)
  },

  retrieveDroplet: function( dropletId, onResponse )
  {
    needle.get("https://api.digitalocean.com/v2/droplets/"+dropletId, {headers: headers}, onResponse)
  },

  createDroplet: function (dropletName, region, imageName, onResponse)
  {
		var data = 
		{
			"name": dropletName,
			"region":region,
			"size":"512mb",
			"image":imageName,
			// Id to ssh_key already associated with account.
			"ssh_keys":[config.ssh_key],
			//"ssh_keys":null,
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

//		console.log("Attempting to create: "+ JSON.stringify(data) );

		needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );

		
	}

};

// #############################################
// #3 Create an droplet with the specified name, region, and image
// Comment out when completed. ONLY RUN ONCE!!!!!
// Write down/copy droplet id.
//var name = "manish-"+os.hostname();
 var name = "manish-droplet-19";
 var region = "nyc3"; // Fill one in from #1
 //var image = "coreos-beta"; // Fill one in from #2
 //var image = "ubuntu-15-04-x64"; // Fill one in from #2
//var image = "13089493" 
var image = "ubuntu-14-04-x32"

var dropletId = '';
 client.createDroplet(name, region, image, function(err, resp, body)
 {
	console.log(body);
     	 //StatusCode 202 - Means server accepted request.
	   console.log("-------create-droplet-------")
	console.log("status code:"+resp.statusCode)

 	if(!err && resp.statusCode == 202)
 	{
 		//console.log("Error while creating droplet ***")
 		console.log( JSON.stringify( body, null, 3 ) );
		dropletId = body.droplet.id;
		console.log("DropletId after creating droplet:"+dropletId);
  		setTimeout(getIpAddrOfDroplet, 70000, dropletId);   // 70000 works 
		
 	}
 });


// To get the ip address

var getIpAddrOfDroplet = function(dropletId) {

	var api = "https://api.digitalocean.com/v2/droplets/" + dropletId;
	
	needle.get(api, {headers:headers}, function (error, response) {
		
		if (error) {
			
			console.log("Failed to get the ip address. Please check the parameters again!");
		
		} else {
				
				var ipaddress = response.body.droplet.networks.v4[0].ip_address;
				
				console.log("IP ADDRESS OF DROPLET : " + ipaddress);
				
				var recordline = "node1 ansible_ssh_host=" + ipaddress + 
				" ansible_ssh_user=root\n"; 
				//+ " ansible_ssh_private_key_file=/vagrant/privateKeys/manish_mac_keypair_digital.pem\n";  
				
				fs.appendFile("inventory/inventory", recordline, function(error) {
				
				if (error) {
			
						console.log("Failed to write into the inventory file. Something went wrong");
				
				} else {
						
						console.log("Inventory file got appended successfully");
				}
			});
		}
	});
};




