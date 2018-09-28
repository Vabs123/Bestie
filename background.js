
var stopTracking = false;
var startTime = 0;
var focus = true;
var idle = false;
var socialSites = [ 'google', 'quora', 'youtube', 'facebook'];
var Url = "default";
var socialSiteTrack = {
	name:null,
	id:null
};


function isSiteTracked(siteUrl){
	for(var elem of socialSites){
  		reg = new RegExp(elem);
  		if(reg.test(siteUrl))
    		return elem;
	}
	return null;
}

function isNewSiteSimilarToPreviousSite(siteName, tabId){
	if(!siteName)
		return false;
	if(socialSiteTrack.name === siteName){
		updateCurrentSite(siteName,tabId);
		return true;
	}
	return false;
}

function updateCurrentSite(siteName, tabId){
	socialSiteTrack.name = siteName;
	socialSiteTrack.id = tabId;
}

function isCurrentlyTracking(){
	if(socialSiteTrack.name && socialSiteTrack.id)
		return true;
	return false;
}


/******************************************************************
						Structure Of Data Store
TimesTamp(YYYYMMDD) - Object	{
									Fb - [{st, end}, {st, end}]
									.
									.
									google - same

									Summary - {Fb : total, ___}
								}



******************************************************************/


function storeActiveTimeOfSocialSite(stTime, endTime, curSite){
	console.log(curSite);
	var key = ""+stTime.getFullYear()+stTime.getMonth()+stTime.getDate();
	var tmpEnd = null, tmpStart = null, val1 = null, val2 = null;

	if(endTime.getDate() > stTime.getDate()){
		tmpEnd = new Date(stTime.getFullYear(), stTime.getMonth(), stTime.getDate(), 23, 59);
		tmpStart = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());
	}

	if(tmpStart && tmpEnd){
		val1 = {start : stTime.getTime(), end : tmpEnd.getTime()};
		val2 = {start : tmpStart.getTime(), end : endTime.getTime()};
	}
	else
		val1 = {start : stTime.getTime(), end : endTime.getTime()};

	chrome.storage.sync.get([key], function(result){
		console.log("Key created = " + key);
		console.log("Result Fetched == " +  JSON.stringify(result));
		var a = null;
		if(result[key] === undefined){
			console.log(key+" is not found in db");
			a = {};
			a["summary"] = {};
			for(var site of socialSites){
				a[site] = [];
				a["summary"][site] = 0;
			}
		}
		else
			a = result[key];
		a[curSite][a[curSite].length] = val1;
		if(val2)
			a[curSite][a[curSite].length] = val2;
		a["summary"][curSite] += endTime - stTime;

		chrome.storage.sync.set({[key]:a}, function(){
			console.log("value saved = " + JSON.stringify(a)+ "Key = " + key);
		});

	});


	}

function getCurrentActiveTab(){

}



function calculateTimeSpent(siteUrl, tabId){
	var siteName = isSiteTracked(siteUrl);
	console.log("Site Name i got ======  "+siteName)
   	
   		if(siteName && !isCurrentlyTracking()){
   			console.log("Currently not tracking");
   			startTime = new Date();
			updateCurrentSite(siteName, tabId);
   		}
   		else if(isCurrentlyTracking() && !isNewSiteSimilarToPreviousSite(siteName, tabId)){

   			var timeSpent = new Date() - startTime;
   			
  			console.log(timeSpent+ "  =  Total Time Spent on from cal time---" + siteName);

   			storeActiveTimeOfSocialSite(startTime, new Date(), socialSiteTrack.name);
   			if(siteName)
   				startTime = new Date();
   			updateCurrentSite(siteName, tabId);
   		}
   	
}



// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
// 	var siteUrl = changeInfo.url;
// 	if(siteUrl){
//    		console.log("from Update -- " + siteUrl);
//    		calculateTimeSpent(siteUrl, tabId);
// 	}
// });


// chrome.tabs.onActivated.addListener(function(activeInfo) {
//   chrome.tabs.get(activeInfo.tabId, function(tab){
//      console.log( "From tabs changed -- "+ tab.url);
//      calculateTimeSpent(tab.url, tab.id);
//   });
// }); 

// chrome.tabs.onRemoved.addListener(function (tabId, removeInfo){
// 	chrome.tabs.query({
//   		active: true,
//   		currentWindow: true
// 	}, function(tabs) {
// 		try{
//   			var tab = tabs[0];
//   			console.log("Removed Clicked = "+tab.url);
//   			var newSiteName = isSiteTracked(tab.url);
//   		}
//   		catch(err){
//   			console.log("Handled");
//   			if(isCurrentlyTracking()){

//    				var timeSpent = new Date() - startTime;
//    				console.log("Time Spent on closing site" + timeSpent);
//   				console.log(timeSpent+ "  =  Total Time Spent on `${socialSiteTrack.name}`");

//    				storeActiveTimeOfSocialSite(siteName);
//   			}
//   		}
// 	});
// });




// chrome.windows.onFocusChanged.addListener(function(windowId){
// 		console.log(windowId+"Windo chabged");
// 		chrome.windows.getAll({populate:true, windowTypes:["normal"]},function(windows){
// 			for(var w of windows){
// 				console.log(w.id + " is focused ? - "+w.focused+" Window state " +w.state+ "Window Type = " + w.type);
// 			}
// 		});
// 		chrome.windows.getCurrent({populate:true, windowTypes:["normal"]},function(w){
			
// 				console.log("Active Windows ----------"+w.id + " is focused ? - "+w.focused+" Window state " +w.state+ "Window Type = " + w.type);
			
// 		});

// });


// chrome.idle.setDetectionInterval(15);

// chrome.idle.onStateChanged.addListener(function(newState){
// 	if(newState === "idle" || newState == "locked"){
// 		//alert("You are idle");
// 		idle = true;
// 		if(isCurrentlyTracking() && focus){
// 			var timeSpent = new Date() - startTime;
//    			console.log("Time Spent on closing site Idle close ---" + timeSpent);
//   			//alert(timeSpent+ "  =  Total Time Spent on idle close --- " + socialSiteTrack.name);
//   			updateCurrentSite(null,null);
//    			storeActiveTimeOfSocialSite(startTime, new Date(), socialSiteTrack.name);
// 		}
// 		else
// 			console.log("Focus or Trackable site is not there though you are sitting idle");
// 	}
// 	else if(focus){
// 		idle = false;
// 		//alert("You are active");
// 		// chrome.tabs.query({
//   // 			active: true,
//   // 			currentWindow: true
// 		// }, function(tabs) {
//   // 			var tab = tabs[0];
//   // 			var url = tab.url;
//   // 			console.log("You started doing work  --" + tab.url);
//   // 			var siteName = isSiteTracked(tab.url);
//   // 			if(siteName)
//   // 				startTime = new Date();
//   // 			updateCurrentSite(siteName,tab.id);
// 		// });
// 	}
// });

// setInterval(chrome.windows.getCurrent({populate:true, windowTypes:["normal"]},function(w){
			
// 				console.log("Active Windows ----------"+w.id + " is focused ? - "+w.focused+" Window state " +w.state+ "Window Type = " + w.type);
			
// 		}), 10000);


//****************************************************************************************
//							Main Function

setInterval(() => {
	chrome.windows.getCurrent({populate:true, windowTypes:["normal"]},function(w){
		chrome.idle.queryState(15, function(newState){
			
				//console.log("Active Windows ----------"+w.id + " is focused ? - "+w.focused+" Window state " +w.state+ "Window Type = " + w.type);
				if(!w.focused || newState != "active"){
					console.log("Focus changed to off --" + focus);
					if(isCurrentlyTracking()){
							var timeSpent = new Date() - startTime;
   							//console.log("Time Spent on clos ---" + timeSpent);
  							console.log(timeSpent+ "  =  Total Time Spent before window closed --- " + socialSiteTrack.name);
  							storeActiveTimeOfSocialSite(startTime, new Date(), socialSiteTrack.name);
  							updateCurrentSite(null,null);
  							//storeActiveTimeOfSocialSite(siteName);
  							
					}
				}
				else if(w.focused && newState === "active"){
					console.log("Focus Changed back" + focus);
					chrome.tabs.query({
  						active: true,
  						currentWindow: true
					}, function(tabs) {
  							var tab = tabs[0];
  							var url = tab.url;
  							var siteName = isSiteTracked(tab.url);
  							console.log(" Started Time after window opened --- " + siteName);
  							// if(siteName)
  							// 	startTime = new Date();
  							// updateCurrentSite(siteName, tab.id);
  							calculateTimeSpent(tab.url, tab.id);
  							
						});
				
		
			}
			});
		});
}, 1000);

//************************************************************************************************************/
// 		var value = [{start:4,end:5}];
// 		var key = "2018805"
//         chrome.storage.sync.set({[key] : value}, function() {
//           console.log('Value is set to ' + JSON.stringify(value));
//             chrome.storage.sync.get([key], function(result) {
//           console.log('Value currently is ' + JSON.stringify(result[key]));
//           // console.log(result[key][0].start)
//           // console.log(3 > result[key][0].start && 3 > result[key][0].end);
//           var val1 = {start:8, end:9};
//           var val = result[key];
//           val[val.length] = val1;
//          chrome.storage.sync.set({[key] : val}, function() {
//           console.log('Value is set to ' + JSON.stringify(val));
//            chrome.storage.sync.get([key], function(result) {
//           console.log('Value currently is ' + JSON.stringify(result[key]));
//           console.log(result["1"] === undefined);
//       });
//       });
//         });
      
//         });


//chrome.storage.sync.clear(function(){console.log("clear all")});