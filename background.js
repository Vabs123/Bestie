

// var startTime = 0;
// var socialSites = [ 'google', 'quora', 'youtube', 'facebook'];
// var Url = "default";
// var socialSiteTrack = {
// 	name:null,
// 	id:null
// };

// function isSiteTracked(siteUrl){
// 	for(var elem of socialSites){
//   		reg = new RegExp(elem);
//   		if(reg.test(siteUrl))
//     		return elem;
// 	}
// 	return null;
// }

// function isNewSiteSimilarToPreviousSite(siteName, tabId){
// 	if(!siteName)
// 		return false;
// 	if(socialSiteTrack.name === siteName){
// 		updateCurrentSite(siteName,tabId);
// 		return true;
// 	}
// 	return false;
// }

// function updateCurrentSite(siteName, tabId){
// 	socialSiteTrack.name = siteName;
// 	socialSiteTrack.id = tabId;
// }

// function isCurrentlyTracking(){
// 	if(socialSiteTrack.name && socialSiteTrack.id)
// 		return true;
// 	return false;
// }

// function storeActiveTimeOfSocialSite(siteName){

// }

// function getCurrentActiveTab(){

// }

// function calculateTimeSpent(siteUrl, tabId){
// 	var siteName = isSiteTracked(siteUrl);
// 	alert("Site Name i got ======  "+siteName)
   	
//    		if(siteName && !isCurrentlyTracking()){
//    			alert("Currently not tracking");
//    			startTime = new Date();
// 			updateCurrentSite(siteName, tabId);
//    		}
//    		else if(isCurrentlyTracking() && !isNewSiteSimilarToPreviousSite(siteName, tabId)){

//    			var timeSpent = new Date() - startTime;
   			
//   			alert(timeSpent+ "  =  Total Time Spent on `${siteName}`");

//    			storeActiveTimeOfSocialSite(siteName);
//    			if(siteName)
//    				startTime = new Date();
//    			updateCurrentSite(siteName, tabId);
//    		}
   	
// }



// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
// 	var siteUrl = changeInfo.url;
// 	if(siteUrl){
//    		alert("from Update -- " + siteUrl);
//    		calculateTimeSpent(siteUrl, tabId);
// 	}
// });


// chrome.tabs.onActivated.addListener(function(activeInfo) {
//   chrome.tabs.get(activeInfo.tabId, function(tab){
//      alert( "From tabs changed -- "+ tab.url);
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
//   			alert("Removed Clicked = "+tab.url);
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
// 	if(windowId != -1){
// 		alert(windowId+"Windo chabged");
// 		console.log(windowId+"Windo chabged");
// 	}
// },);


chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener(function(newState){
	if(newState === "idle" || newState == "locked")
		alert("You are idle");
	else{
		alert("You are actice");
	}
});


