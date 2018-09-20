var dreams = [];
var people = [];
var places = [];

var currentFilteredPerson = -1;
var currentFilteredPlace = -1;
var currentFilteredMood = -1;


var moods = [
	{name:"emotional",symbol:"😦",desc:"Highly Emotional"},	//1
	{name:"sad",symbol:"😢",desc:"Sad"},			//2
	{name:"creepy",symbol:"👻",desc:"Creepy"},		//4 👀 😨 //I am literally spending my time finding the most fitting emoji for each mood //the absolute state of my life rn
	{name:"mystery",symbol:"❓",desc:"Mysterious"},		//8
	{name:"friendship",symbol:"💛",desc:"Affectionate"},	//16 
	{name:"romance",symbol:"❤️",desc:"Limerent"},		//32 
	{name:"lewd",symbol:"💜",desc:"Erotic"},		//64 
	{name:"joy",symbol:"😊",desc:"Joyous"},			//128
	{name:"yearning",symbol:"😩",desc:"Yearning"},		//256 
	{name:"fairytale",symbol:"🌄",desc:"Romantic"},		//512 ⛰️
	{name:"serenity",symbol:"😔",desc:"Serene"}		//1024

];

function refreshPage() {

	//DREAMS
	
	console.log("Refreshing View, currently filtered Person " + currentFilteredPerson + ", currently filtered Place " + currentFilteredPlace);
	
	//clear the screen
	document.getElementById("mainscreen").innerHTML = "";
	
	
	//sort
	var sortedDreams = sortByDate(dreams);
	
	//go through all the dreams
	for (var i=0; i<sortedDreams.length; i++) {
	
		if (sortedDreams[i] == undefined) continue;
		
		//check if we even want to see this dream according to the filters
		if (!sortedDreams[i].people.has(currentFilteredPerson) && currentFilteredPerson != -1) continue;
		if (!sortedDreams[i].places.has(currentFilteredPlace) && currentFilteredPlace != -1) continue;
		if (!hasMood(currentFilteredMood,sortedDreams[i].mood)) continue;
		
		//create the little icons for people
		var peopleicons = "";
		for (let item of sortedDreams[i].people) {
			var id = item;
			console.log("finding person " + id + " in database");
			//find in people database
			
			peopleicons += "<img class='filterbutton person' onclick='filterOnlyByPerson(" + id + ")' src='data:img/jpg;base64," + peoplepics[id] + "' title='" + people[id].name + "' onerror='this.src = \"defaultperson.jpg\";'></img>";
		}
		
		//create the little icons for places
		var placeicons = "";
		for (let item of sortedDreams[i].places) {
			var id = item;
			console.log("creating icon for place " + id);
			//find in places database
			
			placeicons += "<img class='filterbutton place' onclick='filterOnlyByPlace(" + id + ")' src='data:img/jpg;base64," + placespics[id] + "' title='" + places[id].name + "' onerror='this.src = \"defaultplace.jpg\";'></img>";
		}
		
		
		var dreamcontent = sortedDreams[i].content;
		var date = "" + twodigits(sortedDreams[i].day) + "." + twodigits(sortedDreams[i].month) + "." + sortedDreams[i].year;
		
		
		//create mood emojis
		var moodjis = ""; //end me
		num = sortedDreams[i].mood;
		id = 0;
		while (2**(id+1) <= num) {
			id++;
		}
		
		while (num != 0) {
			if (num >= 2**id) {
				moodjis = "<i class='moodji' title='" + moods[id].desc + "' onclick='filterByMood(" + id + ")'>" + moods[id].symbol + "</i>" + moodjis;
				num = num - (2**id);
			}
			
			id--;
			
		}
		
		
		//check if lucid
		if (sortedDreams[i].lucid) {
			classes = "lucid dream";
		}
		else {
			classes = "dream";
		}
		
		//create the div element for the dream entry and add it
		document.getElementById("mainscreen").innerHTML += "<div class='" + classes + "'><p class='dream_date'>" + date + "  " + moodjis + "</p><p class='dream_attributes'>" + peopleicons + "        " + placeicons + "</p><p class='dream_content'>" + dreamcontent + "</p></div>";
		
	}
	
	
	
	
	// PEOPLE
	
	//clear the screen
	document.getElementById("list_people").innerHTML = "";
	
	//sort array
	console.log(people);
	var sortedPeople = sortByAmount(people);
	console.log(sortedPeople);
	
	//go through all the people (max 15)
	for (var i=0; i<sortedPeople.length || i==15; i++) {
		var name = sortedPeople[i].name;
		var id = sortedPeople[i].id;
		var amount = sortedPeople[i].amount;
		
		//only show people who are in at least one dream
		if (amount == 0) break;
		
		//mark the currently filtered person
		var extraclass = "";
		if (id == currentFilteredPerson) {
			extraclass = " filtered";
		}
		
		document.getElementById("list_people").innerHTML += "<li class='filterbutton" + extraclass + "' onclick='filterByPerson(" + id + ")'>" + name + " (" + amount + ")</li>";
	}
	
	
	
	// PLACES
	
	//clear the screen
	document.getElementById("list_places").innerHTML = "";
	
	//sort array
	console.log(places);
	var sortedPlaces = sortByAmount(places);
	console.log(sortedPlaces);
	
	//go through all the places (max 15)
	for (var i=0; i<sortedPlaces.length || i==15; i++) {
		var name = sortedPlaces[i].name;
		var id = sortedPlaces[i].id;
		var amount = sortedPlaces[i].amount;
		
		//only show places who are in at least one dream
		if (amount == 0) break;
		
		//mark the currently filtered place
		var extraclass = "";
		if (id == currentFilteredPlace) {
			extraclass = " filtered";
		}
		
		document.getElementById("list_places").innerHTML += "<li class='filterbutton" + extraclass + "' onclick='filterByPlace(" + id + ")'>" + name + " (" + amount + ")</li>";
	}
	
	//MOODS
	
	//clear the screen
	document.getElementById("list_moods").innerHTML = "";
	
	for (var i=0; i<moods.length; i++) {
		document.getElementById("list_moods").innerHTML += "<i class='moodji' title='" + moods[i].desc + "' onclick='filterByMood(" + i + ")'>" + moods[i].symbol + "</i>";
	}
	
}


function sortByAmount(arr) {
	var ar = arr.slice(0);
	ar.sort(function(a,b){return b.amount - a.amount});
	while (ar[ar.length-1] == undefined) ar.pop();
	return ar;
}

function sortByDate(arr) {
	var ar = arr.slice(0);
	ar.sort(function(a,b){
		if (a.year!=b.year) return b.year-a.year;
		if (a.month!=b.month) return b.month - a.month;
		return b.day - a.day;
	});
	while (ar[ar.length-1] == undefined) ar.pop();
	return ar;
}


function filterByPerson(id) {
	currentFilteredPerson = id;
	
	document.getElementById("showallpeople").style.visibility = "visible";
	
	refreshPage();
}
function filterByPlace(id) {
	currentFilteredPlace = id;
	
	document.getElementById("showallplaces").style.visibility = "visible";
	
	refreshPage();
}

function filterByMood(id) {
	currentFilteredMood = id;
	
	document.getElementById("showallmoods").style.visibility = "visible";
	
	refreshPage();
}

function filterOnlyByPerson(id) {
	currentFilteredPlace = -1;
	document.getElementById("showallplaces").style.visibility = "hidden";
	filterByPerson(id);
}
function filterOnlyByPlace(id) {
	currentFilteredPerson = -1;
	document.getElementById("showallpeople").style.visibility = "hidden";
	filterByPlace(id);
}





function showallpeople() {
	currentFilteredPerson = -1;
	document.getElementById("showallpeople").style.visibility = "hidden";
	refreshPage();
}
function showallplaces() {
	currentFilteredPlace = -1;
	document.getElementById("showallplaces").style.visibility = "hidden";
	refreshPage();
}
function showallmoods() {
	currentFilteredMood = -1;
	document.getElementById("showallmoods").style.visibility = "hidden";
	refreshPage();
}



function assignAmounts(arr,identifier) {
	
	//create the amount attribute for all elements
	for (var a=0;a<arr.length;a++) {
		if (arr[a] == undefined) continue;
		arr[a]["amount"] = 0;
		console.log("assigning amount 0 to " + arr[a].name);
		
		
		
	}
	console.log("done assigning");
	
	//go through all dreams, count if person / place appears there
	for (var i=0;i<dreams.length;i++) {
		if (dreams[i] == undefined) continue;
		console.log("now trying to read people in dream " + i);
		for (let item of dreams[i][identifier]) {
			arr[item].amount += 1;
		}
	}
	
	
}


function hasMood(mood,num) {
	if (mood == -1) return true;
	id = 0;
	while (2**(id+1) <= num) {
		id++;
	}
		
	while (num != 0) {
		if (num >= 2**id) {
			if (id == mood) {
				return true;
			}
			num = num - (2**id);
		}
			
		id--;
			
	}
	return false;
}


function twodigits(s) {
	if (s>9) return "" + s;
	else return "0" + s;
}





////
////
// PARSING STUFF
////
////



var zipfile;
var xmlfile;

var peoplepics = [];
var placespics = [];

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
		
		zip.folder("pics_people").forEach(function (path,file){
			
			pr = file.async("base64");
			pr.then(function (data) {
				num = path.split(".")[0];
				
				peoplepics[Number(num)] = data;
			});
			
			promises.push(pr);
			


		});
		
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
		
		Promise.all(promises).then(function() {
			zip.file("data.xml").async("string").then(function (data) {
				parseFile(data)
			});
		});
		
		
	});
	
	
}

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
	var result = xmlfile.documentElement;

	var i;
	
	for (i=0;i<(arguments.length - 1);i++) {
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
		obj["mood"] = 0;
		obj["people"] = new Set();
		obj["places"] = new Set();
		obj["lucid"] = false;
		
		

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
				
				var attr_value = xmlValue(currentNode.children[j].childNodes[0].nodeValue);
			}
			else {
				
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

//What a fuckin mess
function xmlValue(str) {
	switch (str) {
		case "true": return true;
		case "false": return false;
	}
	if (isNaN(str)) return str;
	return Number(str);
}
