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
var typeHist = 'age';
var dataPath ='data/CPS85.csv';
var toolTip;

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
	initHistogram();
}

function initCanvas() {
	// set the dimensions and margins of the graph
	// set the ranges
	svg_margin = {top: 100, right: 30, bottom: 30, left: 200};
    svg_width = canvasWidth - svg_margin.left - svg_margin.right;
    svg_height = canvasHeight - svg_margin.top - svg_margin.bottom;

	canvas = d3.select("body").append("svg")
		    .attr("width", svg_width + svg_margin.left + svg_margin.right)
		    .attr("height", svg_height + svg_margin.top + svg_margin.bottom)
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

	var padding = 5;
	xScaleAge   = d3.scaleLinear()
	          		.domain([d3.min(dataAge, function(d){return d;}) - padding, 
	          			padding+d3.max(dataAge, function(d){return d;})])
	          		.range([0, svg_width]);

	xScaleWage  = d3.scaleLinear()
					.domain([d3.min(dataWage, function(d) {return d;}) - padding/2, 
							padding+d3.max(dataWage, function(d){return d;})])
					.range([0, svg_width]);

	xScaleExper = d3.scaleLinear()
					.domain([d3.min(dataExper, function(d) {return d;}) - padding/2,
							 padding+d3.max(dataExper, function(d){return d;})])
					.range([0, svg_width]);
	
	ageBins 	= d3.histogram()
					.domain(xScaleAge.domain())
					.thresholds(xScaleAge.ticks(20))
					(dataAge);
	wageBins 	= d3.histogram()
					.domain(xScaleWage.domain())
					.thresholds(xScaleWage.ticks(20))
					(dataWage);

	experBins 	= d3.histogram()
					.domain(xScaleExper.domain())
					.thresholds(xScaleExper.ticks(20))
					(dataAge);

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

function initHistogram () {	
	var xScale, yScale, bins;
	// var ticksHist = 20;

	if (typeHist == 'age') {
		xScale = xScaleAge;
		yScale = yScaleAge;
		bins =  ageBins;
	} else if (typeHist == 'wage') {
		xScale = xScaleWage;
		yScale = yScaleWage;
		bins =  wageBins;
	} else if (typeHist == 'exper') {
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
	    	.on("mouseover", handleMouseOver)
	    	.on("mouseout", handleMouseOut);

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


function handleMouseOver(d) {  // Add interactivity
	
    var bar = d3.select(this);

	if (typeHist == 'age') {
		xScale = xScaleAge;
		yScale = yScaleAge;
	} else if (typeHist == 'wage') {
		xScale = xScaleWage;
		yScale = yScaleWage;
	} else if (typeHist == 'exper') {
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

function handleMouseOut(d) {
	var bar = d3.select(this);
	bar.transition()
		.delay(170)
		.attr("x", whiteSpace)
		.attr("fill", "lightblue")
		.attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 2 *whiteSpace ; });
	    // .attr("height", function(d) { return svg_height - yScale(d.length); });

	toolTip.hide();
}




