

var startTime = 0;
var focus = true;
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

function storeActiveTimeOfSocialSite(siteName){

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

   			storeActiveTimeOfSocialSite(siteName);
   			if(siteName)
   				startTime = new Date();
   			updateCurrentSite(siteName, tabId);
   		}
   	
}



chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	var siteUrl = changeInfo.url;
	if(siteUrl){
   		console.log("from Update -- " + siteUrl);
   		calculateTimeSpent(siteUrl, tabId);
	}
});


chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab){
     console.log( "From tabs changed -- "+ tab.url);
     calculateTimeSpent(tab.url, tab.id);
  });
}); 

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


chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener(function(newState){
	if(newState === "idle" || newState == "locked"){
		//alert("You are idle");
		if(isCurrentlyTracking() && focus){
			var timeSpent = new Date() - startTime;
   			console.log("Time Spent on closing site Idle close ---" + timeSpent);
  			//alert(timeSpent+ "  =  Total Time Spent on idle close --- " + socialSiteTrack.name);
  			updateCurrentSite(null,null);
   			//storeActiveTimeOfSocialSite(siteName);
		}
		else
			console.log("Focus is not there though you are sitting idle");
	}
	else if(focus){
		//alert("You are active");
		chrome.tabs.query({
  			active: true,
  			currentWindow: true
		}, function(tabs) {
  			var tab = tabs[0];
  			var url = tab.url;
  			console.log("You started doing work  --" + tab.url);
  			var siteName = isSiteTracked(tab.url);
  			if(siteName)
  				startTime = new Date();
  			updateCurrentSite(siteName,tab.id);
		});
	}
});

// setInterval(chrome.windows.getCurrent({populate:true, windowTypes:["normal"]},function(w){
			
// 				console.log("Active Windows ----------"+w.id + " is focused ? - "+w.focused+" Window state " +w.state+ "Window Type = " + w.type);
			
// 		}), 10000);

setInterval(() => {
	chrome.windows.getCurrent({populate:true, windowTypes:["normal"]},function(w){
			
				//console.log("Active Windows ----------"+w.id + " is focused ? - "+w.focused+" Window state " +w.state+ "Window Type = " + w.type);
				if(!w.focused && focus){
					focus =false;
					console.log("Focus changed to off --" + focus);
					if(isCurrentlyTracking()){
							var timeSpent = new Date() - startTime;
   							//console.log("Time Spent on clos ---" + timeSpent);
  							console.log(timeSpent+ "  =  Total Time Spent before window closed --- " + socialSiteTrack.name);
  							updateCurrentSite(null,null);
  							//storeActiveTimeOfSocialSite(siteName);
  							
					}
				}
				else if(!focus && w.focused){
					focus = true;
					console.log("Focus Changed back" + focus);
					chrome.tabs.query({
  						active: true,
  						currentWindow: true
					}, function(tabs) {
  							var tab = tabs[0];
  							var url = tab.url;
  							var siteName = isSiteTracked(tab.url);
  							console.log(" Started Time after window opened --- " + siteName);
  							if(siteName)
  								startTime = new Date();
  							updateCurrentSite(siteName, tab.id);
  							
						});
				}
			
		});
}, 1000);