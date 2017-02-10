var dataWage = [];
var dataAge = [];
var dataExper = []
var canvas;
var canvasWidth = 960;
var canvasHeight = 500;
var whiteSpace = 4
var xScaleAge, yScaleAge, 
	xScaleWage, yScaleWage, 
	xScaleExper, yScaleExper;
var svg_margin, svg_width, svg_height;
var ageBins, wageBins, experBins;
var typeHist = 'age';
var dataPath ='data/CPS85.csv';


// d3.csv(dataPath, function (error,data) {
// 	if (error) {
// 		console.log(error);
// 	} else {
// 		dataAge = data.map( function(i) {return parseInt(i.age);});	
// 	}
// });



// get the data
d3.csv(dataPath, function(error, data) {
	if (error) throw error;

	data.forEach(function(d) {
	    dataAge.push(parseInt(d.age));
	    dataWage.push(parseInt(d.wage));
	    dataExper.push(parseInt(d.exper));
	});

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
	svg_margin = {top: 10, right: 30, bottom: 30, left: 40};
    svg_width = canvasWidth - svg_margin.left - svg_margin.right;
    svg_height = canvasHeight - svg_margin.top - svg_margin.bottom;

	canvas = d3.select("body").append("svg")
		    .attr("width", svg_width + svg_margin.left + svg_margin.right)
		    .attr("height", svg_height + svg_margin.top + svg_margin.bottom)
		  	.append("g")
		    .attr("transform", 
		          "translate(" + svg_margin.left + "," + svg_margin.top + ")");
}

function initCommonHist() {	

	xScaleAge   = d3.scaleLinear()
	          		.domain([15, d3.max(dataAge, function(d){return d;})])
	          		.range([0, svg_width]);

	xScaleWage  = d3.scaleLinear()
					.domain([0, d3.max(dataWage, function(d){return d;})])
					.range([0, svg_width]);

	xScaleExper = d3.scaleLinear()
					.domain([0, d3.max(dataExper, function(d){return d;})])
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
	//console.log(dataAge);
	var xScale, yScale, bins;
	var ticksHist = 20;

	if (typeHist == 'age') {
		xScale = xScaleAge;
		yScale = yScaleAge;
		bins =  ageBins;
	} else if (typeHist == 'wage') {
		xScale = xScaleWage;
		yScale = yScaleWage;
		bins =  wageBins;
	} else if (typeHist == 'experience') {
		xScale = xScaleExper;
		yScale = yScaleExper;
		bins =  experBins;
	}
	
  	var grpRect = canvas.selectAll("rect")
      				.data(bins)
    				.enter();
    				
    			

    grpRect.append("rect")
    				.attr("fill", "blue")
	    			.attr("x", whiteSpace)
	    			.attr("transform", function(d) {
			  			return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
	    			.attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 2 * whiteSpace; })
	    			.attr("height", function(d) { return svg_height - yScale(d.length); })
	    			.on("mouseover", handleMouseOver)
	    			.on("mouseout", handleMouseOut);

	// grp.append("text")
	// 		.attr("transform", function(d){return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")";})
 	//           .style("fill", "black")
	 //           .style("font-size", "14px")          	
 	//           .attr("x", function (d) { return (xScale(d.x1) - xScale(d.x0) -1 )/ 2; })
 	//           .attr("y", function (d) { return yScale(d.length); })
 	//           .style("style", "label")
 	//           .text(function (d) { return d.length; });



	canvas.append("g")
      .attr("transform", "translate(0," + svg_height + ")")
      .call(d3.axisBottom(xScale));

  	// add the y Axis
	canvas.append("g")
      .call(d3.axisLeft(yScale));
      

}


function handleMouseOver(d) {  // Add interactivity
	// Use D3 to select element, change color and size
	console.log(this);
    var bar = d3.select(this);
    bar.append("g").append("text").text("hone");
    bar.transition()
    	.delay(100)
    	.attr("x", -1*whiteSpace)
    	.attr("fill", "orange")
       	.attr("width", function(d) { return xScaleAge(d.x1) - xScaleAge(d.x0) + 2*whiteSpace;});
        
                       
}

function handleMouseOut(d) {
	var bar = d3.select(this);
	bar.transition()
		.delay(100)
		.attr("x", whiteSpace)
		.attr("fill", "blue")
		.attr("width", function(d) { return xScaleAge(d.x1) - xScaleAge(d.x0) - 2 *whiteSpace ; })
	    .attr("height", function(d) { return svg_height - yScaleAge(d.length); });
}

//vizHistogram();
  // add the x Axis

// });



