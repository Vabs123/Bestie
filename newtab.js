
//console.log("hello")
//Doughnut Chart
var data = [];
var labels = [];
var BGCOLOR = ["purple", "#0000FF", "#70726F", "#1D5907","#A52A2A","#DC143C","#008B8B","#FF8C00", "#8B0000", "#228B22","#FFD700", "#FF4500","#9ACD32"];
var bColor = [];
var canvas = null;
var ctx = null;
var barCanvas = null;
var barCtx = null;
var barAnalysis = null;
var barData = null;
var todayAnalysis = null;
var todayData = null;
var totalTimeSpend = 0;
var dataTable = null;
var cur = null;
var curRow = null;
var active = null;
var setOfKeys = new Set(['socialSites', 'notificationTime']);
var activeAnalysisHeader = null;
var activeStatsHeader = null;
var barMaxSiteTimeFind = {};
var barTotalTime = 0;
var activeDeafultStats = null;



Chart.pluginService.register({
	beforeDraw: function (chart) {
		if (chart.config.options.elements.center) {
        //Get ctx from string
        var ctx = chart.chart.ctx;
        
				//Get options from the center object in options
				var centerConfig = chart.config.options.elements.center;
				var fontStyle = centerConfig.fontStyle || 'Arial';
				var txt = centerConfig.text;
				var color = centerConfig.color || '#000';
				var sidePadding = centerConfig.sidePadding || 20;
				var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
        //Start with a base font of 30px
        ctx.font = "30px " + fontStyle;
        
				//Get the width of the string and also the width of the element minus 10 to give it 5px side padding
				var stringWidth = ctx.measureText(txt).width;
				var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

        // Find out how much the font can grow in width.
        var widthRatio = elementWidth / stringWidth;
        var newFontSize = Math.floor(30 * widthRatio);
        var elementHeight = (chart.innerRadius * 2);

        // Pick a new font size so it will not be larger than the height of label.
        var fontSizeToUse = Math.min(newFontSize, elementHeight);

				//Set font settings to draw it correctly.
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
				var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
				ctx.font = fontSizeToUse+"px " + fontStyle;
				ctx.fillStyle = color;

        //Draw text in center
        ctx.fillText(txt, centerX, centerY);
    }
}
});


var config = {
	type: 'doughnut',
	data: {
			//	mousemove: abc,
			datasets: [{
				data: [
				1,2,3,4,5
				],
				"backgroundColor":["rgb(255, 99, 132)","rgb(54, 162, 235)","rgb(255, 205, 86)"],
					//"hoverBorderColor":["rgb(255, 91, 132)","rgb(54, 62, 235)","rgb(255, 5, 86)"],
					
					label: 'Today Analysis'
				}],
				labels: [
				'January 100% 00h 00m 00s',
				'Orange',
				'Yellow',
				'Green',
				'Blue'
				]
			},
			options: {
				
				responsive: true,
				legend: {
					display: false
				},

				title: {
					display: false,
					text: "Bestie Today's Analysis"
				},
				animation: {
					animateScale: true,
					animateRotate: true
				},
				events:["mousemove", "mouseout", "click", "touchstart", "touchmove"],

				elements: {
					center: {
						text: '',
          							color: '#FF6384', // Default is #000000
          							fontStyle: 'Arial', // Default is Arial
          							sidePadding: 20 // Defualt is 20 (as a percentage)
          						}
          					},
				// events.click: function(e){alert("s")},
				// onHover: function (e,t){
				// 		alert("Event = " + e+" \n Part clicked  - ");
				// }

			}
		};



Chart.plugins.register({
  afterDraw: function(chartInstance) {
    if (chartInstance.config.options.showDatapoints) {
      var helpers = Chart.helpers;
      var ctx = chartInstance.chart.ctx;
      var fontColor = helpers.getValueOrDefault(chartInstance.config.options.showDatapoints.fontColor, chartInstance.config.options.defaultFontColor);

      // render the value of the chart above the bar
      ctx.font = Chart.helpers.fontString("20", 'normal', Chart.defaults.global.defaultFontFamily);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = "black";

      chartInstance.data.datasets.forEach(function (dataset) {
        for (var i = 0; i < dataset.data.length; i++) {
          var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
          var scaleMax = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._xScale.maxHeight;
          //console.log(model.x);
          var xPos = (scaleMax - model.x) / scaleMax >= -4.5 ? model.x + 40 : model.x - 5;
          ctx.fillText(getTimeString(""+getTimeSpend(dataset.data[i])), xPos, model.y + 12);
        }
      });
    }
  }
});

		var barConfig = {
			type: 'horizontalBar',
			ticks:{
				display:false
			},
			data: {
				labels:['Time'],
				datasets:[{
					label:'Time',
					data:[1]
				}
				]
			},
			options: {
				showDatapoints: true,
				hover:{
					onHover:showBarDivResult
				},
				responsive: true,
				intersect: true,
				maintainAspectRatio:false,
				legend: {
					display: false
				},
				scales: {
					xAxes: [{
						stacked:true,
						ticks:{
							beginAtZero: true,
							display:false
						} 
					}],
					yAxes: [{ stacked: true }]
				}
			}
		};



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
		formattedTime = time[0]+"h"+time[1]+"m"+time[2]+"s";
	}
	else if(time.length === 2){
		formattedTime = time[0]+"m"+time[1]+"s";	
	}
	else if(time.length === 1){
		formattedTime = time[0]+"s";
	}
	return formattedTime;
}


window.onload = function(){


//	document.getElementById("date_selector").datepicker();
	//console.log("hello");
	//document.body.style.backgroundImage = "url('img1.jpg')";

	initiallize();
	
}



function initiallize(){
	document.getElementById("analysis_header").addEventListener("click", getTypeOfAnalysis);
	document.getElementById("stats_header").addEventListener("click", getTypeOfStats);
	document.getElementById("select_date").addEventListener("click", getAnalysisForSelectedDay);
	document.getElementById("select_month").addEventListener("click", getStatsForSelectedMonth);
	document.getElementById("select_range").addEventListener("click", getStatsForSelectedRange);
	document.getElementById("update_sites").addEventListener("click", showSocialSitesDiv);
	document.getElementById("update_alert_time").addEventListener("click", changeAlertTime);
	document.getElementById("site_used").addEventListener("click", removeSite);
	document.getElementById("add_sitename").addEventListener("click", addSite);
	document.getElementById("set_alert_time").addEventListener("click", updateAlertTime);
	document.getElementById("cover").addEventListener("click", hideHoveringDiv);



	//document.getElementById("update_alert_time").addEventListener("click", updateAlertTime);
	var x = document.querySelectorAll("#close");
	for(var close of x)setCloseListener(close);

	activeAnalysisHeader = document.getElementById("today");
	canvas = document.getElementById("chart-area");
	ctx = canvas.getContext("2d");
	todayAnalysis = new Chart(ctx, config);
	todayData = todayAnalysis.chart.config.data;
	dataTable = document.getElementById("data_table");


	barCanvas = document.getElementById('bar-chart-area');
	barCtx = barCanvas.getContext("2d");
	barAnalysis = new Chart(barCtx, barConfig);
	barData = barAnalysis.chart.config.data;



	activeStatsHeader = document.getElementById("default_ranges");
	document.getElementById("default_list").addEventListener("click",getDefaultRangeOption);
	activeDeafultStats = document.getElementById("cur_week");

		document.getElementById("about_us").addEventListener("click", aboutUs);
	setListenersToTable();
	//setBarChartListeners();
	var curDate = new Date();
	showChart(curDate);
	setDoughnutListeners();
	//showStats(curDate.getMonth(), null);
    document.getElementById("default_ranges").innerText = "Current Week Stats";
	getCurrentWeekStats();
}





function setCloseListener(x){
	x.addEventListener("click",close);
}

function close(e){
	e.path[2].style.display = "none";
	document.getElementById("cover").style.display = "none";
}

function hideHoveringDiv(e){
    document.getElementById("hover_options").style.display = "none";
    document.getElementById("hover_notification_div").style.display = "none";
    document.getElementById("cover").style.display = "none";
}

async function showSocialSitesDiv(e) {
	var socialSites = await new Promise(fetchSocialSites);
	showSites(socialSites);
}

function showSites(socialSites) {
	document.getElementById("hover_options").style.display = "block";
    document.getElementById("cover").style.display = "block";
	var well = document.getElementById('site_used');
	well.innerHTML = "";
	var i = 0;
	for(var site of socialSites){
		var button = document.createElement('button');
		button.className = 'btn';
		var span = document.createElement('span');
		span.innerHTML = site+" <i class=\"fa fa-times fa-lg\" aria-hidden=\"true\" style=\"margin-left: 5px; color: #a2a1a1\" id="+i+" ></i>";
		//button.textContent=site;
		span.id = i;
		//span.className = "btn";
		button.appendChild(span);
		button.id = i++;
		well.appendChild(button);
	}
}

function updateSocialSites(socialSiteList){
	chrome.storage.sync.set({socialSites:socialSiteList}, function(){
        var curDate = new Date();
       
        showChart(curDate);
        activeAnalysisHeader.style.color = "grey";
        activeAnalysisHeader =  document.getElementById("today");
        activeAnalysisHeader.style.color = "black";
        getCurrentWeekStats();
        document.getElementById("default_ranges").innerText = "Current Week Stats";
        activeDeafultStats.style.color = "grey";
        activeDeafultStats = document.getElementById("cur_week");
        activeDeafultStats.style.color = "black";
    });

}

function fetchSocialSites(resolve, reject){
    chrome.storage.sync.get(['socialSites'], function (result) {
    		resolve( result['socialSites']);
    });
}

async function removeSite(e){
	if(e.target.className === "btn" || e.target.parentNode.parentNode.className === "btn" || e.target.parentNode.className === "btn"){
        var socialSites = await new Promise(fetchSocialSites);
		socialSites.splice(e.target.id, 1);
        showSites(socialSites);
		updateSocialSites(socialSites);
	}
}

async function addSite(e) {
	var siteInput = document.getElementById("social_site_name");
	var site = siteInput.value;
	siteInput.value = "";
	var socialSites = await new Promise(fetchSocialSites);
	socialSites.push(site);
	showSites(socialSites);
	updateSocialSites(socialSites);
}


function getAlertTime(resolve, reject){
    chrome.storage.sync.get(['notificationTime'], function (result) {
		resolve(result['notificationTime']);
    });
}

function setAlertTime(hours, mins){
	var time = hours+":"+mins;
	chrome.storage.sync.set({notificationTime: time}, function(){
		//show mark
	});
}

function updateAlertTime(){
    var hour = document.getElementById("hour_value").innerText;
    var min = document.getElementById("min_value").innerText;
    setAlertTime(hour, min);
}



async function changeAlertTime(e) {
	var time = await new Promise(getAlertTime);
	var timeParts = time.split(":");
	var hours = timeParts[0];
	var mins = timeParts[1];
    document.getElementById("hover_notification_div").style.display = "block";
    document.getElementById("cover").style.display = "block";
    var hourSlider = document.getElementById("hour");
    hourSlider.value = hours;
    var minSlider = document.getElementById("min");
    minSlider.value = mins;
    var hourOutput = document.getElementById("hour_value");
    var minOutput = document.getElementById("min_value");
    hourOutput.innerHTML = hourSlider.value;
    minOutput.innerHTML = minSlider.value;
    hourSlider.oninput = function() {
        hourOutput.innerHTML = this.value;
    }
    minSlider.oninput = function () {
        minOutput.innerText = this.value;
    }
}



function getDefaultRangeOption(e){
    barMaxSiteTimeFind = {};
	if(e.target.id === "prev_week"){
		activeDeafultStats.style.color = "grey";
		activeDeafultStats = e.target;
		activeDeafultStats.style.color = "black";
		getPreviousWeekStats();
	}
	else if(e.target.id === "prev_month"){
		activeDeafultStats.style.color = "grey";
		activeDeafultStats = e.target;
		activeDeafultStats.style.color = "black";
		getPreviousMonthsStats(1);
	}
	else if(e.target.id === "three_month"){
		activeDeafultStats.style.color = "grey";
		activeDeafultStats = e.target;
		activeDeafultStats.style.color = "black";
		getPreviousMonthsStats(3);
	}
	else if(e.target.id === "six_month"){
		activeDeafultStats.style.color = "grey";
		activeDeafultStats = e.target;
		activeDeafultStats.style.color = "black";
		getPreviousMonthsStats(6);
	}
    else if(e.target.id === "cur_week"){
        activeDeafultStats.style.color = "grey";
        activeDeafultStats = e.target;
        activeDeafultStats.style.color = "black";
        getCurrentWeekStats();
    }
    else if(e.target.id === "cur_month"){
        activeDeafultStats.style.color = "grey";
        activeDeafultStats = e.target;
        activeDeafultStats.style.color = "black";
        getCurrentMonthStats();
    }
	document.getElementById("default_ranges").innerText = e.target.outerText;


}

function getTypeOfStats(e){
	if(e.target.id === "month_header"){
		activeStatsHeader.style.color = "grey";
		activeStatsHeader = e.target;
		activeStatsHeader.style.color = "black";
		document.getElementById("custompick").style.display="none";
		document.getElementById("monthpick").style.display = "inline-block";
		
	
	}
	else if(e.target.id === "custom_range"){
		activeStatsHeader.style.color = "grey";
		activeStatsHeader = e.target;
		activeStatsHeader.style.color = "black";
		document.getElementById("custompick").style.display="block";
		document.getElementById("monthpick").style.display = "none";
	}
} 


function showStats(date1, date2){

	fetchStatsData(new Date("2018","09","08"), new Date("2018","09","10"));
}

//2018912
function fetchStatsData(date1, date2){
	var dateTemp = new Date(date1);
	var barDataset = {
		totalTime:[]
	}
	var labelsOfBarChart = [];
	chrome.storage.sync.get(null, function(result){
		var sites = result["socialSites"];
		for(var site of sites){
			barDataset[site] = [];
		}
		var d = date1;
		while(d <= date2){
			var totalTime = 0;
			var key = getKey(d);
			if(result.hasOwnProperty(key)){
				for(var site in result[key]["summary"]){
					if(barDataset.hasOwnProperty(site)){
						var time = (+result[key]["summary"][site]);
						barDataset[site].push(time);
						totalTime += time;
					}
				}
				barDataset["totalTime"].push(totalTime);
			}
			else{
				for(var site in barDataset)
					barDataset[site].push(0);
			}
			labelsOfBarChart.push(d.toDateString());
			d.setDate(d.getDate() + 1);
		}
		//showBarChartStacked(barDataset, labelsOfBarChart); Call when stacked
		showBarChartUnstacked(barDataset, dateTemp);

	});
} 


// function setBarChartListeners(){
// 	var barChartDiv = document.getElementById("barChart_result");
// 	barCanvas.onmousemove =function(e){
		
		
// 	var activePoints = barAnalysis.getElementsAtEvent(e);
// 	if (activePoints[0]) {
// 				barChartDiv.style.visibility = "visible";
// 			//	console.log(JSON.stringify(activePoints[0]));
//         		var chartData = activePoints[0]['_chart'].config.data;
//         		console.log(chartData);
//         		var idx = activePoints[0]['_index'];

//         		var label = chartData.labels[idx];
//         		var value = chartData.datasets[0].data[idx];
//         		document.getElementById("site_name").textContent = label;
//         		var per = (+value) / barTotalTime * 100;
//         		per = per.toFixed(2); 
//         		document.getElementById("percentage").textContent = per+"%";
//         		document.getElementById("time_spend").textContent = getTimeString(""+getTimeSpend(+value));
//         		document.getElementById("most_active_site_day").textContent = barMaxSiteTimeFind[label][2]+"  (Time Spent - "+getTimeString(""+getTimeSpend(barMaxSiteTimeFind[label][0]))+")";
//         		document.getElementById("most_inactive_site_day").textContent = barMaxSiteTimeFind[label][3]+"  (Time Spent - "+getTimeString(""+getTimeSpend(barMaxSiteTimeFind[label][1]))+")";
//         		//todayAnalysis.options.elements.center.color = chartData.datasets[0].backgroundColor[idx];
        		
//       		}
// };


// barCanvas.onmouseout =function(e){
// 	barChartDiv.style.visibility = "hidden";
 	
      		
// };
// }



function showBarDivResult(e, t){
	//console.log("hello");
	 var barChartDiv = document.getElementById("barChart_result");
	// var activePoints = barAnalysis.getElementsAtEvent(e);
	console.log(e);
	console.log(e.length);
	if (e[0]) {
		//alert("hello");
		barChartDiv.style.visibility = "visible";
		barChartDiv.scrollIntoView(true);
			//	console.log(JSON.stringify(activePoints[0]));
			var chartData = e[0]['_chart'].config.data;
			console.log(chartData);
			var idx = e[0]['_index'];

			var label = chartData.labels[idx];
			var value = chartData.datasets[0].data[idx];
			document.getElementById("site_name").textContent = label;
			var per = (+value) / barTotalTime * 100;
			per = per.toFixed(2); 
			document.getElementById("percentage").textContent = per+"%";
			document.getElementById("time_spend").textContent = getTimeString(""+getTimeSpend(+value));
			document.getElementById("most_active_site_day").textContent = barMaxSiteTimeFind[label][2]+"  (Time Spent - "+getTimeString(""+getTimeSpend(barMaxSiteTimeFind[label][0]))+")";
			document.getElementById("most_inactive_site_day").textContent = barMaxSiteTimeFind[label][3]+"  (Time Spent - "+getTimeString(""+getTimeSpend(barMaxSiteTimeFind[label][1]))+")";
        		//todayAnalysis.options.elements.center.color = chartData.datasets[0].backgroundColor[idx];
        		
        	}
        	else{
        		barChartDiv.style.visibility = "hidden";

        	}
        }



function checkMaxSite(barDataset, site, time, date, i){
	if(!barMaxSiteTimeFind.hasOwnProperty(site)){
		barMaxSiteTimeFind[site] = [0,Infinity,"d1","d2"];
	}
	if(time > barMaxSiteTimeFind[site][0]){
		barMaxSiteTimeFind[site][0] = time;
		var tDay = new Date(date);
		tDay.setDate(date.getDate() + i);
		barMaxSiteTimeFind[site][2] = tDay.toDateString();
	}
	if(time < barMaxSiteTimeFind[site][1]){
		barMaxSiteTimeFind[site][1] = time;
		var tDay = new Date(date);
		tDay.setDate(date.getDate() + i);
		barMaxSiteTimeFind[site][3] = tDay.toDateString();
	}

}


function showBarChartUnstacked(barDataset, date1 ){
    barMaxSiteTimeFind = {};
	barAnalysis.options.scales.xAxes[0].stacked = false;
    barAnalysis.update();
    barAnalysis.render();
	var sumBarDataset = {};
	var totalTime = 0;
	var d = [];
	var labels = [];
	var i = 0;
	var mostActiveDay = 0;
	var mostInactiveDay = 0;
	var maxUsedSite = 0;
	var maxSiteName = "";

	//barMaxSiteTimeFind
	//var mostActiveDayOnSite
	bColor = [];
	for(var site in barDataset){
		d[i] = 0;
		if(site != "totalTime"){
			labels.push(site);
			bColor.push(BGCOLOR[i]);
		}
		else
			i--;
		var k = 0;
		var j = 0;
		for(var e of barDataset[site]){
			if(site === "totalTime"){
				totalTime += (+e);
				if(e >  barDataset["totalTime"][mostActiveDay])
					mostActiveDay = k;
				if(e < barDataset[site][mostInactiveDay])
					mostInactiveDay = k;
				k++;
			}
			else{
				checkMaxSite(barDataset, site, e, date1, j++);
				d[i] += (+e); 
			}
		}
		if(d[i] > maxUsedSite){
			maxUsedSite = d[i];
			maxSiteName = site;
		}
		i++;
	}
	barData.datasets[0].data = d;
	barTotalTime = totalTime;
	barData.labels = labels;
	barData.datasets[0].backgroundColor = bColor;
	barAnalysis.update();
	barAnalysis.render();
	

	var mat = getTimeString(""+getTimeSpend(barDataset["totalTime"][mostActiveDay]));
	var mit = getTimeString(""+getTimeSpend(barDataset["totalTime"][mostInactiveDay]));
	var timeParts = mat.split(",");

	var tDay = new Date(date1);
	tDay.setDate(date1.getDate() + mostActiveDay);
	document.getElementById("most_active_day").textContent = tDay.toDateString()+"  (Time Spent - "+mat+")";

	
	var tDay2 = new Date(date1);
	tDay2.setDate(date1.getDate() + mostInactiveDay);
	document.getElementById("most_inactive_day").textContent = tDay2.toDateString()+"  (Time Spent - "+mit+" )";

	document.getElementById("most_used_site").textContent = maxSiteName+"  (Time Spent - "+getTimeString(""+getTimeSpend(maxUsedSite))+" )";
	document.getElementById("total_time_spend").textContent = getTimeString(""+getTimeSpend(totalTime));
	//var
}


//todayData.datasets[0].data = data;
function showBarChartStacked(barDataset, labelsOfBarChart){
	var dataOfBarChart = [];
	var i = 0;
	for(var key in barDataset)
		if(key != "totalTime")
		dataOfBarChart.push({label:key,data:barDataset[key], backgroundColor:BGCOLOR[i++]});
	
	barData.datasets = dataOfBarChart;
	barData.labels = labelsOfBarChart;
	document.getElementById("bar-canvas-holder").style.height = 80*labelsOfBarChart.length+"px";

	barAnalysis.update();

	barAnalysis.render();


}

function getKey(date){
	var key = ""+date.getFullYear()+date.getMonth()+date.getDate();
//	console.log("Key to be searched = ", key);
	return key;
}

function getCurrentWeekStats(){
	var date1 = new Date();
	var date2 = new Date();
	date1.setDate(date1.getDate() - date1.getDay());
    fetchStatsData(date1, date2);
    var time = document.getElementById("time_range");
    var timeSite = document.getElementById("time_range_site");
    time.textContent = date1.toDateString() + " - "+ date2.toDateString();
    timeSite.textContent = date1.toDateString() + " - "+ date2.toDateString();
}

function getCurrentMonthStats(){
    var date1 = new Date();
    var date2 = new Date();
    date1.setDate(1);
    fetchStatsData(date1, date2);
    var time = document.getElementById("time_range");
    var timeSite = document.getElementById("time_range_site");
    time.textContent = date1.toDateString() + " - "+ date2.toDateString();
    timeSite.textContent = date1.toDateString() + " - "+ date2.toDateString();
}


function getPreviousWeekStats(){
	var date2 = new Date();
	var date1 = new Date();
	date1.setDate(date2.getDate() - (date2.getDay()+7));
	date2.setDate(date2.getDate() - date2.getDay() - 1);

	console.log(date1+" "+date2);
	fetchStatsData(date1, date2);
	var time = document.getElementById("time_range");
	var timeSite = document.getElementById("time_range_site");
	time.textContent = date1.toDateString() + " - "+ date2.toDateString();
	timeSite.textContent = date1.toDateString() + " - "+ date2.toDateString();
}

function getPreviousMonthsStats(noOfMonths){
	var date1 = new Date();
	date1.setMonth(date1.getMonth() - noOfMonths);
	date1.setDate(1);
	var date2 = new Date();
	date2.setDate(0);
	console.log(date1+" "+date2);
	fetchStatsData(date1, date2);
	var time = document.getElementById("time_range");
	var timeSite = document.getElementById("time_range_site");
	time.textContent = date1.toDateString() + " - "+ date2.toDateString();
	timeSite.textContent = date1.toDateString() + " - "+ date2.toDateString();
}


function getStatsForSelectedMonth(){
	var selectedMonthYear = document.getElementById("month");
	var timeparts = selectedMonthYear.value.split("-");
	var date1 = new Date(timeparts[0],+timeparts[1]-1,"1");
	var date2 = new Date(timeparts[0],timeparts[1],"0");
	fetchStatsData(date1, date2);
}

function getStatsForSelectedRange(){
	var day1 = document.getElementById("custom_date1");
	var day2 = document.getElementById("custom_date2");
	var timeparts1 = day1.value.split("-");
	var timeparts2 = day2.value.split("-");
	fetchStatsData(new Date(timeparts1[0],+timeparts1[1]-1,timeparts1[2]), new Date(timeparts2[0],+timeparts2[1]-1,timeparts2[2]));
}

function getAnalysisForSelectedDay(){
	var datePicker = document.getElementById("date_selector").value;
	showChart(new Date(datePicker));
}	

function getTypeOfAnalysis(e){
	//alert(e.target.id);
	if(e.target.id != "analysis_header" && e.target.id != "stats"){
		var datePickerDiv = document.getElementById("datepick");
		datePickerDiv.style.visibility="hidden";
		activeAnalysisHeader.style.color = "grey";
		activeAnalysisHeader = e.target;

	}
	if(activeAnalysisHeader.id === "today"){
		activeAnalysisHeader.style.color = "black";
		showChart(new Date());
	
	}
	else if(activeAnalysisHeader.id === "select_day"){
		activeAnalysisHeader.style.color = "black";
		datePickerDiv.style.visibility="visible";

		
		//var date = document.getElementById("date_selector").value;
		//showChart(new Date(date));
	}
	else if(activeAnalysisHeader.id === "all_time"){
		activeAnalysisHeader.style.color = "black";
		showChart(null);
	}
	if(e.target.id === "stats"){
		document.getElementById("statistics").style.display = "block";
	}


}



async function showChart(date){
	var socialSites = await new Promise(fetchSocialSites);
	data = [];
	totalTimeSpend = 0;
	bColor = [];
	labels = [];
	var today = date;
	dataTable.innerHTML="";
//	dataTable.style.visibility = "hidden";
	var key = null;
	if(date != null)
		key = ""+today.getFullYear()+today.getMonth()+today.getDate();
	chrome.storage.sync.get(key,function(result){
		console.log(result[key]);
		if(result[key]){
			var summary = result[key]["summary"];
			var i = 0;
			for(var site in summary){
				if(!socialSites.includes(site))
					continue;
				data.push(((+summary[site])));
				totalTimeSpend += (+summary[site]);
				console.log("Total Time Spend Today = " + totalTimeSpend);
				//labels.push(site);
				bColor.push(BGCOLOR[i++]);
			}
			todayData.datasets[0].backgroundColor = bColor;
			todayData.datasets[0].data = data;

			createTable(result[key]["summary"], socialSites);
			todayData.labels = labels;

		}
		else if(date === null){
			var tt = 0;
			var totalSummary = {};
			for(var k in result){
				if(setOfKeys.has(k))
					continue;
				var summary = result[k]["summary"];
				for(var site in summary){
					if(!socialSites.includes(site))
						continue;
					if(!totalSummary.hasOwnProperty(site))
						totalSummary[site] = 0;
					totalSummary[site] += summary[site];
				}
			}
			var i = 0;
			for(var site in totalSummary){
				data.push(((+totalSummary[site])));
				totalTimeSpend += (+totalSummary[site]);
				console.log("Total Time Spend Today = " + totalTimeSpend);
				//labels.push(site);
				tt = totalTimeSpend;
				bColor.push(BGCOLOR[i++]);
			}
			todayData.datasets[0].backgroundColor = bColor;
			todayData.datasets[0].data = data;

			createTable(totalSummary, socialSites);
			todayData.labels = labels;

		}
		else{
			todayData.labels = ['No Data'];
			todayData.datasets[0].data = ['1'];	
		}
			todayAnalysis.update();
			todayAnalysis.render();
		
	});
}


function setListenersToTable(){
dataTable.addEventListener("mouseover", function(e){
	
	var rowHovered = e.target.parentElement;
	var body = document.querySelector("body")
	console.log("Selected= "+body);
	console.log("Hovered row = "+rowHovered);
	console.log("Hovered row = "+rowHovered.id);

	if(rowHovered != body && rowHovered.id != "table_head"){
		rowHovered.style.color = "black";
		cur = todayAnalysis.getDatasetMeta(0).data[rowHovered.id];
		todayAnalysis.updateHoverStyle([cur], null, true);
	
// render so we can see it
		todayAnalysis.render();
		var d = todayAnalysis.chart.config.data.datasets[0];
		todayAnalysis.options.elements.center.text = todayData.labels[rowHovered.id];
		//data.borderColor = "black";
		todayAnalysis.options.elements.center.color = d.backgroundColor[rowHovered.id];
	}
});

dataTable.addEventListener("mouseout", function(e){
	var rowHovered = e.target.parentElement;
	console.log(rowHovered);
	//console.log(e);
	rowHovered.style.color = "grey";


	todayAnalysis.updateHoverStyle([cur], null, false);
	
// render so we can see it
	todayAnalysis.render();
	todayAnalysis.options.elements.center.text = "";

});
}

function setDoughnutListeners(){
	canvas.onmousemove =function(e){
	var activePoints = todayAnalysis.getElementsAtEvent(e);
	if (activePoints[0]) {
			//	console.log(JSON.stringify(activePoints[0]));
        		var chartData = activePoints[0]['_chart'].config.data;
        		console.log(chartData);
        		var idx = activePoints[0]['_index'];

        		var label = chartData.labels[idx];
        		var value = chartData.datasets[0].data[idx];
        		todayAnalysis.options.elements.center.text = todayData.labels[idx];;
        		todayAnalysis.options.elements.center.color = chartData.datasets[0].backgroundColor[idx];
        		if(curRow != null)
        			curRow.style.color = "grey";
        		curRow = document.getElementById(idx);

        		curRow.style.color = "black";
        	//	chartData.datasets[0].
        		// var url = "http://example.com/?label=" + label + "&value=" + value;
        		// console.log(url);
        		// alert(url);
      		}
};

canvas.onmouseout =function(e){

    todayAnalysis.options.elements.center.text = "";
    curRow.style.color = "grey";

      		
};
}






function createTable(result, socialSites){
	var i = 0;
	for (var key in result){
		if(socialSites.includes(key)){
		dataTable.appendChild(createRow(result, key, i));
		i++;
		}
	}
}

function createRow(result, key, id){
	var time = ""+getTimeSpend(result[key]);
	var per = result[key] / totalTimeSpend * 100;
	per = per.toFixed(2); 
	labels.push(key + " " + per+"%");
	var timeParts = time.split(",");
	var hours = "00";
	var mins = "00";
	var secs = "00";
	if(timeParts.length === 3){
		hours = timeParts[0];
		mins = timeParts[1];
		secs = timeParts[2];
	//	labels.push(key + " " + per+"% "+hour+"h "+mins+"m "+secs+"s");
	}
	else if(timeParts.length === 2){
		mins = timeParts[0];
		secs = timeParts[1];
	//	labels.push(key + " " + per+"% "+mins+"m "+secs+"s");
	}
	else if(timeParts.length === 1){
		secs = timeParts[0];
	//	labels.push(key + " " + per+"% "+secs+"s");
	}
	if(secs.length == 1)
		secs = "0"+secs;
	if(mins.length == 1)
		mins = "0"+mins;
	if(hours.length == 1)
		hours = "0"+hours;
		
	console.log(timeParts.length);
	console.log(timeParts);
	console.log(typeof secs);

	var row = document.createElement('TR');
	row.id = id;
	var s = document.createElement('span');
	s.className = "badge";
	s.textContent = ".";
	s.style.color = BGCOLOR[id];
	s.style.backgroundColor=BGCOLOR[id];
	var label = document.createElement('TD');
	label.appendChild(s);

	var domain = document.createElement('TD');
	domain.textContent = key;

	var empty1 = document.createElement('TD');
	empty1.textContent = "sssssssss";
	empty1.style.color="#fff";
	var empty2 = document.createElement('TD');
	empty2.textContent = "sss";
	empty2.style.color="#fff";

	var percentage = document.createElement('TD');
	percentage.textContent = per;
	var percentageMark = document.createElement('TD');
	percentageMark.textContent = "%";
	var hour = document.createElement('TD');
	hour.textContent = hours;

	var hMark = document.createElement('TD');
	hMark.textContent = "h";
	if(hours != "00"){
		hour.style.color = "black";
		hMark.style.color = "black";
	}
	var min = document.createElement('TD');
	min.textContent = mins;
	var mMark = document.createElement('TD');
	mMark.textContent = "m";
	if(mins != "00"){
		min.style.color = "black";
		mMark.style.color = "black";
	}
	var sec = document.createElement('TD');
	sec.textContent = secs;
	var sMark = document.createElement('TD');
	sMark.textContent = "s";
	if(secs != "00"){
		sec.style.color = "black";
		sMark.style.color = "black";
	}

	row.appendChild(label);
	row.appendChild(domain);
	row.appendChild(empty1);
	row.appendChild(percentage);
	row.appendChild(percentageMark);
	row.appendChild(empty2);
	row.appendChild(hour);
	row.appendChild(hMark);
	row.appendChild(min);
	row.appendChild(mMark);
	row.appendChild(sec);
	row.appendChild(sMark);

	return row;
}


chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab){
     console.log( "From tabs changed -- "+ tab.url);
     if(tab.url === "chrome://newtab/"){
     	//	alert("updated");
     	document.location.reload();
     }
  });
}); 


 function aboutUs(){
 	chrome.tabs.create({"url":chrome.runtime.getURL("analytics.html")});
 }

 function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}
