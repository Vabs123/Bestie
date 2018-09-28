
console.log("hello")
window.onload = function(){
	console.log("hello");
	document.getElementById("analytics").addEventListener("click", showAnalytics);
}

 function showAnalytics(){
 	chrome.tabs.create({"url":chrome.runtime.getURL("analytics.html")});
 }
