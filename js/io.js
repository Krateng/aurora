




////
////
// PARSING STUFF
////
////



var zipfile;
var xmlfile;

var peoplepics = [];
var placespics = [];



// read the file from the dropbox
function dragover(evt) {
    	evt.preventDefault();
}
function readFile(evt) {
	evt.preventDefault();
	//var fl = document.getElementById("fileupload").value;
	var file = evt.dataTransfer.files[0];
	document.getElementById("dropzone").innerHTML = file.name;


	var reader = new FileReader();
	reader.onload = (function(evt) {
		//return parseFile(reader.result);
		parseZip(reader.result);
	});
	reader.readAsArrayBuffer(file);


}


function parseZip(bytes) {
	var zip = new JSZip();

	zip.loadAsync(bytes).then(function(zip) {

		zipfile = zip
		promises = []


		//saving the picture files as raw bytes in the peoplepics array
		zip.folder("pics_people").forEach(function (path,file){
			pr = file.async("base64");
			pr.then(function (data) {
				num = path.split(".")[0];
				peoplepics[Number(num)] = data;
			});
			promises.push(pr);
		});

		//same for places
		zip.folder("pics_places").forEach(function (path,file){
			pr = file.async("base64");
			pr.then(function (data) {
				num = path.split(".")[0];
				placespics[Number(num)] = data;
			});
			promises.push(pr);
		});


		// Gotta do this nonsense because apparently JSZip only can read the files asynchronously instead of just offering a normal feckin function to read it
		// Why does everything need to be feckin asynchronous nowadays

		//basically we're combining all the promises into one and when that's done (because all are done) it starts parsing the xml file
		Promise.all(promises).then(function() {
			zip.file("data.xml").async("string").then(function (data) {
				parseFile(data)
			});
		});
	});
}

//this is for the xml file
function parseFile(filetext) {

	var parser = new DOMParser();
	xmlfile = parser.parseFromString(filetext,"text/xml");

	people = parseXMLobjects("people","person");
	places = parseXMLobjects("places","place");
	dreams = parseXMLobjects("dreams","dream");

	//add amounts
	assignAmounts(people,"people");
	assignAmounts(places,"places");

	console.log(people);
	console.log(places);

	refreshPage();

}




//Literally the best function ever
//I'm not even fecking using it anywhere!!!
//Note to self: Do not take 1 year pauses between writing on the same code

function parseXML() {
	var result = xmlfile.documentElement;

	console.log("Parsing XML with arguments " + arguments[0] + arguments[1] + arguments[2]);

	for (var i=0;i<arguments.length;i++) {
		result = result.getElementsByTagName(arguments[i])[0];
	}

	result = result.childNodes[0].nodeValue;

	return result;

}




// wat
function parseXMLobjects() {
	var result = xmlfile.documentElement; //xml root
	//var i;

	//so I don't really remember what the feck I was thinking when writing this but I should probably add some comments now
	//I guess this is a generic function to take any list of entries in an xml node at a specified depth
	//this function really is a bit too generic considering I'm dealing with clearly defined .ldd files here

	//go down the node tree as demanded by the function arguments, but not the last one
	//all non-last arguments are assumed to be unique, the last argument is the actual thing we have a list of
	for (var i=0;i<(arguments.length - 1);i++) {
		result = result.getElementsByTagName(arguments[i])[0];
	}
	result = result.getElementsByTagName(arguments[i]);


	//result becomes an array here!
	//this is not elegant keeping it in the same variable and all but kinda funny if it actually works
	var resultlist = [];
	for (var k=0;k<result.length;k++) {

		var obj = new Object();
		var currentNode = result[k];


		// SET DEFAULTS
		//I made this whole thing super generalized and now I'm just hardcoding this anyway
		//everything is fecked
		if (arguments[0] == "dreams") {
			obj = {"mood":0,"people":new Set(),"places":new Set(),"lucid":false};
		}


		// go through the attributes of this object
		for (var j=0;j<currentNode.children.length;j++) {
			var attr_name = currentNode.children[j].nodeName;

			// the old system would check if its a property with several child nodes, but if the property is empty obviously that wouldn't work, so we're just hardcoding the two things that are sets (people and places)
			//if (!currentNode.children[j].childNodes[0].hasChildNodes() && currentNode.children[j].childNodes.length == 1) {
			//
			//	var attr_value = xmlValue(currentNode.children[j].childNodes[0].nodeValue);
			//}
			//else {
			//
			//	var set = new Set();
			//	for (var l=0;l<currentNode.children[j].children.length;l++) {
			//		set.add(xmlValue(currentNode.children[j].children[l].childNodes[0].nodeValue));
			//	}
			//	var attr_value = set;
			//}


			if (attr_name != "people" && attr_name != "places") {
				// single value
				var attr_value = xmlValue(currentNode.children[j].childNodes[0].nodeValue);
			}
			else {
				// set of values
				var set = new Set();
				for (var l=0;l<currentNode.children[j].children.length;l++) {
					set.add(xmlValue(currentNode.children[j].children[l].childNodes[0].nodeValue));
				}
				var attr_value = set;
			}
			obj[attr_name] = attr_value;
		}

		//Writing the objects in an array with the id as key
		resultlist[obj.id] = obj;
		console.log("write object with id " + obj.id + " in array");
		console.log(obj);
	}

	return resultlist;
}

//What a feckin mess
function xmlValue(str) {
	switch (str) {
		case "true": return true;
		case "false": return false;
	}
	if (isNaN(str)) return str;
	return Number(str);
}










////
////
// SAVING THE CHANGED DIARY
////
////

function Indent(num) {
	r = "";
	while (num>0) {
		r += "	";
		num--;
	}
	return r;
}


function createZipfile() {
	var newzipfile = new JSZip();
	newzipfile.file("data.xml",createXMLfile());
	newzipfile.folder("pics_people");
	newzipfile.folder("pics_places");
	for (var i=0;i<peoplepics.length;i++) {
		newzipfile.folder("pics_people").file(i + ".jpg",peoplepics[i], {base64: true});
	}
	for (var i=0;i<placespics.length;i++) {
		newzipfile.folder("pics_places").file(i + ".jpg",placespics[i], {base64: true});
	}
	promise = newzipfile.generateAsync({type : "blob"}).then(function(blob) {
		saveAs(blob,"mydreamdiary.ldd");
	});

}

function createXMLfile() {

	//If there has ever been a function with amazing potential to be simplified, generalized and elegantized, this one is it
	//and one day, I will reduce it to a three-liner
	//but it is not this day


	output = "<dreamdata>\n";

	//people
	output += Indent(1);
	output += "<people>\n";

	for (var i=0;i<people.length;i++) {
		output += Indent(2);
		output += "<person>\n";
		for (attr in people[i]) {
			if (attr == "amount") break;
			output += Indent(3);
			output += "<" + attr + ">" + people[i][attr] + "</" + attr + ">\n";
		}
		output += Indent(2);
		output += "</person>\n";
	}

	output += Indent(1);
	output += "</people>\n";

	//places
	output += Indent(1);
	output += "<places>\n";
	for (var i=0;i<places.length;i++) {
		output += Indent(2);
		output += "<place>\n";
		for (attr in places[i]) {
			if (attr == "amount") break;
			output += Indent(3);
			output += "<" + attr + ">" + places[i][attr] + "</" + attr + ">\n";
		}
		output += Indent(2);
		output += "</place>\n";
	}
	output += Indent(1);
	output += "</places>\n";

	//dreams
	output += Indent(1);
	output += "<dreams>\n";
	for (var i=0;i<dreams.length;i++) {
		output += Indent(2);
		output += "<dream>\n";
		for (attr in dreams[i]) {
			if (attr == "amount") {}
			else if (typeof dreams[i][attr] == "object") {
				output += Indent(3);
				output += "<" + attr + ">\n";
				dreams[i][attr].forEach(function(k,v,s) {
					output += Indent(4);
					output += "<entry>" + v + "</entry>\n";
				});
				output += Indent(3);
				output += "</" + attr + ">\n";
			}
			else {
				output += Indent(3);
				output += "<" + attr + ">" + dreams[i][attr] + "</" + attr + ">\n";
			}
		}
		output += Indent(2);
		output += "</dream>\n";
	}
	output += Indent(1);
	output += "</dreams>\n";


	output += "</dreamdata>";

	return output;
}
