/*
	DATABASE
*/



var dreams = [];
var people = [];
var places = [];

var peoplepics = [];
var placespics = [];


/*
	LOGIC
*/

////
//moods
////


var moods = [
	{id:0,name:"emotional",symbol:"😦",desc:"Highly Emotional"},	//1
	{id:1,name:"sad",symbol:"😢",desc:"Sad"},			//2
	{id:2,name:"creepy",symbol:"👻",desc:"Creepy"},		//4 👀 😨 //I am literally spending my time finding the most fitting emoji for each mood //the absolute state of my life rn
	{id:3,name:"mystery",symbol:"❓",desc:"Mysterious"},		//8
	{id:4,name:"friendship",symbol:"💛",desc:"Affectionate"},	//16
	{id:5,name:"romance",symbol:"❤️",desc:"Limerent"},		//32
	{id:6,name:"lewd",symbol:"💜",desc:"Erotic"},		//64
	{id:7,name:"joy",symbol:"😊",desc:"Joyous"},			//128
	{id:8,name:"yearning",symbol:"😩",desc:"Yearning"},		//256
	{id:9,name:"fairytale",symbol:"🌄",desc:"Romantic"},		//512 ⛰️
	{id:10,name:"serenity",symbol:"😔",desc:"Serene"}		//1024

];

function moodint_to_moods(moodint) {
	var moodlist = []
	id = 0;
	while (2**(id+1) <= moodint) {
		id++;
	}

	while (moodint != 0) {
		if (moodint >= 2**id) {
			moodlist.push(moods[id]);
			moodint = moodint - (2**id);
		}
		id--;
	}
	return moodlist;
}

function moods_to_moodint(moodlist) {
	moodint = 0;
	for (let mood of moodlist) {
		moodint += 2**mood;
	}
	return moodint;
}


////
// pictures
////


// the onlyReal argument specifies that only the actual existing pic should be returned,
// if none exists, return null instead
function personpic(id,onlyReal) {
	if (peoplepics[id] == undefined || peoplepics[id] == "") {
		if (onlyReal) return null;
		else return "defaultperson.jpg";
	}
	else {
		return "data:img/jpg;base64," + peoplepics[id]
	}
}
function placepic(id,onlyReal) {
	if (placespics[id] == undefined || placespics[id] == "") {
		if (onlyReal) return null;
		else return "defaultplace.jpg";
	}
	else {
		return "data:img/jpg;base64," + placespics[id]
	}
}



////
// editing data
////


function createPerson() {
	var np = {};
	np.id = people.length;
	np.amount = 0;
	people.push(np);

	changePerson(np.id);
}

function changePerson(id) {
	name = document.getElementById("createname").value;
	if (name != "") {
		people[id].name = name;

		img = document.getElementById("picture_create").style.backgroundImage;
		if (img != "" && img != undefined) {
			img = img.split(",")
			img = img[img.length-1]
			img = img.slice(0,-2)
			peoplepics[id] = img
		}
		//assignAmounts(people,"people");
		removeShade();
	}
}

function createPlace() {
	name = document.getElementById("createname").value;
	if (name != "") {
		var np = {};
		np.id = places.length;
		np.name = name;
		np.amount = 0;
		places.push(np);

		img = document.getElementById("picture_create").style.backgroundImage;
		if (img != "" && img != undefined) {
			img = img.split(",")
			img = img[img.length-1]
			img = img.slice(0,-2)
			placespics[np.id] = img
		}
		//assignAmounts(places,"places");
		removeShade();
	}
	removeShade();
}


function changeDream(dreamid) {
	peopletags = document.getElementById("createdream_people_list").getElementsByTagName("p");
	placetags = document.getElementById("createdream_places_list").getElementsByTagName("p");
	moodlets = document.getElementById("createdream_moodlets").getElementsByTagName("span")

	peopleset = new Set();
	placeset = new Set();
	moodinteger = 0;
	for (var i=0;i<moodlets.length;i++) {
		moodlet = moodlets[i];
		if (moodlet.classList.contains("moodlet-active")) {
			name = moodlet.id.replace("moodlet-","");
			for (var j=0;j<moods.length;j++) {
				if (moods[j].name == name) {
					moodinteger += Math.pow(2,j)
				}
			}
		}
	}

	for (let persontag of peopletags) {
		id = persontag.id.split("_").slice(-1)[0];
		peopleset.add(Number(id));
	}
	for (let placetag of placetags) {
		id = placetag.id.split("_").slice(-1)[0];
		placeset.add(Number(id));
	}

	desc = document.getElementById("createdream_desc").value;



	if (desc != "") {

		console.log("Editing dream " + dreamid)
		console.log(dreams[dreamid])
		dreams[dreamid].content = desc;
		dreams[dreamid].people = peopleset;
		dreams[dreamid].places = placeset;
		dreams[dreamid].mood = moodinteger;
		dreams[dreamid].lucid = false;


		assignAmounts(people,"people");
		assignAmounts(places,"places");

	}
	removeShade();

	refreshPage();
}

function createDream() {

	id = dreams.length;
	newdream = {}
	newdream.id = id

	var today = new Date();
	newdream.day = today.getDate();
	newdream.month = today.getMonth() + 1;
	newdream.year = today.getFullYear();

	dreams.push(newdream);
	changeDream(id)



}


////
// various data manipulation
////

// counts occurences and assigns them to the dict
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
		console.log("now trying to read " + identifier + " in dream " + i);
		for (let item of dreams[i][identifier]) {
			arr[item].amount += 1;
		}
	}


}


// return sorted array of people / places
// also remove empty spots from the array (as it maps IDs to objects, and IDs are not guaranteed to be continuous)
function sortByAmount(arr) {
	var ar = arr.slice(0);
	ar.sort(function(a,b){return b.amount - a.amount});
	while (ar.length > 0 && ar[ar.length-1] == undefined) ar.pop();
	return ar;
}

// return sorted array of dreams
// same story
function sortByDate(arr) {
	var ar = arr.slice(0);
	ar.sort(function(a,b){
		if (a.year!=b.year) return b.year - a.year;
		if (a.month!=b.month) return b.month - a.month;
		return b.day - a.day;
	});
	while (ar.length > 0 && ar[ar.length-1] == undefined) ar.pop();
	return ar;
}




////
// useful stuff
////

// checks if the moodinteger 'num' includes the mood 'mood'
function hasMood(mood,num) {
	if (mood == -1) return true;
	moodlist = moodint_to_moods(num)
	mood_ids = moodlist.map(x => x.id)
	return mood_ids.includes(mood)
}


function twodigits(s) {
	if (s>9) return "" + s;
	else return "0" + s;
}
