// REFERENCE: AWS EC2 documentation & class workshop files 
// Set all the required stuff here

var fs = require('fs')
var needle = require("needle");
var os   = require("os");
var myaws = require('./ec2_api_inv_gen.js')

//Call the method from sample.js file - to create the instance

myaws.createInstance(function(err,data){

  if(err){
  		console.log('****** Failed To Create EC2 AWS Instance. Check the parameters again!! ',err);
  		return;
  }

  // Get the record in a variable to put into the inventory file

  var record = 'node0 ansible_ssh_host='+data.ip 
  + ' ansible_ssh_user='+data.user 
  + ' ansible_ssh_private_key_file=/vagrant/privateKeys/manish_mac_keypair_ec2.pem\n'

	//Now print the record to verify - for debugging only
	console.log("record:=====> "+record)

   //Append the record to the inventory file
   fs.appendFile('/vagrant/inventory/inventory', record, function (err) {
 
   if(err){
  	console.log('ERROR - Failed to write record for ec2 into inventory file',err);
  	return;
    }

});

}

);  // End of createInstance
