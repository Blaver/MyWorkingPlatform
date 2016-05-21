/*
	A code template for a visualization scatterplot
	Author : Nan Cao (nancao.org)
*/

vis.scatterplot = function(){
	
	var scatterplot = {},
		container = null,
		data = null,
		size = [303, 303],
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	scatterplot.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return scatterplot;
	};

	scatterplot.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		console.log(data);
		return scatterplot;
	};

	scatterplot.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return scatterplot;
	};

	scatterplot.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return scatterplot;
	};

	scatterplot.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
    
	///////////////////////////////////////////////////
	// Public Function
	scatterplot.layout = function() {
		var width=size[0]-margin.left-margin.right;
		var height=size[1]-margin.top-margin.bottom;
		
		var x = d3.scale.linear().range([0, width]);
		var y = d3.scale.linear().range([height, 0]);
		
		var color = d3.scale.category20();
		
		var xAxis = d3.svg.axis()
						.scale(x)
    					.orient("bottom");
		var yAxis = d3.svg.axis()
    					.scale(y)
   					 	.orient("left");
   		//generate random data
   		for(var i=0;i<20;i++){
   			data[i]=Math.random();
   		}
		return scatterplot;
	};

	scatterplot.render = function() {
		if(!container) {
			return;
		}
	
		return scatterplot.update();
	};
		
	scatterplot.update = function() {
		return scatterplot;
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	
	function private_function1() {
		
	};
	
	function private_function2() {
		
	};
	
	function private_function3() {
		
	};
	
	return scatterplot;
};