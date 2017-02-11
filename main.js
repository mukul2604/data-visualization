var dataWage = [];
var dataAge = [];
var dataExper = []
var canvas;
var canvasWidth = 960;
var canvasHeight = 500;
var whiteSpace = 2
var xScaleAge, yScaleAge, 
	xScaleWage, yScaleWage, 
	xScaleExper, yScaleExper;
var svg_margin, svg_width, svg_height;
var ageBins, wageBins, experBins;
var attrType = "age";
var chartType = "bar";
var dataPath ="data/CPS85.csv";
var toolTip;
var pieAge, pieWage, pieExper;



//Menu stuff
// clean dropdown
window.onclick = function(event) {
	//console.log(event);
  if (!event.target.matches(".dropbtn")) {

    var elements = document.getElementsByClassName("dropdown-content");
  //  console.log(dropdowns);
    var i;
    for (i = 0; i < elements.length; i++) {
      var element = elements[i];
      if (element.classList.contains("show")) {
        element.classList.remove("show");
      }
    }
  }
}

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function attrTypeFunction() {
    document.getElementById("attrtypes").classList.toggle("show");
}

function chartTypeFunction() {
    document.getElementById("charttypes").classList.toggle("show");
}


function dataFunction(id) {
	clearCanvas();
	//document.getElementById("age").classList.toggle("show");
	var elements = document.getElementById("attrtypes").children;
	var i;

	for (i=0; i < elements.length; i++) {
		var element = elements[i];
		if (id == element.id) {
			clearCanvas();
			var selectElem = document.getElementById(id);
			d3.select(selectElem).attr("class", "selected");
			attrType = id;			
			//console.log(attrType);
			initMain();
		} else {
			var selectElem = document.getElementById(element.id);
			d3.select(selectElem).attr("class", "dropdown");
		}
	}
	// console.log(id);
}

function chartFunction(id) {
	clearCanvas();
	//document.getElementById("age").classList.toggle("show");
	var elements = document.getElementById("charttypes").children;
	var i;

	for (i=0; i < elements.length; i++) {
		var element = elements[i];
		if (id == element.id) {			
			var selectElem = document.getElementById(id);
			d3.select(selectElem).attr("class", "selected");
			chartType = id;			
			//console.log(attrType);
			initMain();
		} else {
			var selectElem = document.getElementById(element.id);
			d3.select(selectElem).attr("class", "dropdown");
		}
	}
	// console.log(id);
}


//start of function
// get the data
d3.csv(dataPath, function(error, data) {
	if (error) throw error;

	data.forEach(function(d) {
	    dataAge.push(parseInt(d.age));
	    dataWage.push(parseFloat(d.wage));
	    dataExper.push(parseInt(d.exper));
	});
	// console.log(dataAge);
	// console.log(dataWage);
	// console.log(dataExper);
	initMain();
});


function initMain() {		
	
	initCanvas();
	initCommonHist();	
	initCommonPie();

	if (chartType == "bar") {
		initHistogram();
	} else if (chartType == "pie") {
		initPieChart();
	}
}



function clearCanvas() {
	canvas.selectAll("*").remove();
	d3.selectAll("svg")
		.remove();

}

function initCanvas() {
	// set the dimensions and margins of the graph
	// set the ranges
	svg_margin = {top: 100, right: 30, bottom: 30, left: 50};
    svg_width = canvasWidth - svg_margin.left - svg_margin.right;
    svg_height = canvasHeight - svg_margin.top - svg_margin.bottom;

	canvas = d3.select("body").append("svg")
		    .attr("width", svg_width + svg_margin.left + svg_margin.right)
		    .attr("height", svg_height + svg_margin.top + svg_margin.bottom)
		    .attr("float", "none")
		  	.append("g")
		    .attr("transform", 
		          "translate(" + svg_margin.left + "," + svg_margin.top + ")");

	toolTip = d3.tip()
      			.attr("class", "d3-tip")
      			.offset([-8, 0])
      			.html(function(d) { return "<span style='color:red'>" + d + "</span>" });
    canvas.call(toolTip);
    // d3.select("body").append("div").attr("class", "toolTip");
}

function initCommonHist() {	

	var padding = 2;
	var ticksHist = 25;

	xScaleAge   = d3.scaleLinear()
	          		.domain([d3.min(dataAge, function(d){return d;}) - padding, 
	          			padding+d3.max(dataAge, function(d){return d;})])
	          		.range([0, svg_width]);

	xScaleWage  = d3.scaleLinear()
					.domain([d3.min(dataWage, function(d) {return d;}) - padding, 
							padding+d3.max(dataWage, function(d){return d;})])
					.range([0, svg_width]);
	//console.log(d3.min(dataExper, function(d) {return d;}));
	xScaleExper = d3.scaleLinear()
					.domain([d3.min(dataExper, function(d) {return d;}) - padding,
							 padding+d3.max(dataExper, function(d){return d;})])
					.range([0, svg_width]);
	
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

	yScaleAge   = d3.scaleLinear()
			  		.domain([0, d3.max(ageBins, function(d){return d.length;})])			
	          		.range([svg_height, 0]);

	yScaleWage  = d3.scaleLinear()
					.domain([0,d3.max(wageBins, function(d){return d.length;})])
					.range([svg_height,0 ]);

	yScaleExper = d3.scaleLinear()
					.domain([0, d3.max(experBins, function(d){return d.length;})])
					.range([svg_height,0 ]);	

}

function initCommonPie() {
	pieAge = d3.pie().value(function(d) {return d;});
	pieWage = d3.pie().value(function(d) {return d;});
	pieExper = d3.pie().value(function(d) {return d;});
}

function initHistogram () {	
	var xScale, yScale, bins;
	

	if (attrType == 'age') {
		xScale = xScaleAge;
		yScale = yScaleAge;
		bins =  ageBins;
	} else if (attrType == 'wage') {
		xScale = xScaleWage;
		yScale = yScaleWage;
		bins =  wageBins;
	} else if (attrType == 'exper') {
		xScale = xScaleExper;
		yScale = yScaleExper;
		bins =  experBins;
	}

  	var grpHist = canvas.selectAll(".bar")
      				.data(bins)
    				.enter();  						

    grpHist.append("rect")
    		.attr("fill", "lightblue")
	    	.attr("x", whiteSpace)
	    	.attr("transform", function(d) {
				return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
	    	.attr("width", function(d) { 
	    		return xScale(d.x1) - xScale(d.x0) - 2 * whiteSpace; })
	    	.attr("height", function(d) { 
	    		return svg_height - yScale(d.length); })
	    	.on("mouseover", handleMouseOverBar)
	    	.on("mouseout", handleMouseOutBar);

	canvas.append("g")
      .attr("transform", "translate(0," + svg_height + ")")
      .call(d3.axisBottom(xScale));

    canvas.append("g").append("text")             
      .attr("transform",
            "translate(" + (svg_width/2) + " ," + 
                           (svg_height + svg_margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Age in years");

  	// add the y Axis
	canvas.append("g")
      .call(d3.axisLeft(yScale));     

}


function handleMouseOverBar(d) {  // Add interactivity
	
    var bar = d3.select(this);

	if (attrType == 'age') {
		xScale = xScaleAge;
		yScale = yScaleAge;
	} else if (attrType == 'wage') {
		xScale = xScaleWage;
		yScale = yScaleWage;
	} else if (attrType == 'exper') {
		xScale = xScaleExper;
		yScale = yScaleExper;
	}

    bar.transition()
    	.delay(170)
    	.attr("x", -1*whiteSpace)
    	.attr("fill", "orangered")
       	.attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) + 2*whiteSpace;}); 
    toolTip.show(d.length);
}

function handleMouseOutBar(d) {
	var bar = d3.select(this);
	bar.transition()
		.delay(170)
		.attr("x", whiteSpace)
		.attr("fill", "lightblue")
		.attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 2 *whiteSpace ; });
	    // .attr("height", function(d) { return svg_height - yScale(d.length); });

	toolTip.hide();
}

//PIE CHART
function initPieChart() {	
	var outerRadius = svg_width * 0.3;
	var innerRadius = 0;
	var pie, data;
	if (attrType == "age") {
		pie = pieAge;
		data = dataAge;
	} else if (attrType == "wage") {
		pie = pieWage;
		data = dataWage;
	} else if (attrType == "exper") {
		pie = pieExper;
		data = dataExper;
	}
	var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
    
    var arcs = canvas.selectAll("g.arc")
        .data(pie(data))
        .enter()
        	.append("g")
        	.attr("class", "arc")
        	.attr("transform", "translate(" + (outerRadius) + ", " + (outerRadius-50) + ")");
        
    var color = d3.scaleOrdinal()
    			.range(["lightblue", "green", "red", "yellow", "pink", "orangered", "orange", 
    				    "blue", "green", "brown", "black"]);
    arcs.append("path");

    arcs.select("path")
        .transition()
        .delay(function(d, i) {return i;})
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);
}




