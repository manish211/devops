

//REFERENCES:http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-examples.html

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var fs = require('fs');
AWS.config.region = 'us-west-2'
AWS.config.maxRetries = 15
AWS.config.apiVersion = 'latest'

// AWS.config.update({
//     accessKeyId: "tempkeyid",
//     secretAccessKey: "tempkeyn",
//     region: "s-lol-3hh"   
// });


// Create the instance and then access the ip address of the created instance
exports.createInstance = function(onResponse){

  // Instance parameters

var instanceParams = {
  	       region: 'us-west-2',
 	         apiVersion : 'latest',
 	         maxRetries : 30
}

// Set the properties json object for  creating the instance

var properties = {
           ImageId: 'ami-5189a661', 
           KeyName: 'temp_mac_keypair',
           InstanceType: 't2.micro', 
           MinCount: 1,
           MaxCount: 1
};

var ec2 = new AWS.EC2(instanceParams);

  // Now run the instance and check

  ec2.runInstances(properties,function(err,data){

  	if(err) 
  	{ 
		    console.log("Could not create instance", err); 
		    
        return;
  	}

  	var instanceId = data.Instances[0].InstanceId;
  	
    console.log("Created instance",instanceId);

  	//Create a json object
  	response = {
                  instanceId: data.Instances[0].InstanceId,
                  user: 'ubuntu'
               }

    ec2.waitFor('instanceRunning',{ InstanceIds: [response.instanceId]},
		          function(err,data){
		          
              if(err)
              {
			             console.log(err);
			             process.exit(1);
		          }
		
              console.log('successfully initialized the instance now');
		          console.log(data.Reservations[0].Instances[0].PublicIpAddress);
		
              var ip_address = data.Reservations[0].Instances[0].PublicIpAddress;	
          		
              var user = 'ubuntu';
          		
              var record = 'node0 ansible_ssh_host='+ip_address
            				     + ' ansible_ssh_user='+user
           				       + ' ansible_ssh_private_key_file=/vagrant/privateKeys/manish_mac_keypair_ec2.pem\n'
          		
              console.log("record:=====> "+record)
          		
          		fs.appendFile("/vagrant/inventory/inventory", record, function(error) {
                	if (error) 
                  {
                        	console.log("Could not write to inventory file");
                	}
                  else
                  {
                        	console.log("Successfully written to inventory file");
                	}
          		
              });

	});

 });

}

console.log("Timer has expired. Ip Address should be available now!");
