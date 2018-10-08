var randomScalingFactor = function() {
	return Math.round(Math.random() * 100);
};



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
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
						randomScalingFactor(),
					],
					"backgroundColor":["rgb(255, 99, 132)","rgb(54, 162, 235)","rgb(255, 205, 86)"],
					//"hoverBorderColor":["rgb(255, 91, 132)","rgb(54, 62, 235)","rgb(255, 5, 86)"],
					
					label: 'Dataset 1'
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
					display: true,
					text: 'Chart.js Doughnut Chart'
				},
				animation: {
					animateScale: true,
					animateRotate: true
				},
				events:["mousemove", "mouseout", "click", "touchstart", "touchmove"],

				elements: {
						center: {
									text: '90%',
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


