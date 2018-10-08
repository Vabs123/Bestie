
//console.log("hello")
//Doughnut Chart
var data = [];
var labels = [];
var BGCOLOR = ["red","orange","purple", "#0000FF", "#8A2BE2", "#A52A2A", "#5F9EA0", "#D2691E","#DC143C","#008B8B","#FF8C00", "#8B0000", "#228B22","#FFD700", "#FF4500","#9ACD32"];
var bColor = [];
var canvas = null;
var ctx = null;
var todayAnalysis = null;
var todayData = null;
var totalTimeSpend = 0;
var dataTable = null;
var cur = null;
var curRow = null;


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
				//onHover: abc,
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

window.onload = function(){
	//console.log("hello");
//	document.body.style.backgroundImage = "url('img.jpg')";
	initiallize();
	
}

function initiallize(){
	canvas = document.getElementById("chart-area");
	ctx = canvas.getContext("2d");
	todayAnalysis = new Chart(ctx, config);
	todayData = todayAnalysis.chart.config.data;
	dataTable = document.getElementById("data_table");
	document.getElementById("dashboard").addEventListener("click", showAnalytics);
	setListenersToTable();
	showChart();
	setDoughnutListeners();
}



function showChart(){
	var today = new Date();
	var key = ""+today.getFullYear()+today.getMonth()+today.getDate();
	chrome.storage.sync.get([key],function(result){
		console.log(result[key]);
		if(result[key]){
			var summary = result[key]["summary"];
			var i = 0;
			for(var site in summary){
				data.push(((+summary[site])));
				totalTimeSpend += (+summary[site]);
				console.log("Total Time Spend Today = " + totalTimeSpend);
				//labels.push(site);
				bColor.push(BGCOLOR[i++]);
			}
			todayData.datasets[0].backgroundColor = bColor;
			todayData.datasets[0].data = data;	
			createTable(result[key]);
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


function createTable(result){
	var i = 0;
	for (var key in result["summary"]){
		dataTable.appendChild(createRow(result["summary"], key, i));
		i++;
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
	}
	else if(timeParts.length === 2){
		mins = timeParts[0];
		secs = timeParts[1];
	}
	else if(timeParts.length === 1){
		secs = timeParts[0];
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
	var percentage = document.createElement('TD');
	percentage.textContent = per;
	var percentageMark = document.createElement('TD');
	percentageMark.textContent = "%";
	var hour = document.createElement('TD');
	hour.textContent = hours;
	var hMark = document.createElement('TD');
	hMark.textContent = "h";
	var min = document.createElement('TD');
	min.textContent = mins;
	var mMark = document.createElement('TD');
	mMark.textContent = "m";
	var sec = document.createElement('TD');
	sec.textContent = secs;
	var sMark = document.createElement('TD');
	sMark.textContent = "s";

	row.appendChild(label);
	row.appendChild(domain);
	row.appendChild(percentage);
	row.appendChild(percentageMark);
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


 function showAnalytics(){
 	chrome.tabs.create({"url":chrome.runtime.getURL("analytics.html")});
 }
