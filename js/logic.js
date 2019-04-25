var dreams = [];
var people = [];
var places = [];


function createPerson() {
	name = document.getElementById("createname").value;
	if (name != "") {
		var np = {};
		np.id = people.length;
		np.name = name;
		np.amount = 0;
		people.push(np);
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
