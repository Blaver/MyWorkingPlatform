/*
	A code template for a visualization component
	Author : Nan Cao (nancao.org)
*/

vis.horizonal = function(){
	
	var horizonal = {},
		container = null,
		svg_temp=null,
		svg_treat=null,
		data = null,
		size = [953, 206],
		hosp=null,
		scale=null;
		treatments=null,
		treat_arr=null,
		temp_arr=null,
		treat_hr_arr=[],
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	horizonal.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		svg_temp=container.append("svg")
			.attr("id","svg_temp")
			.attr("x",0)
			.attr("y",0)
			.attr("width",953)
			.attr("height",100);
		svg_treat=container.append("svg")
			.attr("id","svg_treat")
			.attr("x",0)
			.attr("y",103)
			.attr("width",953)
			.attr("height",100);
		
		temp_scale=d3.scale.pow();
    	temp_scale.domain([40,36])
    		.range([0,100]);
		
		return horizonal;
	};

	horizonal.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		return horizonal;
	};

	horizonal.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return horizonal;
	};

	horizonal.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return horizonal;
	};
	
	horizonal.hosp = function(_) {
		if (!arguments.length) return hosp;
		hosp = _;
		return horizonal;
	};
	
	horizonal.treatments = function(_) {
		if (!arguments.length) return treatments;
		treatments = _;
		return horizonal;
	};
	
	horizonal.treat_arr = function(_) {
		if (!arguments.length) return treat_arr;
		treat_arr = _;
		return horizonal;
	};
	
	horizonal.temp_arr = function(_) {
		if (!arguments.length) return temp_arr;
		temp_arr = _;
		return horizonal;
	};

	horizonal.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
    
	///////////////////////////////////////////////////
	// Public Function
	horizonal.layout = function() {
		
		// random
		
		return horizonal;
	};

	horizonal.render = function() {
		if(!container) {
			return;
		}
		d3.select("#svg_temp").text("");
		d3.select("#svg_treat").text("");
		var rect_temp = svg_temp.append("rect")
				.attr("x",0)
				.attr("y",0)
				.attr("width",953)
				.attr("height",100)
				.attr("fill","none")
				.attr("stroke",vis.border_blue)
				.attr("stroke-width",1);
		var rect_treat = svg_treat.append("rect")
				.attr("x",0)
				.attr("y",0)
				.attr("width",953)
				.attr("height",100)
				.attr("fill","none")
				.attr("stroke",vis.border_blue)
				.attr("stroke-width",1);
		drawBackground();
		return horizonal.update();
	};
		
	horizonal.update = function() {
		if(horizonal.hosp!=null){
			drawTempHorizonal();
			drawTreatHorizonal();
			$('.treat').tipsy({ 
        		gravity: 'w', 
        		html: true, 
        		title: function() {
         	 		var id = $(this).attr("id");
         	 		var str_result=function(){
         	 			var str=""; 
         	 			for(var i=0;i<treat_hr_arr[id-1].length;i++){
         	 				if(treat_hr_arr[id-1][i].toFixed(3)>0){
         	 					var num=treat_hr_arr[id-1][i];
         	 					str=str+i+":"+num.toFixed(3)+'<br>';
         	 				}
         	 			}
         	 			return str;
         	 		}();
	  				return str_result;
        		}
     		 });
		}
		return horizonal;
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	function drawBackground(){
		if(hosp!=null){
			line_gap=953/hosp;
			for(var i=0;i<hosp-1;i++){
				svg_temp.append("line")
						.attr("x1",line_gap*(i+1))
						.attr("y1",1)
						.attr("x2",line_gap*(i+1))
						.attr("y2",99)
						.attr("stroke",vis.dotted)
						.attr("stroke-width",1)
						.attr("stroke-dasharray","1,1");
				svg_treat.append("line")
						.attr("x1",line_gap*(i+1))
						.attr("y1",1)
						.attr("x2",line_gap*(i+1))
						.attr("y2",99)
						.attr("stroke",vis.dotted)
						.attr("stroke-width",1)
						.attr("stroke-dasharray","1,1");
			}
    		svg_temp.append("line")
    				.attr("x1",1)
    				.attr("y1",temp_scale(37.5))
    				.attr("x2",952)
    				.attr("y2",temp_scale(37.5))
    				.attr("stroke-width",1)
    				.attr("stroke","green");
		}
	}
	function drawTempHorizonal(){
		if(temp_arr!=null){
			var temp_arr_range=[];
			for(var i=0;i<temp_arr.length;i++){
				temp_arr_range.push(temp_scale(temp_arr[i]));
			}
			var temp_gap=731/temp_arr.length;
			var temp_node=[];
			for(var j=0;j<temp_arr_range.length;j++){
				temp_node.push([temp_gap*j,temp_arr_range[j]]);
			}
			var path = svg_temp.append('path')
    			.data([temp_node])
    			.attr('d', d3.svg.line().interpolate('linear'))
    			.attr('stroke-width', '1.5px')
    			.attr('fill', 'none')
    			.attr("stroke",vis.border_blue)
    			.attr('class', 'poly');
    		
		}
	}
	function drawTreatHorizonal(){
		treat_hr_arr=[];
		if(treat_arr!=null){
			var treat_width=100/(treatments+1);
			var treat_gap=3;
			var treat_length=((951-(hosp-1))/hosp-5*treat_gap)/6;
			var start_node=[];
			for(var i=0;i<treatments;i++){
				start_node=[1,treat_width*(i+1)];
				svg_treat.append("line")
						.attr("x1",1)
						.attr("y1",treat_width*(i+1))
						.attr("x2",952)
						.attr("y2",treat_width*(i+1))
						.attr("stroke",vis.dotted)
						.attr("stroke-width",1)
						.attr("stroke-dasharray","1,1");
				for(var j=0;j<hosp;j++){
					var treatment_day=treat_arr[i].slice(j*144,(j+1)*144-1);
					for(var n=0;n<6;n++){
						var treatment_hr = treatment_day.slice(n*24,(n+1)*24-1);
						treat_hr_arr.push(treatment_hr);
						if(Math.max.apply(null,treatment_hr)!=0){
							svg_treat.append('line')
									.attr("class","treat")
									.attr("id",function(){return treat_hr_arr.length;})
									.attr("x1",start_node[0])
									.attr("y1",start_node[1])
									.attr("x2",start_node[0]+treat_length)
									.attr("y2",start_node[1])
									.attr("stroke",vis.treat_color[i])
									.attr("stroke-width",1/2*treat_width-3);
							// svg_treat.append("line")
									// .attr("class","treatment")
									// .attr("x1",start_node[0])
									// .attr("y1",start_node[1])
									// .attr("x2",start_node[0]+treat_length)
									// .attr("y2",start_node[1])
									// .attr("stroke",vis.treat_color[i])
									// .attr("stroke-width",1/2*treat_width-3);
						}
						if(n==5){
								start_node[0]=start_node[0]+1+treat_length;
						}else{
							start_node[0]=start_node[0]+treat_gap+treat_length;
						}
					}	
				}
			}
			
		}
		heatmap.treatments(treat_hr_arr);
	}	
	function private_function1() {
		
	};
	
	function private_function2() {
		
	};
	
	function private_function3() {
		
	};
	
	return horizonal;
};

