var startTime = null;
var endTime = null;
var results = null;
var showResults = null;
var startTimeObj = null;
var endTimeObj = null;
var socialSiteList = [];


// var socialSiteList = {
// 	socialSites:[],
// 	addSocialSite: function(socialSiteName){
// 		this.socialSites.push(socialSiteName);
// 	},
// 	removeSocialSite: function(position){
// 		this.socialSites.splice(position, 1);
// 	} 	
// };

window.onload = function(){
//	chrome.storage.sync.set({"socialSites":socialSiteList}, function(){});

	//document.body.style.backgroundImage = "url('img.jpg')";
	chrome.storage.sync.get(['socialSites'],function(result){
		console.log("Inside called  " + JSON.stringify(result));
		if(result.socialSites != undefined)
			socialSiteList = result.socialSites;

	console.log("AFter make = "+JSON.stringify(socialSiteList));
	document.getElementById("home").style.backgroundImage =  "url('img.jpg')";
	document.getElementById("add").addEventListener("click", handler.addSocialSite);
	view.displaySocialSites();
	startTime = document.getElementById("startTime");
	startTime.defaultValue = "2018-09-27T00:00"; 
	endTime = document.getElementById("endTime");
	endTime.defaultValue = "2018-09-28T00:00"; 
	document.getElementById("fetchResults").addEventListener("click", fetchResults);
	showResults = document.getElementById("showresults");
	showResults.style.display = "none";
	results = document.getElementById("results");
	view.setUpEventListeners();

	});
	// console.log("AFter make = "+JSON.stringify(socialSiteList));
	// document.getElementById("home").style.backgroundImage =  "url('img.jpg')";
	// document.getElementById("add").addEventListener("click", handler.addSocialSite());
	// startTime = document.getElementById("startTime");
	// startTime.defaultValue = "2018-09-27T00:00"; 
	// endTime = document.getElementById("endTime");
	// endTime.defaultValue = "2018-09-28T00:00"; 
	// document.getElementById("fetchResults").addEventListener("click", fetchResults);
	// showResults = document.getElementById("showresults");
	// showResults.style.display = "none";
	// results = document.getElementById("results");
	// view.setUpEventListeners();

}



var handler = {
	addSocialSite: function(){
		var socialSiteName = document.getElementById("social_site_name");
		console.log("Site name " + socialSiteName.value);
		socialSiteList.push(socialSiteName.value);
		socialSiteName.value = "";
		chrome.storage.sync.set({"socialSites": socialSiteList}, function(){
			view.displaySocialSites();	
		});
		
	},

	removeSocialSite: function(position){
		socialSiteList.splice(position, 1);
		chrome.storage.sync.set({"socialSites": socialSiteList}, function(){
			view.displaySocialSites();	
		});
	}
};

var view = {
	displaySocialSites: function(){
		console.log(JSON.stringify(socialSiteList));
		var socialSitesUl = document.getElementById("social_site_list");
		socialSitesUl.innerHTML = "";
		// Extract from chrome storage
		for (var i = 0; i < socialSiteList.length; i++){
			var socialSiteLi = document.createElement('LI');
			var socialSite = socialSiteList[i];
		//	console.log("social site in loop"+socialSite);
			socialSiteLi.id = i;
			socialSiteLi.textContent = socialSite;
			socialSiteLi.appendChild(this.createDeleteButton());
			socialSitesUl.appendChild(socialSiteLi);
		}
		console.log(JSON.stringify(socialSitesUl));
	},
	createDeleteButton: function(){
		var deleteButton = document.createElement('button');
		deleteButton.textContent = 'X';
		deleteButton.className = 'deleteButton';
		return deleteButton;
	},

	setUpEventListeners: function(){
		var socialSitesUl = document.getElementById("social_site_list");
		console.log("social site : " + socialSitesUl);
		socialSitesUl.addEventListener('click', function(event){
			console.log("event " + event);
			var elementClicked = event.target;
			if(elementClicked.className === 'deleteButton'){
				handler.removeSocialSite(parseInt(elementClicked.parentNode.id));
			}
		});
	}
	
};



function fetchResults(){
	var text = startTime.value;
	console.log(text);
	var text1 = endTime.value;
	 startTimeObj = new Date(text);
	 endTimeObj = new Date(text1);
	 console.log(startTimeObj);
	 var queryStart = getKey(startTimeObj);
	 var queryEnd = getKey(endTimeObj);
	 queryDB(queryStart,queryEnd);
}


function getKey(date){
	var key = ""+date.getFullYear()+date.getMonth()+date.getDate();
	console.log("Key to be searched = ", key);
	return key;
}

function getTimeSpend(time){
	time = (+time) / 1000;
	if(time < 60)
		return "Seconds : "+time;
	var sec = time % 60;
	time /= 60;
	if(time < 60)
		return "Minutes : " + time+" Seconds : "+sec;
	var min = time % 60;
	time /= 60;
	return "Hours : "+time+" Minutes : "+min+" Seconds : "+time;
}

function queryDB(st, end){
	//var  = [];
	chrome.storage.sync.get(null, function(result) {
		showResults.style.display = "block";
		var output = "";
		if(st in result){
			if(startTimeObj.getHours() >= 0 || startTimeObj.getMinutes() >= 0)
				output += getStartCustomTime(startTimeObj, result[st],st);
		}
		for(var key in result){
			if(key < end && key > st){

				output += "</br><H4>"+key+"</H4>";
				for(var k in result[key]["summary"]){
					output += ""+k+" -  "+getTimeSpend(result[key]["summary"][k])+"</br>";

				}
				// console.log(result[key]["summary"]);	
				
			}
		}
		
		if(end in result){
			if(endTimeObj.getHours() > 0 || endTimeObj.getMinutes() > 0)
				output += getEndCustomTime(endTimeObj, result[end], end);
		}
	//	console.log(listOfKeys);
		results.innerHTML = output;
	});
}

function getStartCustomTime(timeObj, result, key){
	var output = "</br><H4>"+key+"</H4>";
	if(timeObj.getHours() == 0 && timeObj.getMinutes() == 0){
		
		for(var k in result["summary"]){
			output += ""+k+" -  "+getTimeSpend(result["summary"][k])+"</br>";

		}
		return output;
	}

	for(var keys in result){
		var totalTime = 0;
		if(keys === "summary")
			continue;
		for(var timePair of result[keys]){
			var stT = new Date(timePair.start);
			var eT = new Date(timePair.end);
			if(timeObj <= stT){
				totalTime += (eT - stT);
			}
			else if(timeObj < eT)
				totalTime += (eT- timeObj);

		}
		output += ""+keys+" -  "+getTimeSpend(totalTime)+"</br>";
	}
	return output;
}

function getEndCustomTime(timeObj, result, key){
	var output = "</br><H4>"+key+"</H4>";


	for(var keys in result){
		var totalTime = 0;
		console.log(result[keys]);
		if(keys === "summary")
			continue;
		for(var timePair of result[keys]){
			var stT = new Date(timePair.start);
			var eT = new Date(timePair.end);
			if(timeObj >= eT){
				totalTime += (eT - stT);
			}
			else if(timeObj > stT)
				totalTime += (stT- timeObj);

		}
		output += ""+keys+" -  "+getTimeSpend(totalTime)+"</br>";
	}
	return output;
}


function showResults(result){

}