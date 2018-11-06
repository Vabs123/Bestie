var setOfKeys = new Set(['socialSites', 'notificationTime', 'alert', 'customAlert']);
var stopTracking = false;
var startTime = 0;
var focus = true;
var idle = false;
var socialSites = ['instagram', 'quora', 'youtube', 'facebook', 'twitter'];
var Url = "default";
var showAlert = true;
var socialSiteTrack = {
    name: null,
    id: null
};
var onlineTime = 0;
var SAVETIME = 900;
var saveTimeCounter = 0;
var NEWTAB = "chrome://newtab/";
var MY_NEWTAB = "http://extensionslabs.com/socialMediaTracker/newtab.html";

function initializeTodayObject(){
    var key = getKey(new Date());
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, function (result) {
          var initialize = null;

          if (!result.hasOwnProperty("socialSites")) {
                var sites = ["facebook", "instagram", "quora", "youtube", "twitter"];
                initialize = {};
                initialize["socialSites"] = sites;
          }
            if (!result.hasOwnProperty("notificationTime")) {
                var time = "0:45";
                if(!initialize)
                    initialize = {};
                initialize["notificationTime"] = time;
            }
            if(!result.hasOwnProperty("alert")){
                if(!initialize)
                    initialize = {};
                initialize["alert"] = "basic";
            }
            if(!result.hasOwnProperty("customAlert")){
                if(!initialize)
                    initialize = {};
                var customAlert = {};
                for (var site of socialSites){
                    customAlert[site] = {hour:0, min:45};
                }
                initialize["customAlert"] = customAlert;
            }
            if (!result.hasOwnProperty(key)) {
                if(!initialize)
                    initialize = {};

                var today = {};
                today["summary"] = {};
                today["totalTime"] = 0;
                for (var site of socialSites) {
                    today[site] = [];
                    today["summary"][site] = 0;
                }
                initialize[key] = today;
            }
            if(initialize){
                chrome.storage.sync.set(initialize, function(){
                    resolve(1);
                });
            }
            else{
                resolve(1);
            }
        });
    });
}




function isSiteTracked(siteUrl) {
    var url = new URL(siteUrl).hostname;
    for (var elem of socialSites) {
        reg = new RegExp(elem);
        if (reg.test(url))
            return elem;
    }
    return null;
}

function isNewSiteSimilarToPreviousSite(siteName, tabId) {
    if (!siteName)
        return false;
    if (socialSiteTrack.name === siteName) {
        updateCurrentSite(siteName, tabId);
        return true;
    }
    return false;
}

function updateCurrentSite(siteName, tabId) {
    socialSiteTrack.name = siteName;
    socialSiteTrack.id = tabId;
}

function isCurrentlyTracking() {
    if (socialSiteTrack.name && socialSiteTrack.id)
        return true;
    return false;
}




/******************************************************************
 Structure Of Data Store
 TimesTamp(YYYYMMDD) - Object    {
									Fb - [{st, end}, {st, end}]
									.
									.
									google - same

									Summary - {Fb : total, ___}
								}



 ******************************************************************/


function storeActiveTimeOfSocialSite(stTime, endTime, curSite) {
    console.log(curSite);
    var key = "" + stTime.getFullYear() + stTime.getMonth() + stTime.getDate();
    var tmpEnd = null, tmpStart = null, val1 = null, val2 = null;
    val1 = {start: stTime.getTime(), end: endTime.getTime()};

    chrome.storage.sync.get([key], function (result) {
        console.log("Key created = " + key);
        console.log("Result Fetched == " + JSON.stringify(result));
        var a = null;
        if (result[key] === undefined) {
            console.log(key + " is not found in db");
            a = {};
            a["summary"] = {};
            a["totalTime"] = 0;
            for (var site of socialSites) {
                a[site] = [];
                a["summary"][site] = 0;
            }
        }
        else
            a = result[key];
        if(!a.hasOwnProperty(curSite)) {
            a[curSite] = [];
            a["summary"][curSite] = 0;
        }
     //   a[curSite][a[curSite].length] = val1;
        a["summary"][curSite] += endTime - stTime;
        a["totalTime"] += onlineTime;

        chrome.storage.sync.set({[key]: a}, function () {
            onlineTime = 0;
            console.log("value saved = " + JSON.stringify(a) + "Key = " + key);
        });
    });
}

function calculateTimeSpent(siteUrl, tabId) {
    var siteName = isSiteTracked(siteUrl);
    console.log("Site Name i got ======  " + siteName)

    if (siteName && !isCurrentlyTracking()) {
        console.log("Currently not tracking");
        startTime = new Date();
        updateCurrentSite(siteName, tabId);
    }
    else if (isCurrentlyTracking() && !isNewSiteSimilarToPreviousSite(siteName, tabId)) {
        alertTime = 15;
        var timeSpent = new Date() - startTime;

        console.log(timeSpent + "  =  Total Time Spent on from cal time---" + siteName);

        storeActiveTimeOfSocialSite(startTime, new Date(), socialSiteTrack.name);
        if (siteName)
            startTime = new Date();
        updateCurrentSite(siteName, tabId);
    }

}


chrome.tabs.onCreated.addListener(function(tab){
    console.log(tab);
    if(tab.url === NEWTAB){

         chrome.tabs.create({"url":MY_NEWTAB});
        chrome.tabs.remove(tab.id);
     }
});

function getKey(date){
    var key = ""+date.getFullYear()+date.getMonth()+date.getDate();
    return key;
}

function saveData() {
    if (isCurrentlyTracking()) {
        var timeSpent = new Date() - startTime;
        console.log(timeSpent + "  =  Regural Saver --- " + socialSiteTrack.name);
        storeActiveTimeOfSocialSite(startTime, new Date(), socialSiteTrack.name);
        updateCurrentSite(null, null);
    }
}

function saveTotalTime(cur){
    return new Promise((resolve, reject) => {
        var key = getKey(cur);
        initializeTodayObject().then(() => {
            chrome.storage.sync.get(key, function (result) {
                result[key]["totalTime"] += onlineTime;
                chrome.storage.sync.set({[key]: result[key]}, function () {
                    onlineTime = 0;
                    resolve(1);
                });

            });
        });
    });
}


var updated = false;

setInterval(() => {
    chrome.windows.getCurrent({populate: true, windowTypes: ["normal"]}, function (w) {
        chrome.idle.queryState(60, function (newState) {
            if (!w.focused || newState != "active") {

                console.log("Focus changed to off --" + focus);
                chrome.storage.sync.get(['socialSites'], function (result) {
                    console.log("Inside background called  " + JSON.stringify(result));
                    if (result.socialSites != undefined)
                        socialSites = result.socialSites;

                    if (isCurrentlyTracking()) {
                        var timeSpent = new Date() - startTime;
                        console.log(timeSpent + "  =  Total Time Spent before window closed --- " + socialSiteTrack.name);
                        storeActiveTimeOfSocialSite(startTime, new Date(), socialSiteTrack.name);
                        updateCurrentSite(null, null);
                    }
                });
            }
            else if (w.focused && newState === "active") {
                onlineTime += 1;
                var currentDay = new Date();
                if(currentDay.getHours() === 23 && currentDay.getMinutes() >= 58) {
                    if(!updated) {
                        updated =true;
                        saveData();
                        saveTotalTime(currentDay);
                    }
                }
                else
                    updated = false;

                console.log("Focus Changed back" + focus);
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    var tab = tabs[0];
                    var url = tab.url;
                    var currentDay = new Date();
                    var today = "" + currentDay.getFullYear() + currentDay.getMonth() + currentDay.getDate();
                    if(tab.url === NEWTAB){

                        chrome.tabs.create({"url":MY_NEWTAB});
                        chrome.tabs.remove(tab.id);
                    }
                    chrome.storage.sync.get(['socialSites', 'notificationTime', today, "alert", "customAlert"], function (result) {
                        console.log("Inside background called  " + JSON.stringify(result));

                        if (result.socialSites != undefined)
                            socialSites = result.socialSites;

                        if (saveTimeCounter === SAVETIME) {
                            saveData();
                            saveTimeCounter = 0;
                        }
                        else
                            saveTimeCounter++;

                        var siteName = isSiteTracked(tab.url);
                        console.log(" Started Time after window opened --- " + siteName);

                        calculateTimeSpent(tab.url, tab.id);


                        if (siteName) {
                            if (isExceededBrowsingTime(siteName, result, today) && !showAlert) {
                                    showAlert = true;
                                   chrome.notifications.create({type: "basic", iconUrl:"Bell-icon.png",title:"",message:"You have completed your today's time quota on this site."}, function(notificationId){
                                        console.log("noti show");
                                   });
                            }
                        }

                    });
                });


            }
        });
    });
}, 1000);


function calculateBasicAlertTime(result, today){
    var totalTime = 0;
    var time = result["notificationTime"];
    time = getTimeInMilliseconds(time);
    for(var site in result[today]["summary"]){
        if(result["socialSites"].includes(site))
            totalTime += result[today]["summary"][site];
    }
    return {usedTime:totalTime, totalTime: time};
}

function calculateCustomAlertTime(siteName, result, today){
    var timeSpend = result[today]["summary"][siteName];
    var time = result["customAlert"][siteName];
    var totalTime = ((time.hour * 3600) + (time.min * 60)) * 1000;
    return {usedTime:timeSpend, totalTime: totalTime};
}

function getTimeInMilliseconds(time){
    var timeParts = time.split(':');
    var hours = ~~timeParts[0];
    var min = ~~timeParts[1];
    return ((hours * 3600) + (min * 60)) * 1000;
}


function isExceededBrowsingTime(siteName, result, today) {
    var timeObj = null;
    if(result["alert"] === "basic")
        timeObj = calculateBasicAlertTime(result, today);
    else
        timeObj = calculateCustomAlertTime(siteName, result, today);
    return timeObj.usedTime >= timeObj.totalTime;
}


// chrome.storage.sync.clear(function(){console.log("clear all")});

// chrome.storage.sync.remove(["instagram", "quora", "reddit","twitter","youtube"]);

function fetchKey(sendResponse, key){
    saveTotalTime(new Date()).then((res) => {
        chrome.storage.sync.get(key, function (result) {
            sendResponse(result);
        });
    });

}

function setKey(sendResponse, obj){
    chrome.storage.sync.set(obj, function(){
        sendResponse({updated:"updated"});
    });
}


chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {
        if(request.hasOwnProperty("fetch"))
            fetchKey(sendResponse, request.fetch);
        else if(request.hasOwnProperty("update"))
            setKey(sendResponse, request.update);

        return true;
    });



chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
       console.log(request);
       var site = isSiteTracked(request.url);
      if(site){
           showAlert = false;
           saveData();
           sendResponse({progressbar:site});
       }

    });

function showProgressBar(tabId, site){
    if(site)
    chrome.tabs.sendMessage(tabId, {update:site});
    else
        chrome.tabs.sendMessage(tabId, {update: null});
}

chrome.tabs.onActivated.addListener(function(activeInfo) {

  chrome.tabs.get(activeInfo.tabId, function(tab){
      var site = isSiteTracked(tab.url);
      if(site){
        showAlert = false;
        saveData();
      }
        showProgressBar(tab.id, site);
  });
});

// chrome.storage.sync.set({a:1, b:3}, function(){
//     chrome.storage.sync.get(null, function(result){
//
//         console.log(result);
//     });