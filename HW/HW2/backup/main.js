var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');
var tracker;


// REFERENCE: http://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
// This answer was referred to generate all possible combinations.

function allCombinations(arg) {
    var r = [], max = arg.length-1;
    // var r = [], arg=arguments,max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); 
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

	if( args.length == 0 )
	{
		args = ["subject.js"];
		// args = ["ok.js"];
	}
	var filePath = args[0];   // contains subject.js

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

	
	for ( var funcName in functionConstraints )
	{
		var params = {};

		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];

			params[paramName] = [];
		}

		var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");

		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;

		// Handle global constraints...
		var fileWithContent = _.some(constraints, {kind: 'fileWithContent' });
		var fileWithNoContent = _.some(constraints, {kind: 'fileWithNoContent' });
		var pathExists      = _.some(constraints, {kind: 'fileExists' });


		// plug-in values for parameters

		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];

			if( params.hasOwnProperty( constraint.ident ) )
			{
				// params[constraint.ident] = constraint.value;
				params[constraint.ident].push(constraint.value);
			}

			
		}

		var keysbyindex = Object.keys(params);

		var array = [];

		for(var i = 0; i < keysbyindex.length ; i++){
			array.push(params[keysbyindex[i]]);
		}


 allComboArrayOfArrays=allCombinations(array);

		var keys = Object.keys(params)   // keys will have p and q 2 elements 

		var lengthOfList=params[keys[0]].length

		var finalArgsList = []

		for(var listIndex = 0; listIndex < lengthOfList ; listIndex++){

			var argValues = []

			for( var keyIndex = 0 ; keyIndex < keys.length ; keyIndex++){

				argValues.push(params[keys[keyIndex]][listIndex]); // for each key,0
			}

			// console.log(argValues);
			finalArgsList.push(argValues)
		}


		// for( var key in params){
		// 	console.log("------------------------");
		// 	console.log("key from params:"+key);
		// 	console.log("Value of key from params:"+params[key][0]);
		// }


		var args = Object.keys(params).map( function(k) {return finalArgsList[k]; }).join(",");  //args contains a list with -1 and 10 values only

		// Prepare function arguments.
		var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");  //args contains a list with -1 and 10 values only

		if( pathExists || fileWithContent || fileWithNoContent)
		{

			var comboLength = allComboArrayOfArrays.length;

			if(comboLength == 0){

				var paramKeys = Object.keys(params);

				for(var key in paramKeys){

					for(var i=0; i<params[paramKeys[key]].length;i++){

						args = params[paramKeys[key]][i];
						content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
						content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, args);

					}

					break;	
				}


			}
			else
			{
				for(var i = 0; i < allComboArrayOfArrays.length; i++){
					args = allComboArrayOfArrays[i].join(",");

					content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
					content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
					content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, args);
					content += generateMockFsTestCases(!pathExists,fileWithNoContent,funcName, args);

			}

			}
			

			// Bonus...generate constraint variations test cases....
		}
		else
		{
			for(var i = 0; i < allComboArrayOfArrays.length; i++){
				args = allComboArrayOfArrays[i].join(",");
				content += "subject.{0}({1});\n".format(funcName,args);
			}
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
		}
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { 

			mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname];
				
			 }

			 for (var attrname in mockFileLibrary.fileWithNoContent) { 

			mergedFS[attrname] = mockFileLibrary.fileWithNoContent[attrname];
				
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

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};

			// Check for expressions using argument.
			traverse(node, function(child)
			{

				if( child.type == "BinaryExpression" && tracker){


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
				}

				if( child.type === 'BinaryExpression' && child.operator == "==")
				{

					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
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

					}
				}

				//=============================================================================================================

				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="indexOf" )
				{

						var expression = buf.substring(child.range[0], child.range[1]);
						
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

				if( child.type == "CallExpression" &&
					child.arguments[0].name == "phoneNumber")
				{

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

				}

				//=============================================================================================================

				if( child.type === 'LogicalExpression' && child.operator == "||") // pending : remove ||
				{
					if( child.left.type == 'UnaryExpression' 
						&& child.left.argument.type == 'Identifier'
						&& (params.indexOf(child.left.argument.name) > -1))
					{

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
					}


				}
				//=============================================================================================================

				if(child.type == "CallExpression" &&
				   	child.callee.property &&
					 child.callee.property.name =="substring") {	
						
					tracker = child.callee.object.name
				}


				//=============================================================================================================

				if( child.type === 'LogicalExpression' && child.operator == "||") // pending : remove ||
				{
					if( child.right.type == 'UnaryExpression' 
						&& child.right.argument.type == 'MemberExpression'
						&& (params.indexOf(child.right.argument.object.name) > -1))
					{

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

									var expression = buf.substring(child.range[0], child.range[1]);
									var randomMutateVar1 = "abc123sdfdsjl12e32e";
									var randomMutateVar2 = "12345";
									var randomMutateVar3 = "abcd";
									var randomMutateVar4 = "ABCD";

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

									var expression = buf.substring(child.range[0], child.range[1]);
									var randomMutateVar1 = "abc123sdfdsjl12e32e";
									// var randomMutateVar2 = "12345";
									var randomMutateVar2 = "(NNN) NNN-NNNN"

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
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						var expression = buf.substring(child.range[0], child.range[1]);
						// console.log("EXPRESSION=>"+expression);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])
						
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
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])
						
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

						var expression = buf.substring(child.range[0], child.range[1]);
					 // process.exit();
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{

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

						}
					}
					// process.exit();
				}

				if( child.type == "CallExpression" &&
					 child.callee.property &&
					 child.callee.property.name =="readdirSync")
				{

						var expression = buf.substring(child.range[0], child.range[1]);
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

    for (key in object) {
        if (object.hasOwnProperty(key)) {
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