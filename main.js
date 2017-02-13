var dataWage = [];
var dataAge = [];
var dataExper = [];
var dataEdu = [];
var dataMarried = [];

var canvas;
var canvasWidth = 850;
var canvasHeight = 700;
var whiteSpace = 2
var xScaleAge, yScaleAge,
	xScaleWage, yScaleWage,
	xScaleExper, yScaleExper,
	xScaleEdu, yScaleEdu,
	xScaleMarried, yScaleMarried;
var svg_margin, svg_width, svg_height;
var ageBins, wageBins, experBins, eduBins;
var attrType = "age";
var chartType = "bar";
var dataPath ="data/data.csv";
var toolTip;
var pieAge, pieWage, pieExper, pieEdu, pieMarried;
var ticksHist = 20;
var dragStartX, dragCurrentX;
var maxTicks;
var pixelsDragged = 20;
var pieBins;

//Menu stuff
window.onclick = function(event) {
  if (!event.target.matches(".dropbtn")) {
    var elements = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < elements.length; i++) {
      var element = elements[i];
      if (element.classList.contains("show")) {
        element.classList.remove("show");
      }
    }
  }
}

function attrTypeFunction() {
    document.getElementById("attrtypes").classList.toggle("show");
}

function chartTypeFunction() {
    document.getElementById("charttypes").classList.toggle("show");
}


function dataFunction(id) {
	clearCanvas();
	var elements = document.getElementById("attrtypes").children;
	var i;

	for (i=0; i < elements.length; i++) {
		var element = elements[i];
		if (id == element.id) {

			var selectElem = document.getElementById(id);
			d3.select(selectElem).attr("class", "selected");
			attrType = id;
			clearCanvas();
			initMain();
		} else {
			var selectElem = document.getElementById(element.id);
			d3.select(selectElem).attr("class", "dropdown");
		}
	}
}

//function to select the chart
function chartFunction(id) {
	clearCanvas();
	var elements = document.getElementById("charttypes").children;
	var i;

	for (i=0; i < elements.length; i++) {
		var element = elements[i];
		if (id == element.id) {
			var selectElem = document.getElementById(id);
			d3.select(selectElem).attr("class", "selected");
			chartType = id;
			clearCanvas();
			initMain();
		} else {
			var selectElem = document.getElementById(element.id);
			d3.select(selectElem).attr("class", "dropdown");
		}
	}
}



d3.csv(dataPath, function(error, data) {
	if (error) throw error;
    var temp = [];
	data.forEach(function(d) {
	    dataAge.push(parseInt(d.age));
	    dataWage.push(parseFloat(d.wage));
	    dataExper.push(parseInt(d.exper));
	    dataEdu.push(parseInt(d.educ));
	    temp.push(d.married);

	});

    dataMarried.push({"name":"Single", "value":0});
    dataMarried.push({"name":"Married", "value":0});
    dataMarried.push({"name":"Divorced", "value":0});
    dataMarried.push({"name":"Separated", "value":0});
    dataMarried.push({"name":"Widowed", "value":0});

    var j;
    for (let i of  temp ){
        for (j = 0; j < dataMarried.length; j++) {
            if (dataMarried[j].name == i) {
                dataMarried[j].value += 1;
            }
        }
    }

	initMain();
});


function initMain() {

	initCanvas();
	initCommonHist();
	initCommonPie();

	if (chartType == "bar") {
	    if (attrType == "married") {
	        initBarChart();
	    } else {
	        initHistogram();
		}
	} else if (chartType == "pie") {
		initPieChart();
	}
    //initBarChart();
}


function clearCanvas() {
	canvas.selectAll("*").remove();
	d3.selectAll("svg")
		.remove();
	toolTip.hide();
	d3.selectAll("#tooltip")
		.transition()
		.delay(20)
        .style("opacity", 0);

}

function initCanvas() {
	svg_margin = {top: 200, right: 30, bottom: 30, left: 50};
    svg_width = canvasWidth - svg_margin.left - svg_margin.right;
    svg_height = canvasHeight - svg_margin.top - svg_margin.bottom;
    maxTicks = 100;

	canvas = d3.select("body").append("svg")
			.attr("width", svg_width + svg_margin.left + svg_margin.right)
	    	.attr("height", svg_height + svg_margin.top + svg_margin.bottom)
	    	.attr("float", "none")
			.append("g")
			.attr("transform",
		          "translate(" + svg_margin.left + "," + svg_margin.top + ")");

	toolTip = d3.tip()
      			.attr("class", "d3-tip")
      			.offset([-20, 0])
      			.html(function(d) { return "<span style='color:red'>" + d + "</span>" });

    canvas.call(toolTip);
    d3.selectAll("svg").on("click", handleMouseClickSvg);

    d3.selectAll("svg").call(d3.drag()
                .on("start", dragStarted)
                .on("drag", draggedSpan));
}

function dragStarted() {
    if (chartType != "bar") {
        return;
    }
    dragStartX = d3.event.x;
}

function draggedSpan() {
    if (chartType != "bar") {
        return;
    }

    dragCurrentX = d3.event.x;
    if (Math.abs(dragCurrentX - dragStartX) > pixelsDragged) {
        if (dragCurrentX > dragStartX) {
            ticksHist += 5;
            if (ticksHist > maxTicks) {
                ticksHist = maxTicks;
                return;
            }
        } else {
            ticksHist -= 5;
        }
        dragStartX = dragCurrentX;
    }
    clearCanvas();
    initMain();
}


function handleMouseClickSvg() {
	if (chartType == "bar") {
		chartType = "pie"
	} else if (chartType == "pie") {
		chartType = "bar";
	}
	clearCanvas();
	initMain()
}


function initCommonHist() {
	var padding = 2;
	var i = 0;


	xScaleAge   = d3.scaleLinear()
	          		.domain([d3.min(dataAge, function(d){return d;}) - padding,
	          			padding+d3.max(dataAge, function(d){return d;})])
	          		.range([0, svg_width]);

	xScaleWage  = d3.scaleLinear()
					.domain([d3.min(dataWage, function(d) {return d;}) - padding,
							padding+d3.max(dataWage, function(d){return d;})])
					.range([0, svg_width]);

	xScaleExper = d3.scaleLinear()
					.domain([d3.min(dataExper, function(d) {return d;}) - padding,
							 padding+d3.max(dataExper, function(d){return d;})])
					.range([0, svg_width]);

	xScaleEdu	= d3.scaleLinear()
					.domain([d3.min(dataEdu, function(d){return d;}) - padding,
							padding + d3.max(dataEdu, function(d) {return d;})])
					.range([0, svg_width]);

    var xNames = [];
    var yValues = [];

    for (i = 0; i < dataMarried.length; i++) {
        xNames.push(dataMarried[i].name);
        yValues.push(dataMarried[i].value);
    }

    xScaleMarried = d3.scaleBand()
                        .rangeRound([0, svg_width]).padding(0.1)
                        .domain(xNames);
   // debugger
   // console.log(dataMarried, function(d, i) {return i;});

	ageBins 	= d3.histogram()
					.domain(xScaleAge.domain())
					.thresholds(xScaleAge.ticks(ticksHist))
					(dataAge);

	wageBins 	= d3.histogram()
					.domain(xScaleWage.domain())
					.thresholds(xScaleWage.ticks(ticksHist))
					(dataWage);

	experBins 	= d3.histogram()
					.domain(xScaleExper.domain())
					.thresholds(xScaleExper.ticks(ticksHist))
					(dataExper);

	eduBins		= d3.histogram()
					.domain(xScaleEdu.domain())
					.thresholds(xScaleEdu.ticks(ticksHist))
					(dataEdu);


	yScaleAge   = d3.scaleLinear()
			  		.domain([0, d3.max(ageBins, function(d){return d.length;})])
	          		.range([svg_height, 0]);

	yScaleWage  = d3.scaleLinear()
					.domain([0,d3.max(wageBins, function(d){return d.length;})])
					.range([svg_height,0 ]);

	yScaleExper = d3.scaleLinear()
					.domain([0, d3.max(experBins, function(d){return d.length;})])
					.range([svg_height,0 ]);

	yScaleEdu 	= d3.scaleLinear()
					.domain([0, d3.max(eduBins, function(d){return d.length;})])
					.range([svg_height, 0]);

    yScaleMarried = d3.scaleLinear()
                      .rangeRound([svg_height, 0])
                      .domain([0, d3.max(yValues)]);
    // debugger
    //console.log(d3.max(dataMarried, function(d,i) { return dataMarried[i];}));

}

function initCommonPie() {
	pieAge = d3.pie().value(function(d) {return d.length;});
	pieWage = d3.pie().value(function(d) {return d.length;});
	pieExper = d3.pie().value(function(d) {return d.length;});
	pieEdu = d3.pie().value(function(d) {return d.length;});
	pieMarried = d3.pie().value(function(d) {return d.value;})
}

function initBarChart() {
    var g = canvas.append("g");

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + svg_height + ")")
      .call(d3.axisBottom(xScaleMarried));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScaleMarried).ticks(10))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

    g.selectAll("rect")
        .data(dataMarried)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d){return xScaleMarried(d.name);})
        .attr("y", function(d){return yScaleMarried(d.value);})
        .attr("width", xScaleMarried.bandwidth())
        .attr("height", function(d) { return (svg_height - yScaleMarried(d.value));} )
        .attr("fill", "lightblue")
        .on("mouseover" , function(d) {
            d3.select(this)
                .transition()
                .delay(170)
                .attr("x", xScaleMarried(d.name) - 5)
                .attr("width", xScaleMarried.bandwidth() + 10)
                .attr("fill", "orangered");
            toolTip.show(d.value);
          })
        .on("mouseout", function(d){
            d3.select(this)
                .transition()
                .delay(170)
                .attr("x", xScaleMarried(d.name) + 5)
                .attr("width", xScaleMarried.bandwidth() - 10)
                .attr("fill", "lightblue");
            toolTip.hide();
        });
}

function initHistogram () {
	var xScale, yScale, bins;

	if (attrType == "age") {
		xScale = xScaleAge;
		yScale = yScaleAge;
		bins =  ageBins;
	} else if (attrType == "wage") {
		xScale = xScaleWage;
		yScale = yScaleWage;
		bins =  wageBins;
	} else if (attrType == "exper") {
		xScale = xScaleExper;
		yScale = yScaleExper;
		bins =  experBins;
	} else if (attrType == "educ") {
		xScale = xScaleEdu;
		yScale = yScaleEdu;
		bins = eduBins;
	}

  	var grpHist = canvas.selectAll(".bar")
      				.data(bins)
    				.enter();

    grpHist.append("rect")
            .on("mouseover", handleMouseOverBar)
	    	.on("mouseout", handleMouseOutBar)
    		.attr("fill", "lightblue")
	    	.attr("x", whiteSpace)
	    	.attr("transform", function(d) {
				return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
			.transition()
			.delay(function(d,i) {return Math.min(i, 50) * Math.min(d.length, 10);})
	    	.attr("width", function(d) {
	    		return xScale(d.x1) - xScale(d.x0) - 2 * whiteSpace; })
	    	.attr("height", function(d) {
	    		return svg_height - yScale(d.length);});

	canvas.append("g")
      .attr("transform", "translate(0," + svg_height + ")")
      .call(d3.axisBottom(xScale));

    canvas.append("g").append("text")
      .attr("transform",
            "translate(" + (svg_width/2) + " ," +
                           (svg_height + svg_margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Age in years");

  	canvas.append("g")
      .call(d3.axisLeft(yScale));

}


function handleMouseOverBar(d) {
    var bar = d3.select(this);

	if (attrType == "age") {
		xScale = xScaleAge;
		yScale = yScaleAge;
	} else if (attrType == "wage") {
		xScale = xScaleWage;
		yScale = yScaleWage;
	} else if (attrType == "exper") {
		xScale = xScaleExper;
		yScale = yScaleExper;
	} else if (attrType == "educ") {
		xScale = xScaleEdu;
		yScale = yScaleEdu;
	}

    bar.transition()
    	.delay(170)
    	.attr("x", -1*whiteSpace)
    	.attr("fill", "orangered")
       	.attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) + 2 * whiteSpace;})
       	.attr("height", function(d) { return svg_height - yScale(d.length) + 8 * whiteSpace; })
       	.attr("transform", "translate(" + xScale(d.x0) + "," +  (yScale(d.length) - 8 * whiteSpace) + ")");
    toolTip.show(d.length);
}

function handleMouseOutBar(d) {
	var bar = d3.select(this);
	bar.transition()
		.delay(170)
		.attr("x", whiteSpace)
		.attr("fill", "lightblue")
		.attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 2 * whiteSpace ; })
		.attr("height", function(d) {return svg_height - yScale(d.length);})
	    .attr("transform", "translate(" + xScale(d.x0) + "," +  yScale(d.length) + ")");

	toolTip.hide();
}


//PIE CHART
function initPieChart() {
	var outerRadius = svg_width / 3.5;
	var innerRadius = outerRadius/2;	
	
	var pie, data;
	if (attrType == "age") {
		pie = pieAge;
		data = ageBins;
	} else if (attrType == "wage") {
		pie = pieWage;
		data = wageBins;
	} else if (attrType == "exper") {
		pie = pieExper;
		data = experBins;
	} else if (attrType == "educ") {
		pie = pieEdu;
		data = eduBins;
	} else if (attrType == "married") {
        pie = pieMarried;
        data = dataMarried;
	}

	pieBins = data;

	var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var arcs = canvas.selectAll("g.arc")
        .data(pie(data))
        .enter()
           	.append("g")
        	.attr("class", "arc")
        	.attr("transform", "translate(" + svg_width/2 + ", " + svg_height/2 + ")");


    var color = d3.scaleOrdinal(d3.schemeCategory20);

    arcs.append("path");

    arcs.select("path")
        .transition()
        .delay(function(d, i) {return i*50;})
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);

    arcs.on("mouseover", handleMouseOverPie)
        .on("mouseout", handleMouseOutPie);

    
}


function  handleMouseOverPie(d,i) {
	var start, end;

	d3.select("#tooltip")
		.transition()
		.delay(100)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px")
        .style("opacity", 1)
        .select("#value")
        .text(d.value);

    canvas.append('text')
    		.attr('class', 'pietext')
            .attr("transform", function(d) {
                return "translate(" + svg_width/2 + "," + svg_height/2 + ")";
            })
            .attr("text-anchor", "middle")
            .text(function() {
                if (attrType == "married") {
                   return pieBins[i].name + " : " + d.value;
                } else {
                   return '[' + pieBins[i].x0 + "-" + pieBins[i].x1 + '] : ' + d.value + ' elements';
                }
            })
            .style("opacity", 0)
            .transition()
            .delay(100)
            .style("opacity", 1);
}


function handleMouseOutPie() {
	d3.select("#tooltip")
		.transition()
		.delay(200)
        .style("opacity", 0);

    canvas.selectAll("text")
    		.transition()
    		.delay(100)
    		.style("opacity", "0");
}

