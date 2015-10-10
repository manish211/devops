var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');
var tracker;
//REFERENCE: Stackoverflow.com 
function allCombinations(arg) {
    var r = [], max = arg.length-1;
    // var r = [], arg=arguments,max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(arg[i][j]);
            if (i==max)
                r.push(a);
            else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
}

function main()
{
	var args = process.argv.slice(2);
	//console.log("arguments passed:"+args)

	//process.exit();
	if( args.length == 0 )
	{
		args = ["subject.js"];
		// args = ["ok.js"];
	}
	var filePath = args[0];   // contains subject.js

	// console.log("filepath:"+filePath);
	// process.exit()

	constraints(filePath);

	generateTestCases(filePath);

}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
	if( greaterThan )
		return Random.integer(constraintValue,constraintValue+10)(engine);
	else
		return Random.integer(constraintValue-10,constraintValue)(engine);
}

function Constraint(properties)
{
	this.ident = properties.ident;
	this.expression = properties.expression;
	this.operator = properties.operator;
	this.value = properties.value;
	this.funcName = properties.funcName;
	// Supported kinds: "fileWithContent","fileExists"
	// integer, string, phoneNumber
	this.kind = properties.kind;
}

function fakeDemo()
{
	console.log( faker.phone.phoneNumber() );
	console.log( faker.phone.phoneNumberFormat() );
	console.log( faker.phone.phoneFormats() );
}

var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'path/fileExists': {}
	},
	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content',
		}
	},
	fileWithNoContent:
	{
		pathNoContent:
		{
			file1: '',
		}
	}
};


// var options =
// {
// 	notDefined: {},
//     normalize: "undefined",


// }

function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
                child.parent = object;
                    traverseWithParents(child, visitor);
            }
        }
    }
}


function generateTestCases(filePath)
{

	// var content = "var subject = require('./subject.js')\nvar mock = require('mock-fs');\n";

	var content = "var subject = require('./"+filePath+"')\nvar mock = require('mock-fs');\n";

	 var allComboArrayOfArrays;

	console.log("================================%%%%========================");
	// console.dir(functionConstraints);

	// console.log("         ^^^^^^^^^^$$$$$$$$^^^^^^^^^^^^");
	// for( var funcName in functionConstraints){
	// 	console.dir(functionConstraints.inc.constraints[3]);
	// }

	// console.log("         ^^^^^^^^^^$$$$$$$$^^^^^^^^^^^^");
	
	for ( var funcName in functionConstraints )
	{
		var params = {};

		// console.log("funcName:"+funcName);  //funcName = inc
		// process.exit();

		console.log("------------------------*****-----------");
		console.log(functionConstraints);
		console.dir(functionConstraints);
		// console.dir(functionConstraints.inc);

		// initialize params

		// console.log("funcName.params.length:"+functionConstraints[funcName].params.length);  //length is 2
		// process.exit();
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];

			console.log("ParamName:"+paramName);   //prints p and q
			//params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			// params[paramName] = '\'\'';
			params[paramName] = [];
		}

		console.log("===============PARAMS BELOW=============================");
		console.log( params );
		// process.exit();
		var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
		console.log("=========ARGS BELOW==========");
		console.log(args);
		console.log("==========ARGS END===========");

		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;
		console.dir(constraints);

		// process.exit();
		// Handle global constraints...
		var fileWithContent = _.some(constraints, {kind: 'fileWithContent' });
		var fileWithNoContent = _.some(constraints, {kind: 'fileWithNoContent' });
		var pathExists      = _.some(constraints, {kind: 'fileExists' });


// for(var i=0; i< functionConstraints[funcName].params.length; i++){

// 	var paramName = functionConstraints[funcName].params[i];

// 	for( var c = 0; c < constraints.length; c++){

// 			var constraint = constraints[c];

// 			if( params.hasOwnProperty( constraint.ident ) )
// 			{
// 				console.log("HAPPY\t\tHAPPY");
// 				console.log("constraint.value:"+constraint.value);
// 				console.log("constraint.ident:"+constraint.ident);
// 				params[constraint.ident] = constraint.value;
// 			}

// 	}
// }
		// plug-in values for parameters

		// console.log("constraints.length:"+constraints.length);  //length is 4 - there are 4 constraints 2 values for p and 2 values for q
		// process.exit();
		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];
			console.log("----------OKAY--------")
			console.log(constraint);

			console.log("\n\n----------OKAY--------")

// Here it goes through all the p and q values . But only the last overwritten stays

			if( params.hasOwnProperty( constraint.ident ) )
			{
				console.log("HAPPY\t\tHAPPY");
				console.log("constraint.value:"+constraint.value);
				console.log("constraint.ident:"+constraint.ident);
				// params[constraint.ident] = constraint.value;
				params[constraint.ident].push(constraint.value);
			}

			
		}

		console.log("HELLO");
		console.log("----- PRINTING PARAMS BELOW -----\n");
		console.dir(params);
		console.log("\n\n----- PRINTING PARAMS END\n\n");
		console.log("HELLO");

		console.log(typeof(params));

		var keysbyindex = Object.keys(params);

		console.log(keysbyindex);

		var array = [];

		for(var i = 0; i < keysbyindex.length ; i++){
			array.push(params[keysbyindex[i]]);
		}


 // x=allCombinations(params.x,params.y,params.z,params.mode);
console.log("ARRAY BELOW ---");
 console.log(array);
 console.log("-----+");
 allComboArrayOfArrays=allCombinations(array);

console.log("-----");
 console.log(allComboArrayOfArrays);

console.log("MACHINE___"); 

 // process.exit();x


		console.log("params keys:"+params[0]);

		var keys = Object.keys(params)   // keys will have p and q 2 elements 

		var lengthOfList=params[keys[0]].length

		console.log(lengthOfList);

		var finalArgsList = []

		for(var listIndex = 0; listIndex < lengthOfList ; listIndex++){

			var argValues = []

			for( var keyIndex = 0 ; keyIndex < keys.length ; keyIndex++){

				argValues.push(params[keys[keyIndex]][listIndex]); // for each key,0
				// console.log("keyIndex:"+keyIndex);
				// console.log("listIndex:"+listIndex);
				// console.log("keys[keyIndex]:"+keys[keyIndex]);
				// console.log("params[p]:"+params["p"][0]);
				// console.log("VALUE:"+params[keys[keyIndex]]);
			}

			console.log(argValues);
			finalArgsList.push(argValues)
		}

		console.log("now......");

 console.log(finalArgsList[0]);
 console.log(finalArgsList[1]);

 console.log("---++====");

 // x=allCombinations([1,2,3],[4,5,6]);


 // x=allCombinations(params[0],params[1],params[2]);

 // x=allCombinations(finalArgsList[0],finalArgsList[1]);


 // for( var i=0; i < finalArgsList.length ; i++){


 // }


 // process.exit();
		// console.log(finalArgsList[0].join(","));
		// console.log(finalArgsList[1].join(","));

		// process.exit();

		for( var key in params){
			console.log("------------------------");
			console.log("key from params:"+key);
			console.log("Value of key from params:"+params[key][0]);
		}

		console.log("------------------------");
		console.dir(params);
		 // process.exit();


		var args = Object.keys(params).map( function(k) {return finalArgsList[k]; }).join(",");  //args contains a list with -1 and 10 values only

		// Prepare function arguments.
		var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");  //args contains a list with -1 and 10 values only

		console.log("-----------------------------")
		console.log("args:="+args);
		console.log("-----------------------------")
		if( pathExists || fileWithContent || fileWithNoContent)
		{
			console.log("I am inside");
			console.log("LENGTH:"+allComboArrayOfArrays.length);

			var comboLength = allComboArrayOfArrays.length;

			if(comboLength == 0){

				var paramKeys = Object.keys(params);
				console.log(paramKeys);
				console.dir(params);

				for(var key in paramKeys){

					console.log("KEY.length:"+params[paramKeys[key]].length);

					for(var i=0; i<params[paramKeys[key]].length;i++){

						console.log("VALUE:"+params[paramKeys[key]][i]);
						args = params[paramKeys[key]][i];
						content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
						content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, args);

						console.log("CONTENT::"+content);

					}

					break;	
				}


			}
			else
			{
				console.dir(allComboArrayOfArrays);
				for(var i = 0; i < allComboArrayOfArrays.length; i++){
					args = allComboArrayOfArrays[i].join(",");
					console.log(args);
					console.log("======");
			

					// process.exit();

					content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
					content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
					content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, args);
					content += generateMockFsTestCases(!pathExists,fileWithNoContent,funcName, args);

					console.log("CONTENT::"+content);
			}

			}
			

			// Bonus...generate constraint variations test cases....
		}
		else
		{
			// Emit simple test case.
			console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
			// console.log("CONTENT::"+content);
			// console.log("funcName:"+funcName);
			// console.log("args:"+args);  // contains -1 and 10 as of now. Should contain other values also

			// for (var i = 0; i < finalArgsList.length; i++) {
			// 	args = finalArgsList[i].join(",");
			// 	content += "subject.{0}({1});\n".format(funcName,args);
			// }

			console.dir(allComboArrayOfArrays);
			for(var i = 0; i < allComboArrayOfArrays.length; i++){
				args = allComboArrayOfArrays[i].join(",");
				console.log("ARGUMENTS:"+args);
				content += "subject.{0}({1});\n".format(funcName,args);
			}
			console.log("CONTENT::"+content);
			console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
		}
	}

	fs.writeFileSync('test.js', content, "utf8");

}

function generateMockFsTestCases (pathExists,fileWithContent,funcName,args) 
{
	var testCase = "";
	// Build mock file system based on constraints.
	var mergedFS = {};
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { 

			mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; 
			console.log("=================++================");
			console.log("attrname pathExists:"+attrname);
			console.dir(mergedFS[attrname]);
			console.log("=================++================");
		}
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { 

			mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname];
				
			console.log("=================++================");
			console.log("attrname fileWithContent:"+attrname);
			console.dir(mergedFS[attrname]);
			console.log("=================++================");
			 }

			 for (var attrname in mockFileLibrary.fileWithNoContent) { 

			mergedFS[attrname] = mockFileLibrary.fileWithNoContent[attrname];
				
			console.log("=================++================");
			console.log("attrname fileWithNoContent:"+attrname);
			console.dir(mergedFS[attrname]);
			console.log("=================++================");
			 }
	}

	// process.exit();
	testCase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testCase += "\tsubject.{0}({1});\n".format(funcName, args );
	testCase+="mock.restore();\n";
	return testCase;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);
			// console.dir(funcName);
			// console.dir(node.params);
			// console.dir(node.defaults);
			// console.dir(node.body);
			// console.dir(node.loc.start);
			// console.dir(node);
			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));
			// process.exit();

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};

			// Check for expressions using argument.
			traverse(node, function(child)
			{

				// console.log("========= *********==========");
				// console.dir(child);


				// if( child.type === 'BinaryExpression' && child.operator == "&&"){

				// 		var expression = buf.substring(child.range[0], child.range[1]);
				// 		// console.log("EXPRESSION=>"+expression);
				// 		var rightHand = buf.substring(child.right.range[0], child.right.range[1])
				// 		console.log(">>>>>>>>>>> !!!!! >>>>>>>>>>");
				// 		console.log("Expression:"+expression);
				// 		console.log("rightHand:"+rightHand);

				// 		console.log(">>>>>>>>>>> !!!!! >>>>>>>>>>");
				// 		process.exit();
				// }


				if( child.type == "BinaryExpression" && tracker){

					console.dir(child);
					console.log("tracker:"+tracker);
					console.dir(params);
					console.log(params[0]);
					console.log(child.right.value);
					// process.exit();

					functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: params[0],
									value:  '"' + child.right.value + "9854889"+'"',
									funcName: funcName,
									kind: "string",
									operator : child.operator,
									expression: expression
								}));
					// process.exit();
				}

				if( child.type === 'BinaryExpression' && child.operator == "==")
				{
					console.dir(child);

					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						// console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
						var expression = buf.substring(child.range[0], child.range[1]);
						// console.log("EXPRESSION=>"+expression);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));


						if(typeof(rightHand) == 'string'){

							var mutatedRightHand = "\"mutated123982832AXZ\""  // randomize this

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: mutatedRightHand,
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
						}
						else
						{

							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand + 1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
						}

						// console.log("RIGHTHAND=>"+rightHand);

						// console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")

						// process.exit();
						

						

						// console.dir(functionConstraints.inc);
						// process.exit();
					}
				}

				// if( child.type === 'CallExpression' && child.callee.property && child.callee.property.name == "indexOf"){
				// 	console.log("------ HU HA HA HU HA HA ----=====++++*****");
				// 	console.dir(params);
				// 	var expression = buf.substring(child.range[0], child.range[1]);
				// 	console.log(expression);
				// 	console.dir(child.right);
				// 	var rightHandValue = child.right.value;
				// 	console.log("rightHand:"+rightHand);
				// 	console.dir(child);
				// 	process.exit();
				// }



				//=============================================================================================================

				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="indexOf" )
				{
					// console.log("HAHAHAHAH");
					console.dir(child);
					console.log("PARAMS:="+params);

						var expression = buf.substring(child.range[0], child.range[1]);
					console.log("EXPRESSION:"+expression);
					console.log("okayji");
					console.log(child.arguments[0].type);
					console.log(child.arguments[0].value);
					console.log(expression.substring(0,expression.indexOf(".indexOf")));
					// process.exit();
					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								// ident: params[p],
								ident:expression.substring(0,expression.indexOf(".indexOf")), 
								value:  "\""+child.arguments[0].value+"\"",
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));

					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								// ident: params[p],
								ident:expression.substring(0,expression.indexOf(".indexOf")), 
								value:  "\"mutated123982832AXZ999222lk\"",
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));	
				}


				//=============================================================================================================
				
				// if( child.type == "VariableDeclaration"){

				// 	console.dir(child);
				// 	console.log("===++==sfds")
				// 	process.exit();
				// }

				// if( child.type == "CallExpression" &&
				// 	child.callee.property &&
				// // 	child.callee.property.name = "substring"){
				// if( child.type == "CallExpression" && 
				// 	 child.callee.property &&
				// 	 child.callee.property.name =="substring" )
				// {

				// 	var start=child.arguments[0].value ;
				// 	var end = child.arguments[1].value ;
				// 	var attachedVariable = child.callee.object.name;
				// 	console.log("=====+++++========\n\n");
				// 	console.log("start:"+start);
				// 	console.log("end:"+end+"\n\n");

				// 	console.log("=====+++++========\n\n");
				// 	console.dir(child);
				// 	console.log("ARARA***");

				// 	// process.exit();

				// 	traverseWithParents(child,function(parent){

				// 		console.log("attachedVariable:"+attachedVariable);
				// 		console.log("\n\n ======== INSIDE PARENT NOW =======\n\n");

				// 		// console.dir(parent);
				// 		// process.exit();
				// 		// &&
				// 		// parent.init.callee.object.name == attachedVariable)

				// 		// console.dir(parent)
				// 		// process.exit();

				// 		if( parent.type = "VariableDeclaration") 
				// 		{
				// 			console.log(parent.callee.object.name);
				// 			console.log("attachedVariable:"+attachedVariable);
				// 			console.log(parent.declarations[0].type);
				// 			console.dir(parent);
				// 			process.exit();

				// 			var leftVariable = parent.id.name;
				// 			console.log("leftVariable:"+leftVariable);
				// 			process.exit();
				// 		}
				// 		// if( parent.type == "Binary")


				// 	}
				// 		);  // END OF CALLBACK traversewithparents


				// }

				//=============================================================================================================

				if( child.type == "CallExpression" &&
					child.arguments[0].name == "phoneNumber")
				{
					console.log("MILGAYA..");
					console.dir(child);

					var randomMutateVar1 = "abc123sdfdsjl12e32e";
					var randomMutateVar2 = "12345";
					var randomMutateVar3 = "abcd";
					var randomMutateVar4 = "ABCD";

					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								// ident: params[p],
								ident: child.arguments[0].name,
								value:  "\""+randomMutateVar1+"\"",
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								// ident: params[p],
								// ident: child.callee.object.name,
								ident: child.arguments[0].name, 
								value:  "\""+randomMutateVar2+"\"",
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								// ident: params[p],
								ident: child.arguments[0].name,
								value:  "\""+randomMutateVar3+"\"",
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								// ident: params[p],
								ident: child.arguments[0].name,
								value:  "\""+randomMutateVar4+"\"",
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));



					// process.exit();

				}

				//=============================================================================================================

				if( child.type === 'LogicalExpression' && child.operator == "||") // pending : remove ||
				{
					// console.dir(child);
					if( child.left.type == 'UnaryExpression' 
						&& child.left.argument.type == 'Identifier'
						&& (params.indexOf(child.left.argument.name) > -1))
					{

						console.log("-------\n\n\n\n\n HELLOO I AM FROM INDIA ------\n\n----");
						console.dir(child);
						console.log("++++")
						console.dir(child.right.argument.object);

						// process.exit();
						// get expression from original source code:
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.argument.name,
								value: "{}", 
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.argument.name,
								value: true, 
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.argument.name,
								value: false, 
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
						// functionConstraints[funcName].constraints.push( 
						// 	new Constraint(
						// 	{
						// 		ident: child.left.argument.name,
						// 		value: "{ normalize : false }", 
						// 		funcName: funcName,
						// 		kind: "string",
						// 		operator : child.operator,
						// 		expression: expression
						// 	}));
						// functionConstraints[funcName].constraints.push( 
						// 	new Constraint(
						// 	{
						// 		ident: child.left.argument.name,
						// 		value: "{ normalize : true }", 
						// 		funcName: funcName,
						// 		kind: "string",
						// 		operator : child.operator,
						// 		expression: expression
						// 	}));
					}


				}
				//=============================================================================================================

				if(child.type == "CallExpression" &&
				   	child.callee.property &&
					 child.callee.property.name =="substring") {	
						
					tracker = child.callee.object.name
					console.log("tracker:"+tracker);
					// process.exit();
				}


				//=============================================================================================================

				if( child.type === 'LogicalExpression' && child.operator == "||") // pending : remove ||
				{
					console.dir(child);
					if( child.right.type == 'UnaryExpression' 
						&& child.right.argument.type == 'MemberExpression'
						&& (params.indexOf(child.right.argument.object.name) > -1))
					{

						console.log("-------\n\n\n\n\n HELLOO I AM FROM INDIA ------\n\n----");
						console.dir(child);
						console.log("++++")
						console.dir(child.right.argument.object);

						// process.exit();
						// get expression from original source code:
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.right.argument.name,
								value: "{}", 
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.right.argument.object.name,
								value: true, 
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.right.argument.object.name,
								value: false, 
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.right.argument.object.name,
								value: "{ "+ child.right.argument.property.name +" : true }", 
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.right.argument.object.name,
								value: "{ "+ child.right.argument.property.name +" : false }", 
								funcName: funcName,
								kind: "string",
								operator : child.operator,
								expression: expression
							}));
					}
				}

				//=============================================================================================================

								if( child.type == "CallExpression" && 
									 child.callee.property &&
									 child.callee.property.name =="replace" &&
									 child.callee.object.name != "formatString")
								{
									// console.log("HAHAHAHAH");
									console.dir(child);
									console.log("PARAMS:="+params);

									var expression = buf.substring(child.range[0], child.range[1]);
									console.log("EXPRESSION:"+expression);
									console.log("okayji");
									console.log(child.arguments[0].type);
									console.log(child.arguments[0].value);
									console.dir(child.callee);
									console.log(child.callee.object.name);
									console.log("***");
									var randomMutateVar1 = "abc123sdfdsjl12e32e";
									var randomMutateVar2 = "12345";
									var randomMutateVar3 = "abcd";
									var randomMutateVar4 = "ABCD";

									// process.exit();
									// console.log(expression.substring(0,expression.indexOf(".indexOf")));
									// process.exit();
									// process.exit();
									functionConstraints[funcName].constraints.push( 
											new Constraint(
											{
												// ident: params[p],
												ident: child.callee.object.name,
												value:  "\""+randomMutateVar1+"\"",
												funcName: funcName,
												kind: "string",
												operator : child.operator,
												expression: expression
											}));
									functionConstraints[funcName].constraints.push( 
											new Constraint(
											{
												// ident: params[p],
												// ident: child.callee.object.name,
												ident: child.callee.object.name,
												value:  "\""+randomMutateVar2+"\"",
												funcName: funcName,
												kind: "string",
												operator : child.operator,
												expression: expression
											}));
									functionConstraints[funcName].constraints.push( 
											new Constraint(
											{
												// ident: params[p],
												ident: child.callee.object.name,
												value:  "\""+randomMutateVar3+"\"",
												funcName: funcName,
												kind: "string",
												operator : child.operator,
												expression: expression
											}));
									functionConstraints[funcName].constraints.push( 
											new Constraint(
											{
												// ident: params[p],
												ident: child.callee.object.name,
												value:  "\""+randomMutateVar4+"\"",
												funcName: funcName,
												kind: "string",
												operator : child.operator,
												expression: expression
											}));
								}

				if( child.type == "CallExpression" && 
									 child.callee.property &&
									 child.callee.property.name =="replace" &&
									 child.callee.object.name == "formatString")
								{
									// console.log("HAHAHAHAH");
									console.dir(child);
									console.log("PARAMS:="+params);

									var expression = buf.substring(child.range[0], child.range[1]);
									console.log("EXPRESSION:"+expression);
									console.log("okayji");
									console.log(child.arguments[0].type);
									console.log(child.arguments[0].value);
									console.dir(child.callee);
									console.log(child.callee.object.name);
									console.log("***");
									var randomMutateVar1 = "abc123sdfdsjl12e32e";
									// var randomMutateVar2 = "12345";
									var randomMutateVar2 = "(NNN) NNN-NNNN"

									// process.exit();

									// process.exit();
									// console.log(expression.substring(0,expression.indexOf(".indexOf")));
									// process.exit();
									// process.exit();
									functionConstraints[funcName].constraints.push( 
											new Constraint(
											{
												// ident: params[p],
												ident: child.callee.object.name,
												value:  "\""+randomMutateVar1+"\"",
												funcName: funcName,
												kind: "string",
												operator : child.operator,
												expression: expression
											}));
									functionConstraints[funcName].constraints.push( 
											new Constraint(
											{
												// ident: params[p],
												// ident: child.callee.object.name,
												ident: child.callee.object.name,
												value:  "\""+randomMutateVar2+"\"",
												funcName: funcName,
												kind: "string",
												operator : child.operator,
												expression: expression
											}));
									// functionConstraints[funcName].constraints.push( 
									// 		new Constraint(
									// 		{
									// 			// ident: params[p],
									// 			ident: child.callee.object.name,
									// 			value:  "\""+randomMutateVar3+"\"",
									// 			funcName: funcName,
									// 			kind: "string",
									// 			operator : child.operator,
									// 			expression: expression
									// 		}));
									functionConstraints[funcName].constraints.push( 
											new Constraint(
											{
												// ident: params[p],
												ident: child.callee.object.name,
												value:  "\""+child.arguments[0].value+"asdfds\"",
												funcName: funcName,
												kind: "string",
												operator : child.operator,
												expression: expression
											}));
								}



				//=============================================================================================================

				if( child.type === 'BinaryExpression' && child.operator == ">")
				{
					console.dir(child);
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						// console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
						var expression = buf.substring(child.range[0], child.range[1]);
						// console.log("EXPRESSION=>"+expression);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])
						// console.log("RIGHTHAND=>"+rightHand);
						
						// console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand),
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)+1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}
				}

				if( child.type === 'BinaryExpression' && child.operator == "<")
				{
					console.dir(child);
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
						var expression = buf.substring(child.range[0], child.range[1]);
						console.log("EXPRESSION=>"+expression);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])
						console.log("RIGHTHAND=>"+rightHand);
						
						console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)+1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));


						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: parseInt(rightHand)-1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}
				}

				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="existsSync" )
				{
					// console.log("HAHAHAHAH");
					 console.dir(child);
					 console.log("PARAMS:="+params);

						var expression = buf.substring(child.range[0], child.range[1]);
					 console.log("EXPRESSION:"+expression);
					 // process.exit();
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{

							console.log(child.arguments[0].name);
							console.dir(child);
							// process.exit();
							console.log(params[p]);
							console.dir(params);
							console.log("****inside existsSync constraint handling part***");
							// process.exit();
							var passValue;
							if( params[p] == "dir"){

								passValue = "'pathContent'";
								
								// EMPTY DIRECTORY CASE
								functionConstraints[funcName].constraints.push( 
									new Constraint(
									{
										ident: params[p],
										value:  "{}",
										funcName: funcName,
										kind: "fileWithContent",
										operator : child.operator,
										expression: expression
									}));

							// UNDEFINED DIRECTORY CASE

								functionConstraints[funcName].constraints.push( 
									new Constraint(
									{
										ident: params[p],
										value:  "\"RandomMutation12334dsdf3243\"",
										funcName: funcName,
										kind: "fileWithContent",
										operator : child.operator,
										expression: expression
									}));
							
							}
							else
							{
								passValue = "'pathContent/file1'";


								// UNDEFINED FILE CASE
								functionConstraints[funcName].constraints.push( 
									new Constraint(
									{
										ident: params[p],
										value:  "\"RandomMutation12334dsdf3243\"",
										funcName: funcName,
										kind: "fileWithContent",
										operator : child.operator,
										expression: expression
									}));

								// EMPTY CONCRETE FILE WITH NO CONTENT
								functionConstraints[funcName].constraints.push( 
									new Constraint(
									{
										ident: params[p],
										value: "'pathNoContent/file1'", 
										funcName: funcName,
										kind: "fileWithNoContent",
										operator : child.operator,
										expression: expression
									}));
							}

							// CONCRETE FILE/DIRECTORY WITH SOME CONTENT
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  passValue,
								funcName: funcName,
								kind: "fileWithContent",
								operator : child.operator,
								expression: expression
							}));

							console.log("OYE OYE");
						}
					}
					// process.exit();
				}

				if( child.type == "CallExpression" &&
					 child.callee.property &&
					 child.callee.property.name =="readdirSync")
				{
					// console.log("=========== >>>>>>>> ==============");

					// console.dir(child);
					// console.log("=========== >>>>>>>> ==============");

						var expression = buf.substring(child.range[0], child.range[1]);
					// console.log("EXPRESSION:"+expression);
					// process.exit();
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								// A fake path to a file
								value:  "'path/fileExists'",
								funcName: funcName,
								kind: "fileExists",
								operator : child.operator,
								expression: expression
							}));

							// CONCRETE FILE/DIRECTORY WITH SOME CONTENT
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent'",
								funcName: funcName,
								kind: "fileWithContent",
								operator : child.operator,
								expression: expression
							}));

							// UNDEFINED DIRECTORY CASE

							functionConstraints[funcName].constraints.push( 
								new Constraint(
								{
									ident: params[p],
									value:  "\"RandomMutation12334dsdf3243\"",
									funcName: funcName,
									kind: "fileWithContent",
									operator : child.operator,
									expression: expression
								}));
						}
					}
				}

			});

			// console.log( functionConstraints[funcName]);

		}
	});
}

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);

    // console.log("\n\n\n\n\n\n");
    // console.log("*************************************************************")
    // console.dir(object);

    // console.log("*************************************************************")
    for (key in object) {
    	// console.log("KEY: "+key)
        if (object.hasOwnProperty(key)) {
        	// console.log("OBJECT IS HAVING OWN PROPERTY AS KEY");
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();