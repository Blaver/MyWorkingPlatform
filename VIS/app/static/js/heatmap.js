/*
	A code template for a visualization heatmap
	Author : Nan Cao (nancao.org)
*/

vis.heatmap = function(){
	
	var heatmap = {},
		container = null,
		data = null,
		size = [960, 800],
		treatments=[],
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	heatmap.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return heatmap;
	};

	heatmap.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		return heatmap;
	};

	heatmap.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return heatmap;
	};

	heatmap.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return heatmap;
	};
	
	heatmap.treatments = function(_) {
		if (!arguments.length) return treatments;
		treatments = _;
		return heatmap;
	};

	heatmap.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
    
	///////////////////////////////////////////////////
	// Public Function
	heatmap.layout = function() {
       var medicine = ["1", "2", "3", "4", "5", "6", "7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24"];
         rect_width=15;
         container.attr("width",(treatments.length/3)*rect_width)
         			.attr("height",24*rect_width);
       var colours = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"];
		var heatmapColour = d3.scale.quantize()
  									.domain(d3.range(0,1, 1.0 / (colours.length - 1)))
  									.range(colours);
       var treat_gap=6;
       var rect_x=0,
       		rect_y=0;  
       var i=0,
       		j=0; 
       for(i=0;i<treatments.length/3;i++){
       		rect_y=0;
       		container.append("rect")
       				.attr("x",rect_x)
       				.attr("y",rect_y)
       				.attr("rx",4)
       				.attr("ry",4)
       				.attr("class","heat_rect")
       				.attr("id_x",i)
       				.attr("id_y",j)
       				.attr("width",rect_width)
       				.attr("height",rect_width)
       				.attr("stroke","#E6E6E6")
       				.attr("stroke-weight","2px")
       				.style("fill",function(){
       					return heatmapColour(treatments[i][j]);
       				}());
       		if(i%treat_gap==0){
       			container.append("line")
						.attr("x1",rect_x)
						.attr("y1",0)
						.attr("x2",rect_x)
						.attr("y2",24*rect_width)
						.attr("stroke",vis.dotted)
						.attr("stroke-width",1)
						.attr("stroke-dasharray","1,1");
       		}
       		for(j=0;j<23;j++){
       			container.append("rect")
       					.attr("x",rect_x)
       					.attr("y",rect_y)
       					.attr("rx",4)
       					.attr("ry",4)
       					.attr("class","heat_rect")
       					.attr("id_x",i)
       					.attr("id_y",j)
       					.attr("width",rect_width)
       					.attr("height",rect_width)
       					.attr("stroke","#E6E6E6")
       					.attr("stroke-weight","2px")
       					.style("fill",function(){
       					return heatmapColour(treatments[i][j]);
       				}());
       			rect_y=rect_y+rect_width+2;
       		}
       		rect_x=rect_x+rect_width+2;
       }
       $('.heat_rect').tipsy({
        		gravity: 'w', 
        		html: true, 
        		title: function() {
         	 		var id_x = $(this).attr("id_x");
         	 		var id_y = $(this).attr("id_y");
         	 		var str_result=function(){
         	 			var str="";
         	 			var num=treatments[id_x][id_y];
         	 			if(num.toFixed(3)>0){
         	 				str=num.toFixed(3);
         	 			}else{
         	 				str="0.0";
         	 			}
         	 			return str;
         	 		}();
	  				return str_result;
        		}
     	});
		return heatmap;
	};

	heatmap.render = function() {
	
		if(!container) {
			return;
		}

	
		return heatmap.update();
	};
		
	heatmap.update = function() {
		
		return heatmap;
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	
	function private_function1() {
		
	};
	
	function private_function2() {
		
	};
	
	function private_function3() {
		
	};
	
	return heatmap;
};

