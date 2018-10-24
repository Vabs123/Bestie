console.log("hello");
//var setOfKeys = new Set(['socialSites', 'notificationTime']);

chrome.runtime.sendMessage({url: window.location.href}, function(response) {
    console.log(response);
    if(response.progressbar === "true"){
        if(!isProgressBarAtTopPresent()) {
            calculateTotalTimeSpend().then(showProgressBar);
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.update === "progressBar"){
        if(isProgressBarAtTopPresent())
            hideProgressBar();
            calculateTotalTimeSpend().then(showProgressBar);

    }


});


async function showProgressBar(time){
    console.log(time);

  var timeSpent = ~~time.usedTime;
  var totalTime = ""+time.totalTime;
  totalTime = getTimeInMilliseconds(totalTime);
  if(timeSpent >= totalTime)
      timeSpent = totalTime;
  showProgressBarAtTop(timeSpent, totalTime);
}

function getTimeInMilliseconds(time){
    var timeParts = time.split(':');
    var hours = ~~timeParts[0];
    var min = ~~timeParts[1];
    return ((hours * 3600) + (min * 60)) * 1000;
}


function showProgressBarAtTop(timeSpent, totalSocialTime){
    var per = getPercentage(timeSpent,totalSocialTime);
    var totalTime = getTimeString(""+getTimeSpend(totalSocialTime));

    var myvar = '<div id="myprogressbar" style="z-index: 100000;background-color: white;width: 100%;POSITION: relative;padding: 0px;"><span id="close" style="float: right;position: relative; margin:0%; padding: 0%; margin-right: 0.6%;cursor: pointer;vertical-align: middle; font-size: 24px; ">X</span><div id="myProgress" style="width: 98%;background-color: #ddd;">  <div id="myBar" style="width: 50%; height: 25px; background-color: rgb(76, 175, 80); text-align: center; line-height: 25px; color: white; font-size: 20px;"></div><div id = "pBar" style="'+
        '    position: absolute;'+
        '    z-index: 100000000;'+
        '    top: 2.5px;'+
        '    font-size: 18px;'+
        '    left: 40%;'+
        '    color: white; cursor: default;'+
        '    text-shadow: 2px 2px 8px black;'+
        '">1m/2m</div></div></div>';

    var d = document.createElement('DIV');
    d.innerHTML = myvar;
    document.querySelector("HTML").prepend(d.firstChild);
    document.body.style.transform = "translateY(5px)";
    document.querySelector("HTML").style.backgroundColor = "#FFF";
    document.getElementById("close").addEventListener("click",hideProgressBar);
    var progressBar = document.getElementById("myBar");
    var pBar = document.getElementById("pBar");
    progressBar.style.width = per+"%";
    var timeUsed = getTimeString(""+getTimeSpend(timeSpent));
    pBar.innerHTML = "Time spent : "+timeUsed+"/"+totalTime+" ("+per+"%)";

    changeColor(per, progressBar);
    // dynamicChange(timeSpent, totalSocialTime, totalTime, progressBar, pBar);
     setInterval(() => {
         if(isProgressBarAtTopPresent() && document.hasFocus() && (timeSpent < totalSocialTime)){
             timeSpent += 60000;
             if(timeSpent >= totalSocialTime)
                 timeSpent = totalSocialTime;
             var per = getPercentage(timeSpent, totalSocialTime);
             changeColor(per, progressBar);
             progressBar.style.width = per+"%";
             timeUsed = getTimeString(""+getTimeSpend(timeSpent));
             pBar.innerHTML = "Time spent : "+timeUsed+"/"+totalTime+" ("+per+"%)";
         }
     }, 60000);

}

function changeColor(per, progressBar){
    if(per >= 80)
        progressBar.style.backgroundColor = "Orange";
    if(per >= 95)
        progressBar.style.backgroundColor = "#d9534f";
}




function hideProgressBar(){
    document.getElementById("myprogressbar").style.display = "none";
    document.body.style.transform = "translateY(0px)";
}

function isProgressBarAtTopPresent(){
    return document.getElementById("myprogressbar");
}

function getPercentage(val, total){
    return (val/total*100).toFixed();
}



function fetchKey( key) {
    return new Promise(function(resolve, reject) {
        chrome.storage.sync.get(key,
            function (result) {
                // if (response.success)
                console.log(result);
                //      alert(response.socialSites);
                resolve(result);

            });
    });
}

async function calculateTotalTimeSpend(){
    var totalTime = 0;
    var key = getKey(new Date());
    var result = await fetchKey([key, "notificationTime"]);
    console.log(result);
    var time = result["notificationTime"];

    for(var site in result[key]["summary"]){
        totalTime += result[key]["summary"][site];
    }

    return {usedTime:totalTime, totalTime: time};
}


function getTimeSpend(time){
    time = (+time) / 1000;
    time = (~~time);
    if(time < 60)
        return time;
    var sec = time % 60;
    time /= 60;
    time = (~~time);
    if(time < 60)
        return time+","+sec;
    var min = time % 60;
    time /= 60;
    time = (~~time);
    return ""+time+","+min+","+sec;
}

function getTimeString(timeParts){
    var formattedTime = "";
    var time = timeParts.split(",");
    if(time.length === 3){
        formattedTime = time[0]+"h ";
    }
    else if(time.length === 2){
        formattedTime = time[0]+"m ";
    }
    else if(time.length === 1){
        formattedTime = time[0]+"s";
    }
    return formattedTime;
}


// function updateKey(key, value) {
//     return new Promise(function(resolve, reject) {
//         chrome.runtime.sendMessage(EXTENSION_ID, {update: [key, value]},
//             function (response) {
//                 // if (response.success)
//                 console.log(response);
//                 //alert(response.socialSites);
//                 resolve(response);
//             });
//     });
// }

function getKey(date){
    var key = ""+date.getFullYear()+date.getMonth()+date.getDate();
//	console.log("Key to be searched = ", key);
    return key;
}
