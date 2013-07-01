var drawTimeline = function() {
	var deltaDays = function(start, end) {
		return Math.ceil((end.getTime() - start.getTime()) / (1000*60*60*24));
	};

  var drawCommentBubble = function(svg, x, y) {

  	console.log(y);

  	var lineFunction = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("step-after");

		//.attr('d', 'm' + x + ',' + y + ',0l0,23.505997l-15.828995,0l-13.82901,8.703003l-2.826996,-8.703003l-10.828003,0l0,-23.505997l0.001007,0z')
		//.attr('d','m0.938,0.541l43.312,0l0,23.506l-15.82899,0l-13.82901,8.703l-2.827,-8.703l-10.828,0l0,-23.506l0.001,0z')
  	var bubble = svg.append('path')
  		.attr('d','m' + x + ',' + y + 'l33.31223,0l0,18.07899l-12.17443,0l-10.6362,6.69367l-2.17431,-6.69367l-8.32806,0l0,-18.07899l0.00077,0z')
  		.attr('stroke-width', '0')
  		.attr('fill', '#6a6b6b');

  	for(var i in [0,10,20]) {
  		var dot = svg.append("circle")
				.attr('cx', x + 10 + i*7)
				.attr('cy', y + 10)
				.attr("r", 2.4)
				.attr('stroke-width', '0')
        .attr('fill', '#ffffff');
    }
  }

	var parseTime = function(time) {
		var d = convertDateToUTC(new Date(time));

		d.setHours(d.getHours() - 7);

		return d;
	};

	var addDate = function(reading) {reading.date = parseTime(reading.time); return reading;};

	bg.map(addDate);
	cgm.map(addDate);
	pumpInsulin.map(addDate);

  function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); }
	

	var dayId = function(time) {
		return time.getDate() + '-' + time.getMonth() + '-' + time.getYear();
	};

	var dayMinutes = function(time) {
		return time.getHours() * 60 + time.getMinutes();
	};

	var getDays = function(bg) {
		var days = _.groupBy(bg, function(reading){ 

			return dayId(parseTime(reading.time));
		});

		return days;
	};


	var shape = function(reading, x, y, svgContainer) {
		var blue = '#41A5C5';
		
		reading.value = reading.bg || reading.cbg;

		if(reading.value == 'Low') {
			reading.value = 0;
		}
		if(reading.value == 'High') {
			reading.value = 1000;
		}

		var ranges = [
			{
				low: 0,
				high: 60,
				color: '#FF0000',
				shape: 'down'
			},
			{
				low: 60,
				high: 80,
				color: '#FF0000',
				shape: 'downring'
			},
			{
				low: 80,
				high: 140,
				color: '#41A5C5',
				shape: 'ring'
			},
			{
				low: 140,
				high: 180,
				color: '#41A5C5',
				shape: 'circle',
			},
			{
				low: 180,
				high: 250,
				color: '#FFCE00',
				shape: 'upring',
			},
			{
				low: 250,
				high: 1000,
				color: '#FFCE00',
				shape: 'up',
			}
		];

		var color;
		var shape;

		for(var i in ranges) {
			var range = ranges[i];

			if(reading.value >= range.low && reading.value <= range.high) {
				color = range.color;
				shape = range.shape;
			}
		}

		var time = parseTime(reading.time);
		var id = dayId(time) + '-' + dayMinutes(time);
		var point;

		if(reading.bg) switch(shape) {
			case 'ring':
			point = svgContainer.append("circle")
				.attr("cx", x)
				.attr("cy", y)
				.attr("r", 5.5)
				.attr('id', id)
				.attr('stroke', color)
				.attr('stroke-width', '2')
				.attr('fill-opacity', 0)
        .attr('fill', 'white');
			break;
			case 'up':
			var p = (6+x) + ',' + (0+y-5.5)  + ' ' + (11+x) + ',' + (11+y-5.5) + ' ' + (0+x) + ',' + (11+y-5.5) + ' ';
			
      point = svgContainer.append("polygon")
  			.attr('points', p)
  			.attr('id', id)
  			.attr('stroke', color)
				.attr('stroke-width', '2')
        .attr('fill', color);
			break;
			case 'upring':
			var p = (6+x) + ',' + (0+y-5.5)  + ' ' + (11+x) + ',' + (11+y-5.5) + ' ' + (0+x) + ',' + (11+y-5.5) + ' ';
			
      point = svgContainer.append("polygon")
  			.attr('points', p)
  			.attr('id', id)
  			.attr('stroke', color)
				.attr('stroke-width', '2')
				.attr('fill-opacity', 0)
        .attr('fill', 'white');
			break;
			case 'down':
			var p = (x) + ',' + (y-5.5) + ' ' + (11+x) + ',' + (0+y-5.5) + ' ' + (6+x) + ',' + (11+y-5.5);
			
      point = svgContainer.append("polygon")
  			.attr('points', p)
  			.attr('stroke', color)
  			.attr('id', id)
				.attr('stroke-width', '2')
        .attr('fill', color);
			break;
			case 'downring':
			var p = (x) + ',' + (y-5.5) + ' ' + (11+x) + ',' + (0+y-5.5) + ' ' + (6+x) + ',' + (11+y-5.5);
			
			
      point = svgContainer.append("polygon")
  			.attr('points', p)
  			.attr('id', id)
  			.attr('stroke', color)
				.attr('stroke-width', '2')
        .attr('fill', 'white')
        .attr('fill-opacity', 0);
			break;
			case 'circle':
			point = svgContainer.append("circle")
				.attr("cx", x)
				.attr("cy", y)
				.attr("r", 5)
				.attr('id', id)
				.attr('stroke', color)
				.attr('stroke-width', '2')
        .attr('fill', color);
			break;
			default:
			point = svgContainer.append("circle")
				.attr("cx", x)
				.attr("cy", y)
				.attr("r", 5)
				.attr('id', id)
				.attr('stroke', color)
				.attr('stroke-width', '2')
        .attr('fill', 'white');
			break;
		}

		if(reading.cbg) {
			point = svgContainer.append("circle")
				.attr("cx", x)
				.attr("cy", y)
				.attr("r", 2)
				.attr('fill-opacity', 1)
        .attr('fill', color);
		}
		point.attr('class','ppoint');
		point.attr('id',reading.ticks);
		
		point.on("mouseover", function() {
			$(this).css('opacity',.2);
			//moment(parseTime(reading.time)).format("hA ddd Do"));
			//console.log((reading.bg + ' @ ' + moment(parseTime(reading.time)).format("hA ddd Do")));
		});
    point.on("mouseout", function() {
    	$(this).css('opacity',1);
    });

    point.on('click',function() {
    	day.scroll(reading.date);
    	$('#two').trigger('click');
    });

    $('#' + reading.ticks).tipsy({gravity: 'w', title: function() {
    	if(reading.cbg) {
    		return (reading.cbg + ' @ ' + moment(parseTime(reading.time)).format("hA ddd Do"));	
    	}
  		return (reading.bg + ' @ ' + moment(parseTime(reading.time)).format("hA ddd Do"));
  	}});
	};

	var drawPath = function(edges, svgContainer, options) {
		if(!options) {
			options = {
				'stroke': 'gray',
				'stroke-width': 1,
				'fill': 'none'
			}
		}

			var lineFunction = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("step-after");
			
			//The line SVG Path we draw
		var lineGraph = svgContainer.append("path")
			.attr("d", lineFunction(edges));

		for(var o in options) {
			lineGraph.attr(o, options[o]);
		}
	};

	var millisecondDistance = function(hour) {
		var start = new Date('2013 12 12 00:00:00');
		var end = new Date('2013 12 12 ' + hour);

		return end.getTime() - start.getTime();
	};

	startOfDay = function(date) {
		var d = new Date(date.toString());
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0);

		return d;
	};

	var daypx = 980;
	var oneDay = 1000*60*60*24;
	var timepx = daypx/oneDay;
	var firstDay = startOfDay(bg[0].date);

	var scroll = function(date, time) {
		var move = 0;
		var ticks = firstDay.getTime() + ($('#timelineContainer').scrollLeft()/timepx);
		var today = new Date();
		
		if(!date) {
			date = bg[bg.length-1].date;
		}

		if(date === -1) {
			today.setTime(ticks - oneDay);
			date = startOfDay(today);
			move = 1082/2;
		}
		
		if(date === 1) {
			today.setTime(ticks + oneDay);
			date = startOfDay(today);
			move = 1082/2;
		}

		if(date === 'today') {
			date = startOfDay(new Date());
			move = 1082/2;
		}

		
		var left = ((date.getTime()  - firstDay.getTime()) * timepx) - 1080/2 + move;
		if(time === 0) {
			$('#timelineContainer').animate({ scrollLeft: left + "px" }, 0);
		} else {
			$('#timelineContainer').animate({ scrollLeft: left + "px" });	
		}
	};

	var draw = function(bg, cgm, pumpSettings, pumpInsulin) {
    
    var days = deltaDays(bg[0].date, new Date());
    var width = days * daypx;
    var max = 350;
		var padding = 10;
    var height = {
     	bg: 190,
     	xOffset: 25,
     	spacing: 10,
     	activity: 180,
   		basal: 113
    };

    var totalHeight = height.xOffset*2 + height.bg + height.spacing*2 + height.activity + height.basal;
    var basalMax = 2;
		
		
    var slots = ['12 AM','3 AM','6 AM','9 AM', '12 PM', '3 PM', '6 PM' ,'9 PM'];
    var colors = ['#DCE4E8','#E3E9EC','#EAEEF0','#F7F8F9','#F7F8F9','#EAEEF0','#E3E9EC','#DCE4E8'];

    var svgContainer = d3.select("#timeline").append("svg").attr("width", width).attr("height", totalHeight);
    var svgYAxis = d3.select("#timelineAxis").append("svg").attr("width", 45).attr("height", totalHeight);


		//<text x="200" y="100" transform="rotate(180 200,100)">Hello!</text>
		
		var drawYAxis = function() {
    	var steps = [
    		40,
    		80,
    		120,
    		160,
    		200,
    		240,
    		280,
    		320
    	];

    	var x = 40;

    	for(var i in steps) {
    		var y =  (height.xOffset + height.bg) - (parseInt(steps[i]) * (height.bg/max));

    		svgYAxis.append('text')
					.attr('x', 25 + (steps[i] < 100 ? 5 : 0))
					.attr('y', y+4)
					.attr('fill', '#DCE4E8')
					.attr('font-family','sans-serif')
					.attr('text-anchor','start')
					.attr('font-size', 9)
					.text(steps[i] === 320 ? '': steps[i]);
    	}
    
			var labels = [
				{y:43 ,text: 'BG'},
				{y:265 ,text: 'CARBS'},
				{y:405 ,text: 'BOLUS'},
				{y:527 ,text: 'BASAL'}
			];	
			
			for(var i in labels) {
				var label = labels[i];

				svgYAxis.append('text')
					.attr('x', x)
					.attr('y', label.y)
					.attr('fill', '#2582A8')
					.attr('font-family','sans-serif')
					.attr('font-weight','bold')
					.attr('text-anchor','start')
					.attr('font-size', 11)
					.attr("transform", function(d) {return 'rotate(-90 ' + x + ',' + label.y + ')'})
					.text(label.text);
			}
		};
		drawYAxis();

		
    var drawBackground = function() {
    	var segment = (oneDay/8) * daypx/oneDay;
    	var x = 0;
    	var day = (new Date());
			day.setTime(firstDay.getTime());

    	for(var i=0; i<days; i++) {
    		day.setHours(day.getHours() + 24);
    		for(var j=0; j<8; j++) {
    			var rectangle = svgContainer.append("rect")
           	.attr("x", x)
            .attr("y", height.xOffset)
            .attr('fill', colors[j])
            .attr("width", segment)
            .attr("height", totalHeight - height.xOffset*2);

          svgContainer.append("rect")
		        .attr('x', x)
		        .attr('y', 7)
	          .attr("width", 1)
	          .attr('fill', '#B7C9D2')
	          .attr("height", 18);

	        var label = !!j ? slots[j] : moment(day).format("ddd MMM Do");
	        var labelColor = !!j ? '#2582A8' : '#4AA9D8';
	        var labelSize = !!j ? 11 : 12;

          svgContainer.append('text')
						.attr('x', x+5)
						.attr('y', 22)
						.attr('fill', labelColor)
						.attr('font-family',"sans-serif")
						.attr('text-anchor',"start")
						.attr('font-size', labelSize)
						.text(label);
					
					svgContainer.append('text')
						.attr('x', x+5)
						.attr('y', height.xOffset + height.bg + height.spacing*2 + height.activity + height.basal + 15)
						.attr('fill', labelColor)
						.attr('font-family',"sans-serif")
						.attr('text-anchor',"start")
						.attr('font-size', labelSize)
						.text(label);

					svgContainer.append("rect")
		        .attr('x', x)
		        .attr('y', height.xOffset + height.bg + height.spacing*2 + height.activity + height.basal)
	          .attr("width", 1)
	          .attr('fill', '#B7C9D2')
	          .attr("height", 18);

          x += segment;
    		}
    	}
    };


    drawBackground();


    var drawSpacing = function() {
    	var steps = [
    		40,
    		80,
    		120,
    		160,
    		200,
    		240,
    		280,
    		320
    	];

    	for(var i in steps) {
    		var y =  (height.xOffset + height.bg) - (steps[i] * (height.bg/max));

    		var rectangle = svgContainer.append("rect")
                         	.attr("x", 0)
                          .attr("y", y)
                          .attr('fill', 'white')
                          .attr("width", width)
                          .attr("height", 1);
    	}
    	
    	var rectangle = svgContainer.append("rect")
                         	.attr("x", 0)
                          .attr("y", height.bg + height.xOffset)
                          .attr('fill', 'white')
                          .attr("width", width)
                          .attr("height", height.spacing);
      var rectangle = svgContainer.append("rect")
                         	.attr("x", 0)
                          .attr("y", height.xOffset + height.bg + height.spacing + height.activity)
                          .attr('fill', 'white')
                          .attr("width", width)
                          .attr("height", height.spacing);
    };
    drawSpacing();
		

		var getX = function(date, offset) {
			if(!offset) {
				offset = 0;
			}

			return (date.getTime() - firstDay.getTime() - offset) * daypx/oneDay;	
		};

		var getY = function(value, height) {
			var y = value * ((height - padding)/max);

			if(y > height - padding) {
				y = height - padding;
			}
			if(!y && value == 'High') {
				y = height - padding;
			}
			if(!y && value == 'Low') {
				y = padding;
			}
			
			return height - y;;
		};

		// plot cgm
		for(var i  in cgm) {
			var reading = cgm[i];	
			shape(reading, getX(reading.date), getY(reading.cbg, height.bg) + height.xOffset, svgContainer);
		}

		// plot bg
		for(var i  in bg) {	
			var reading = bg[i];	
			shape(reading, getX(reading.date), getY(reading.bg, height.bg) + height.xOffset, svgContainer);
		}

		var bolusMax = 10;
		var carbMax = 100;

		var drawBolus = function(data) {
			var bolus = _.filter(data, function(p){ 
				return !!p.bolus || !!p.carbs;
			});

	//		console.log(bolus);
			bolus = _.groupBy(bolus, function(b) {
				return b.time;
			});

			for(var time in bolus) {
				var x = getX(parseTime(time));

				for(var i in bolus[time]) {
					var entry = bolus[time][i];
					var y, tall, fill;
					
					if(entry.bolus) {
						tall = entry.bolus * (height.activity/2)/bolusMax;
						y = height.activity - tall;
						fill = '#0998A1';
					}

					if(entry.carbs) {
						y = 0;
						tall = entry.carbs * (height.activity/2)/carbMax;
						fill = '#CF73E0'
					}

					var width = 5;
					if(entry['bolus_type'] == 'Combination') {
						width = (parseInt(entry.dur) * 60 * 1000)/(oneDay/daypx);
					}

					var rectangle = svgContainer.append("rect")
                          .attr("x", x)
                          .attr("y", y +height.xOffset +  height.bg + height.spacing)
                          .attr('fill', fill)
                          .attr("width", width)
                          .attr("height", tall);
				}
			};
		};
		
		var drawPortions = function() {
			var pi = Math.PI;

			for(var i=1; i<(days+1); i++) {
				var arc = d3.svg.arc()
			    .innerRadius(0)
			    .outerRadius(10)
			    .startAngle(180 * (pi/180))
			    .endAngle(0 * (pi/180));

				svgContainer.append("path")
			    .attr("d", arc)
			    .attr("transform", "translate(" + i*1080 +","+height.xOffset +  height.bg + height.spacing + height.activity * 0.7 +")")
			}
		};

		var drawActualBasal = function(data) {
			var basals = _.filter(data, function(p){ 
				return !!p.basal;
			});

			var points = [];
			
			for(var i in basals) {
				var basal = basals[i];
				var p = {
					x: getX(parseTime(basal.time)),
					y: (height.basal - (basal.basal * height.basal/basalMax)) +height.xOffset +  height.bg + height.spacing*2 + height.activity
				};

				points.push(p);
			}

			drawPath(points,svgContainer, {'stroke':'#0998A1','stroke-dasharray': [5,5],'stroke-width': 1, 'fill': 'none', 'fill-opacity': '0.4'});

			points.push({
				x: points[points.length-1].x,
				y: height.xOffset + height.basal + height.bg + height.spacing*2 + height.activity
			});
			
			points.push({
				x: points[0].x, 
				y: height.xOffset + height.basal + height.bg + height.spacing*2 + height.activity
			});

			points.push(points[0]);

			drawPath(points,svgContainer, {'stroke-width': 0, 'fill': '#C4EFEE', 'fill-opacity': '0.4'});
		};

		var drawSettingBasal = function(settings) {
			var coords = [];
			var basalProgram = pumpSettings[0].settings['basal-programs'][0];

			for(var i in basalProgram) {
				var basal = basalProgram[i];
				
				var c = {
					x: millisecondDistance(basal.time) * daypx/oneDay,
					y: height.basal - (basal.value * height.basal/basalMax) +height.xOffset +  height.bg + height.spacing*2 + height.activity
				};
				coords.push(c);
			}

			if(millisecondDistance(basalProgram[basalProgram.length-1].time) != oneDay) {
				coords.push({
					x: daypx,
					y: coords[coords.length-1].y 
				});	
			}

			var basalPath = [];

			basalPath = basalPath.concat(coords);

			for(var i=0; i<(days-1); i++) {
				coords = coords.map(function(c) {
					return {
						x: c.x + daypx,
						y: c.y
					}
				});
			
				basalPath = basalPath.concat(coords);
			}

			drawPath(basalPath,svgContainer, {'stroke':'#0998A1','stroke-width': 2, 'fill': 'none', 'fill-opacity': '1'});
		};
		
		var drawDayLabels = function() {
			var day = (new Date());
			day.setTime(firstDay.getTime());

			
			for(var i=0; i < days; i++) {
				day.setHours(day.getHours() + 24);

				var left = (day.getTime()  - firstDay.getTime()) * timepx + 40;

				svgContainer.append('text')
					.attr('x', left)
					.attr('y', 45)
					.attr('fill', '#4AA9D8')
					.attr('font-family','sans-serif')
					.attr('text-anchor','start')
					.attr('font-size', 13)
					.text(moment(day).format("ddd MMM Do"));
			}
		};

		var drawEvents = function(events) {
			events = _.uniq(pumpEvents, function(e) {return e.event + "" + e.ticks});

			for(var i in events) {
				var _event = events[i];
				var left = (_event.ticks  - firstDay.getTime()) * timepx + 40;
				var y = height.xOffset + height.bg + height.spacing*2 + height.activity + 30;
				var text = 'event';
				var show = false;

				switch(_event.event){
					case "suspend":
					text = 'Suspend';
					y = y - 10;
					break;
					case "resume":
					text = 'Resume';
					y = y - 20;
					break;
					case "prime":
					text = 'Prime';
					show = true;
					break;
					case "fillc":
					text = 'Fill Canula';
					y = y - 12;
					show = true;
					break;
					case "alarm":
					text = 'Alarm';
					y = y - 50;
					break;
				}
				if(show) {
					svgContainer.append('text')
					.attr('x', left)
					.attr('y', y)
					.attr('fill', '#2582A8')
					.attr('font-family','sans-serif')
					.attr('text-anchor','start')
					.attr('font-size', 11)
					.text(text);	
				}
				
			}
		};

		var drawInsulinRatioTimeline = function(pumpInsulin) {
			var day = (new Date());
			day.setTime(firstDay.getTime());

			for(var i=0; i < days; i++) {
				var ratio = stats.insulinRatio(day.getTime(), day.getTime() + oneDay);
				
				day.setHours(day.getHours() + 24);

				var x = (day.getTime()  - firstDay.getTime()) * timepx + daypx;
				var y = height.xOffset + height.bg + height.spacing*2 + height.activity + height.basal/2;

				var rangePie = svgContainer.pieChart(left, y, 25, values, labels, colors, bcolors, "#B6C6CF");
			}
		};

		var drawAdherence = function(adherance) {
			
			for(var i in adherance) {
				
				var left = (adherance[i].ticks - firstDay.getTime()) * timepx;

				var rectangle = svgContainer.append("rect")
           	.attr("x", left - 1)
            .attr("y", height.activity - (parseFloat(adherance[i].calculated) * (height.activity/2)/bolusMax) + height.xOffset +  height.bg + height.spacing - 4)
            .attr('fill', 'orange')
            .attr("width", 7)
            .attr("height", 4);
			}
		};	

		//drawDayLabels();
		drawEvents(pumpEvents);
		drawActualBasal(pumpInsulin);
		drawBolus(pumpInsulin);
		drawSettingBasal(pumpSettings);
		drawPortions();
		drawAdherence(pumpAdherence);
		drawCommentBubble(svgContainer, 100, height.xOffset + height.bg + height.spacing + height.activity/2  - 20);

		scroll();
	};
	return {
		scroll: scroll,
		draw: draw,
		scrollTicks: function() {
			return firstDay.getTime() + ($('#timelineContainer').scrollLeft()/timepx);
		}
	};
};